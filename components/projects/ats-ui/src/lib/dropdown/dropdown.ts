import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { DROPDOWN, DropdownHost } from './dropdown-token';

/** Where the panel sits: in the flow (docs, static), or under its trigger. */
export type DropdownPlacement = 'inline' | 'bottom-start' | 'bottom-end';
/** The panel's ARIA role. Pick `menu` for actions, `listbox` for choosing a value. */
export type DropdownRole = 'listbox' | 'menu';

/** Rows the arrow keys move between: enabled Options and check-list checkboxes. */
const ITEMS = '.ats-option:not(.is-disabled), input.ats-checkbox:not(:disabled)';

/**
 * Dropdown (Figma: "dropdown", 338:7828 — Property 1=default 1883:1676; doc frame
 * "Appearance" 46:2164). "A general term for menu items or overflow experiences revealed
 * on click": the card (dropdown/color/*, general/level 4) that holds one or more Optgroups
 * (`ats-optgroup`, 8px apart) of Options (`[ats-option]`). Trigger-agnostic.
 *
 *   <div style="position: relative">
 *     <button ats-button [atsDropdownTrigger]="dd">Add to…</button>
 *     <ats-dropdown #dd role="menu" placement="bottom-start" [(open)]="open" (chosen)="run($event)">
 *       <ats-optgroup>
 *         <button ats-option value="list" icon="add">Add to list</button>
 *         <button ats-option value="seq">Add to Outreach sequence</button>
 *       </ats-optgroup>
 *     </ats-dropdown>
 *   </div>
 *
 * Behaviour:
 *  - `open` is two-way. Unset = always shown (a static panel, e.g. in docs); `false` hides it.
 *  - `placement` bottom-start / bottom-end positions it under the trigger (whose wrapper
 *    must be position: relative), left- or right-aligned.
 *  - Keyboard (focus inside the panel): ArrowDown / ArrowUp move (wrapping), Home / End
 *    jump; Enter / Space choose the focused option; Escape closes and returns focus to the
 *    trigger; Tab closes. Clicking outside (not the trigger) closes it.
 *  - Choosing an option emits `chosen` (its `value`) and, with a trigger and
 *    `closeOnChoose` (default on), closes and refocuses the trigger.
 *  - The trigger: `[atsDropdownTrigger]="dd"` (sets aria-haspopup / -expanded / -controls,
 *    toggles on click; Enter, Space or ArrowDown open on the first option, ArrowUp on the
 *    last), or pass any element as `anchor` and call `focusFirst()` yourself.
 * Not built: dropdown-header (1955:53740: tabs / search), dropdown-footer (478:12673),
 * filter-facet-dropdown (1474:50653).
 */
@Component({
  selector: 'ats-dropdown',
  template: '<ng-content />',
  styleUrl: './dropdown.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: DROPDOWN, useExisting: Dropdown }],
  host: {
    class: 'ats-dropdown',
    '[id]': 'id',
    '[attr.role]': 'role()',
    '[attr.data-placement]': 'placementName()',
    '[hidden]': 'open() === false',
    '(keydown)': 'onKey($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Dropdown implements DropdownHost {
  private static nextId = 0;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Open (two-way). Unset: always shown. */
  readonly open = model<boolean | undefined>();
  /** ARIA role of the panel (default listbox). */
  readonly roleInput = input<DropdownRole | undefined>(undefined, { alias: 'role' });
  /** inline (default) or under the trigger. */
  readonly placement = input<DropdownPlacement>();
  /** Close after an option is chosen (default on; only with a trigger / anchor). */
  readonly closeOnChoose = input<boolean | undefined, unknown>(undefined, { transform: (v: unknown) => (v === undefined ? undefined : booleanAttribute(v)) });
  /** The element that opens it, if not using `atsDropdownTrigger`. */
  readonly anchor = input<HTMLElement>();

  /** An option was chosen: its `value`. */
  readonly chosen = output<unknown>();

  readonly id = `ats-dropdown-${Dropdown.nextId++}`;
  readonly role = computed<DropdownRole>(() => this.roleInput() ?? 'listbox');
  protected readonly placementName = computed<DropdownPlacement>(() => this.placement() ?? 'inline');
  private readonly trigger = signal<HTMLElement | undefined>(undefined);
  private readonly anchorEl = computed(() => this.trigger() ?? this.anchor());

  /** Called by `atsDropdownTrigger`. */
  registerTrigger(el: HTMLElement | undefined): void {
    this.trigger.set(el);
  }

  /** Focus the first (or last) row, after the panel has rendered open. */
  focusFirst(): void { this.focusAt('first'); }
  focusLast(): void { this.focusAt('last'); }

  /** Close; optionally return focus to the trigger. */
  close(returnFocus = false): void {
    this.open.set(false);
    if (returnFocus) this.anchorEl()?.focus();
  }

  choose(value: unknown): void {
    this.chosen.emit(value);
    if (this.anchorEl() && this.closeOnChoose() !== false) this.close(true);
  }

  private items(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(ITEMS));
  }

  private focusAt(which: 'first' | 'last'): void {
    afterNextRender(() => {
      const els = this.items();
      els[which === 'first' ? 0 : els.length - 1]?.focus();
    }, { injector: this.injector });
  }

  protected onKey(e: KeyboardEvent): void {
    const els = this.items();
    const i = els.indexOf(document.activeElement as HTMLElement);
    const move = (n: number) => { e.preventDefault(); if (els.length) els[(n + els.length) % els.length].focus(); };
    switch (e.key) {
      case 'ArrowDown': move(i + 1); break;
      case 'ArrowUp': move(i < 0 ? els.length - 1 : i - 1); break;
      case 'Home': move(0); break;
      case 'End': move(els.length - 1); break;
      case 'Escape':
        if (this.open() !== undefined) { e.preventDefault(); e.stopPropagation(); this.close(true); }
        break;
      case 'Tab':
        if (this.open() !== undefined) this.close();
        break;
    }
  }

  protected onDocumentClick(e: MouseEvent): void {
    if (!this.open()) return;
    const t = e.target as Node;
    if (this.host.nativeElement.contains(t) || this.anchorEl()?.contains(t)) return;
    this.close();
  }
}

/**
 * DropdownTrigger: makes any element (usually a button) open a Dropdown.
 *
 *   <button ats-button [atsDropdownTrigger]="dd">Actions</button>
 *
 * Sets aria-haspopup / aria-expanded / aria-controls; click toggles; Enter, Space or
 * ArrowDown open on the first option, ArrowUp on the last; Escape closes.
 */
@Directive({
  selector: '[atsDropdownTrigger]',
  host: {
    '[attr.aria-haspopup]': 'dropdown().role()',
    '[attr.aria-expanded]': '!!dropdown().open()',
    '[attr.aria-controls]': 'dropdown().id',
    '(click)': 'toggle()',
    '(keydown)': 'onKey($event)',
  },
})
export class DropdownTrigger {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly dropdown = input.required<Dropdown>({ alias: 'atsDropdownTrigger' });

  constructor() {
    effect((onCleanup) => {
      const dd = this.dropdown();
      dd.registerTrigger(this.el.nativeElement);
      onCleanup(() => dd.registerTrigger(undefined));
    });
  }

  protected toggle(): void {
    const dd = this.dropdown();
    dd.open.set(!dd.open());
  }

  protected onKey(e: KeyboardEvent): void {
    const dd = this.dropdown();
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      dd.open.set(true);
      if (e.key === 'ArrowUp') dd.focusLast(); else dd.focusFirst();
    } else if (e.key === 'Escape' && dd.open()) {
      dd.close();
    }
  }
}

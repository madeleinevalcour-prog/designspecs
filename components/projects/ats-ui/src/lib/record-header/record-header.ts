import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
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
  viewChild,
  viewChildren,
} from '@angular/core';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

/** One value in the field summary row. */
export interface RecordHeaderField {
  label: string;
  value: string;
  /** text (default) · select (underline + chevron) · link · chip (Risk Level style). */
  kind?: 'text' | 'select' | 'link' | 'chip';
  /** For `link`. */
  href?: string;
  /** For `chip`: leading icon name. */
  icon?: string;
  /** For `link`: leading dot color (any CSS color / var()), e.g. an entity color. */
  dot?: string;
}

/** One section tab. */
export interface RecordHeaderTab {
  label: string;
  /** Shown as " (n)" after the label. */
  count?: number;
  /** Initial active tab (used when `activeTab` isn't set). */
  active?: boolean;
  /** Leading icon, tinted with the entity accent. */
  icon?: string;
}

/** Entity accents (Figma color/entity/*); unknown entities fall back to candidate. */
export type RecordHeaderEntity = 'candidate' | 'company' | 'job' | 'contact' | 'note' | 'task' | (string & {});

/** Toolbar buttons that report through the `action` output. */
export type RecordHeaderAction = 'copy-link' | 'pin' | 'refresh' | 'actions' | 'amplify' | 'layout' | `social:${string}`;

const ENTITY_ACCENTS = ['candidate', 'company', 'job', 'contact', 'note', 'task'];

/**
 * Record Header (Figma 222:16011, variants 3040:88434). The record Overview header:
 * three rows: a toolbar (entity avatar, title, optional Verified chip + social links,
 * icon actions, Actions / Amplify), the field summary, and the section tabs with
 * More / Layout. Ported from the prototype repo's RecordHeader.astro.
 *
 * Applied to a native <header>, so the landmark stays intact:
 *
 *   <header ats-record-header title="Nexus Dynamics" entity="company"
 *           [fields]="fields" [tabs]="tabs" verified [social]="['linkedin', 'location']"
 *           [(activeTab)]="tab" (action)="onAction($event)"></header>
 *
 * Behaviour: clicking a tab makes it active (two-way `activeTab`, `tabSelect` output).
 * Tabs that don't fit before the More / Layout buttons move into the More menu
 * (kept in sync with a ResizeObserver); the active tab never moves. The menu closes
 * on outside click, Escape, or picking an item (which selects that tab).
 */
@Component({
  selector: 'header[ats-record-header]',
  imports: [Button, Icon],
  templateUrl: './record-header.html',
  styleUrl: './record-header.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-rh',
    '[style.--ats-rh-accent]': 'accent()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class RecordHeader {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly title = input('');
  readonly entity = input<RecordHeaderEntity>('candidate');
  readonly fields = input<RecordHeaderField[]>([]);
  readonly tabs = input<RecordHeaderTab[]>([]);
  readonly verified = input(false, { transform: booleanAttribute });
  /** Social-link icon names (e.g. linkedin, location); each renders an icon button. */
  readonly social = input<string[]>([]);
  /** Index of the active tab. Defaults to the tab marked `active`, else the first. */
  readonly activeTab = model<number>();

  /** Emits the tab index when a tab (or its More-menu item) is picked. */
  readonly tabSelect = output<number>();
  /** Emits when a toolbar button is clicked. */
  readonly action = output<RecordHeaderAction>();

  protected readonly accent = computed(() => {
    const e = ENTITY_ACCENTS.includes(this.entity()) ? this.entity() : 'candidate';
    return `var(--color-entity-${e})`;
  });
  protected readonly avatarIcon = computed(() => (ENTITY_ACCENTS.includes(this.entity()) ? this.entity() : 'candidate'));
  protected readonly current = computed(() => {
    const set = this.activeTab();
    if (set != null) return set;
    const i = this.tabs().findIndex((t) => t.active);
    return i < 0 ? 0 : i;
  });

  /** Indices of tabs moved into the More menu. */
  protected readonly overflow = signal<number[]>([]);
  protected readonly menuOpen = signal(false);

  private readonly nav = viewChild.required<ElementRef<HTMLElement>>('nav');
  private readonly tabEls = viewChildren<ElementRef<HTMLButtonElement>>('tab');
  private readonly moreWrap = viewChild.required<ElementRef<HTMLElement>>('more');
  private readonly moreBtn = viewChild.required<string, ElementRef<HTMLElement>>('moreBtn', { read: ElementRef });
  private readonly menuItems = viewChildren<ElementRef<HTMLButtonElement>>('menuItem');

  private rendered = false;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.rendered = true;
      this.layout();
      const ro = new ResizeObserver(() => this.layout());
      ro.observe(this.nav().nativeElement);
      document.fonts?.ready.then(() => this.layout());
      destroyRef.onDestroy(() => ro.disconnect());
    });
    // Re-measure when the tab set or the active tab changes.
    effect(() => {
      this.tabs();
      this.current();
      queueMicrotask(() => this.layout());
    });
  }

  protected emitSocial(name: string): void {
    this.action.emit(`social:${name}`);
  }

  protected selectTab(i: number): void {
    this.activeTab.set(i);
    this.tabSelect.emit(i);
  }

  protected pickFromMenu(i: number): void {
    this.selectTab(i);
    this.closeMenu(true);
  }

  protected toggleMenu(event: Event): void {
    event.stopPropagation();
    const open = !this.menuOpen();
    this.menuOpen.set(open);
    if (open) setTimeout(() => this.menuItems()[0]?.nativeElement.focus());
  }

  protected onMenuKeydown(event: KeyboardEvent): void {
    const items = this.menuItems().map((r) => r.nativeElement);
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeMenu(true);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      items[(at + step + items.length) % items.length]?.focus();
    }
  }

  protected onDocumentClick(event: Event): void {
    if (this.menuOpen() && !this.moreWrap().nativeElement.contains(event.target as Node)) this.closeMenu(false);
  }

  private closeMenu(refocus: boolean): void {
    this.menuOpen.set(false);
    if (refocus) this.moreBtn().nativeElement.focus();
  }

  /**
   * Hide trailing tabs that would collide with the right-hand toolbar (skipping the
   * active one) and list them in the More menu. Measures the DOM directly, then
   * stores the result so the template's [hidden] bindings agree with it.
   */
  private layout(): void {
    if (!this.rendered || !this.host.isConnected) return;
    const nav = this.nav().nativeElement;
    const tabs = this.tabEls().map((r) => r.nativeElement);
    const active = this.current();
    tabs.forEach((t) => (t.hidden = false));
    const hidden: number[] = [];
    for (let i = tabs.length - 1; i >= 0 && nav.scrollWidth > nav.clientWidth + 1; i--) {
      if (i === active) continue;
      tabs[i].hidden = true;
      hidden.unshift(i);
    }
    const prev = this.overflow();
    if (prev.length !== hidden.length || prev.some((v, k) => v !== hidden[k])) this.overflow.set(hidden);
    if (!hidden.length && this.menuOpen()) this.menuOpen.set(false);
  }
}

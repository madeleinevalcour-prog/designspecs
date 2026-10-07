import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import {
  BOWLING_ALLEY_OVERLAY_GAP,
  BowlingAlleyController,
  BowlingAlleyEntityTab,
  BowlingAlleyNavState,
  BowlingAlleyOverlayKind,
} from './bowling-alley-controller';
import { FastFindResults, HelpOverlay } from './overlays';
import { Tooltip } from './tooltip';
import { Menu } from '../menu/menu';

export interface BowlingAlleySelection {
  overlay: BowlingAlleyOverlayKind | 'find';
  value: string;
}

/**
 * BowlingAlleyShell — layout + behaviour root for the bowling alley. Provides the
 * BowlingAlleyController, lays out the bowling alley and the scrolling page content
 * (default slot), and renders the page scrim, the overlays (the Menu, Add and user
 * menus are `<ats-menu>` variants; Help), the Fast Find results and the pin tooltip. Fills its container: give it a height.
 *
 *   <ats-bowling-alley-shell style="height: 100vh" (amplifyClick)="amplifyOpen = !amplifyOpen">
 *     <ats-bowling-alley />
 *     …page content…
 *   </ats-bowling-alley-shell>
 *
 * Keyboard: ⌘/Ctrl+B toggles the bowling alley open; Escape closes the open overlay
 * or Fast Find.
 */
@Component({
  selector: 'ats-bowling-alley-shell',
  imports: [Menu, HelpOverlay, FastFindResults, Tooltip],
  templateUrl: './bowling-alley-shell.html',
  styleUrl: './bowling-alley-shell.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BowlingAlleyController],
  host: {
    class: 'ats-bowling-alley-shell',
    '[attr.data-nav]': 'ctrl.nav()',
    '[attr.data-find]': "ctrl.findOpen() ? 'open' : null",
    '(document:keydown)': 'onKeydown($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class BowlingAlleyShell {
  readonly ctrl = inject(BowlingAlleyController);

  /** Starting nav state (also lets docs pin a state). Default collapsed. */
  readonly nav = input<BowlingAlleyNavState>();
  /** Freeze the nav state at `nav` (docs): no hover intent, no toggle. */
  readonly lockNav = input(false, { transform: booleanAttribute });
  /** Start in Fast Find mode (docs). */
  readonly findOpen = input(false, { transform: booleanAttribute });
  /** Starting record tabs (defaults to the prototype's five). */
  readonly tabs = input<BowlingAlleyEntityTab[]>();
  /** The current page is Amplify (full-page chat): highlight the Amplify tab instead of a record tab. */
  readonly amplifyActive = input(false, { transform: booleanAttribute });

  /** An overlay row / menu item / Fast Find result was picked. */
  readonly overlaySelect = output<BowlingAlleySelection>();
  /** The Amplify tab was clicked (the Amplify panel is a separate component). */
  readonly amplifyClick = output<void>();

  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly ovl = viewChild<ElementRef<HTMLElement>>('ovl');
  private readonly results = viewChild<ElementRef<HTMLElement>>('results');

  protected readonly scrim = computed(() => !!this.ctrl.overlay() || this.ctrl.findOpen());
  protected readonly overlayLabel = computed(() => {
    const k = this.ctrl.overlay()?.kind;
    return k === 'menu' ? (this.ctrl.menuMode() === 'edit' ? 'Edit Menu' : 'Menu') : k === 'add' ? 'Add' : k === 'help' ? 'Help' : 'User menu';
  });

  constructor() {
    this.ctrl.onAmplify = () => this.amplifyClick.emit();
    effect(() => this.ctrl.nav.set(this.nav() ?? 'collapsed'));
    effect(() => this.ctrl.locked.set(this.lockNav()));
    effect(() => {
      const on = this.findOpen();
      untracked(() => (on ? this.ctrl.findOpen.set(true) : this.ctrl.closeFind()));
    });
    effect(() => {
      const t = this.tabs();
      if (t) this.ctrl.setTabs(t);
    });
    effect(() => {
      const on = this.amplifyActive();
      this.ctrl.amplifyActive.set(on);
      if (on) untracked(() => this.ctrl.tabs.update((ts) => ts.map((x) => ({ ...x, active: false }))));
    });

    // place the overlay / results once rendered (and whenever they change)
    afterRenderEffect(() => {
      this.ctrl.stage = this.stage().nativeElement;
      const el = this.ovl()?.nativeElement;
      this.ctrl.overlayEl = el;
      this.ctrl.menuMode(); // Menu ⇄ Edit Menu changes the overlay's height: re-place
      if (el && this.ctrl.overlay()) this.placeOverlay(el);
      const res = this.results()?.nativeElement;
      if (res && this.ctrl.findOpen()) this.placeResults(res);
    });

    // Fast Find: the bowling alley widens, so re-place the results once that settles
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const onTransitionEnd = (e: TransitionEvent) => {
      const res = this.results()?.nativeElement;
      if (res && e.target === this.ctrl.alley) this.placeResults(res);
    };
    host.addEventListener('transitionend', onTransitionEnd);
    let fallback: ReturnType<typeof setTimeout> | undefined;
    effect(() => {
      if (!this.ctrl.findOpen()) return;
      clearTimeout(fallback);
      fallback = setTimeout(() => {
        const res = this.results()?.nativeElement;
        if (res) this.placeResults(res);
      }, 220);
    });
    inject(DestroyRef).onDestroy(() => {
      host.removeEventListener('transitionend', onTransitionEnd);
      clearTimeout(fallback);
    });
  }

  protected select(overlay: BowlingAlleyOverlayKind | 'find', value: string) {
    this.overlaySelect.emit({ overlay, value });
  }

  protected onKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      this.ctrl.toggleOpen();
    }
    if (e.key === 'Escape' && this.scrim()) this.ctrl.dismiss();
  }

  /** Close on an outside click (the openers and the Fast Find search excepted). */
  protected onDocumentClick(e: MouseEvent) {
    if (!this.scrim()) return;
    const t = e.target as HTMLElement | null;
    if (!t || !t.isConnected) return;
    if (this.ovl()?.nativeElement.contains(t) || this.results()?.nativeElement.contains(t)) return;
    if (t.closest('[data-opener], .ats-bowling-alley__find')) return;
    this.ctrl.dismiss();
  }

  /** 8px right of the opener; top / search / bottom aligned (Figma "Overlay Positioning"). */
  private placeOverlay(el: HTMLElement) {
    const o = this.ctrl.overlay();
    if (!o) return;
    const sr = this.stage().nativeElement.getBoundingClientRect();
    const a = o.anchor.getBoundingClientRect();
    // tall overlays (Menu, Edit Menu) scroll inside the stage (their cards use max-height: inherit)
    el.style.maxHeight = sr.height - 16 + 'px';
    // the Menu's 520px minimum height gives way when the stage is shorter
    el.style.setProperty('--ats-menu-max-height', sr.height - 16 + 'px');
    el.style.left = a.right - sr.left + BOWLING_ALLEY_OVERLAY_GAP + 'px';
    let top: number;
    if (o.align === 'bottom') top = a.bottom - sr.top - el.offsetHeight;
    else if (o.align === 'search') {
      const search = el.querySelector<HTMLElement>('.ats-search-input');
      top = a.top - sr.top - (search ? search.offsetTop : 0);
    } else top = a.top - sr.top;
    // clamp within the stage
    if (top + el.offsetHeight > sr.height - 8) top = sr.height - el.offsetHeight - 8;
    if (top < 8) top = 8;
    el.style.top = top + 'px';
  }

  /** Fast Find results: below the search, 4px gap, same width (Figma 1323:67008). */
  private placeResults(el: HTMLElement) {
    const si = this.ctrl.alley?.querySelector<HTMLElement>('.ats-bowling-alley__find');
    if (!si) return;
    const sr = this.stage().nativeElement.getBoundingClientRect();
    const r = si.getBoundingClientRect();
    el.style.left = r.left - sr.left + 'px';
    el.style.top = r.bottom - sr.top + 4 + 'px';
    el.style.width = r.width + 'px';
    el.style.maxHeight = sr.bottom - r.bottom - 12 + 'px';
  }
}

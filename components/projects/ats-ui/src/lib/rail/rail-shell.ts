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
import { AddOverlay, FastFindOverlay, MenuOverlay, UserOverlay } from './overlays';
import {
  RailController,
  RailEntityTab,
  RailFastFind,
  RailHoverOption,
  RailNavState,
  RailOverlayKind,
} from './rail-controller';
import { Tooltip } from './tooltip';

/**
 * RailShell — the layout + behaviour root for the rail (the prototype's `.proto`
 * stage). Provides the RailController, lays out the rail, an optional Header, the
 * scrolling canvas (default content) and the Amplify dock, and renders the overlay
 * layer and the pin tooltip. Fills its container: give it a height.
 *
 *   <ats-rail-shell hover="1" fastFind="1" style="height: 100vh">
 *     <ats-rail />
 *     <ats-header />            (shown only with [topbar]="true")
 *     …page content…
 *     <ats-amplify />
 *   </ats-rail-shell>
 *
 * Keyboard: ⌘/Ctrl+B toggles the rail open; Escape closes the open overlay.
 */
@Component({
  selector: 'ats-rail-shell',
  imports: [MenuOverlay, AddOverlay, UserOverlay, FastFindOverlay, Tooltip],
  templateUrl: './rail-shell.html',
  styleUrl: './rail-shell.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RailController],
  host: {
    class: 'ats-rail-shell',
    '[attr.data-nav]': 'ctrl.nav()',
    '[attr.data-hover]': 'ctrl.hoverOption()',
    '[attr.data-fastfind]': 'ctrl.fastFind()',
    '[attr.data-topbar]': "ctrl.topbar() ? 'on' : 'off'",
    '[attr.data-find]': "ctrl.findOpen() ? 'open' : null",
    '[attr.data-amplify]': "ctrl.amplify() ? 'on' : 'off'",
    '(document:keydown)': 'onKeydown($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class RailShell {
  readonly ctrl = inject(RailController);

  /** Starting nav state (also lets docs pin a state). Default collapsed. */
  readonly nav = input<RailNavState>();
  /** Hover treatment: 1 floating card (default), 2 flush overlay, 3 card in every state. */
  readonly hover = input<RailHoverOption>();
  /** Fast Find: 1 inline search in the rail (default), 2 wide overlay. */
  readonly fastFind = input<RailFastFind>();
  /** Top Bar layout: shows the Header; Find, Amplify and the user move out of the rail. */
  readonly topbar = input(false, { transform: booleanAttribute });
  /** Start with the Amplify panel open. */
  readonly amplifyOpen = input(false, { transform: booleanAttribute });
  /** Freeze the nav state at `nav` (docs): no hover intent, no toggle. */
  readonly lockNav = input(false, { transform: booleanAttribute });
  /** Starting record tabs (defaults to the prototype's five). */
  readonly tabs = input<RailEntityTab[]>();

  /** An overlay row / menu item / result was picked: { overlay, value }. */
  readonly overlaySelect = output<{ overlay: RailOverlayKind; value: string }>();

  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly ovl = viewChild<ElementRef<HTMLElement>>('ovl');

  protected readonly inlineFind = computed(() => this.ctrl.overlay()?.kind === 'find' && this.ctrl.findOpen());
  protected readonly overlayLabel = computed(() => {
    const k = this.ctrl.overlay()?.kind;
    return k === 'menu' ? 'Menu' : k === 'add' ? 'Add' : k === 'find' || k === 'tbfind' ? 'Fast Find' : 'User menu';
  });

  constructor() {
    effect(() => this.ctrl.nav.set(this.nav() ?? 'collapsed'));
    effect(() => this.ctrl.hoverOption.set(this.hover() ?? '1'));
    effect(() => {
      const ff = this.fastFind() ?? '1';
      untracked(() => {
        this.ctrl.fastFind.set(ff);
        this.ctrl.closeOverlay();
      });
    });
    effect(() => {
      const on = this.topbar();
      untracked(() => {
        this.ctrl.topbar.set(on);
        this.ctrl.closeOverlay();
      });
    });
    effect(() => this.ctrl.locked.set(this.lockNav()));
    effect(() => this.ctrl.amplify.set(this.amplifyOpen()));
    effect(() => {
      const t = this.tabs();
      if (t) this.ctrl.setTabs(t);
    });

    // place the overlay once it has rendered (and again whenever it changes)
    afterRenderEffect(() => {
      this.ctrl.stage = this.stage().nativeElement;
      const el = this.ovl()?.nativeElement;
      this.ctrl.overlayEl = el;
      if (el && this.ctrl.overlay()) this.place(el);
    });

    // Option 1 inline find: re-place after the rail's width transition settles
    const onTransitionEnd = (e: TransitionEvent) => {
      const el = this.ovl()?.nativeElement;
      if (el && e.target === this.ctrl.rail && this.inlineFind()) this.place(el);
    };
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    host.addEventListener('transitionend', onTransitionEnd);
    let fallback: ReturnType<typeof setTimeout> | undefined;
    effect(() => {
      if (!this.inlineFind()) return;
      clearTimeout(fallback);
      fallback = setTimeout(() => {
        const el = this.ovl()?.nativeElement;
        if (el && this.inlineFind()) this.place(el);
      }, 220);
    });
    inject(DestroyRef).onDestroy(() => {
      host.removeEventListener('transitionend', onTransitionEnd);
      clearTimeout(fallback);
    });
  }

  protected select(overlay: RailOverlayKind, value: string) {
    this.overlaySelect.emit({ overlay, value });
  }

  protected onKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      this.ctrl.toggleOpen();
    }
    if (e.key === 'Escape' && this.ctrl.overlay()) this.ctrl.closeOverlay();
  }

  /** Close the overlay on an outside click (openers and the search fields excepted). */
  protected onDocumentClick(e: MouseEvent) {
    const el = this.ovl()?.nativeElement;
    const t = e.target as HTMLElement | null;
    if (!el || !t || !t.isConnected || el.contains(t)) return;
    if (t.closest('[data-overlay], .ats-rail-findsearch, .ats-header__search, .ats-header__tab')) return;
    this.ctrl.closeOverlay();
    if (this.ctrl.nav() === 'hover' && !this.ctrl.railHovered() && !this.ctrl.locked()) this.ctrl.nav.set('collapsed');
  }

  /** Position the overlay against its anchor, inside the stage (port of openOverlay). */
  private place(el: HTMLElement) {
    const o = this.ctrl.overlay();
    if (!o) return;
    const sr = this.stage().nativeElement.getBoundingClientRect();

    if (this.inlineFind()) {
      // anchored under the rail's inline search, matched to its width
      const si = this.ctrl.rail?.querySelector<HTMLElement>('.ats-rail-findsearch');
      if (!si) return;
      const ar = si.getBoundingClientRect();
      el.style.width = ar.width + 'px';
      el.style.left = ar.left - sr.left + 'px';
      el.style.top = ar.bottom - sr.top + 8 + 'px';
      return;
    }

    const a = o.anchor.getBoundingClientRect();
    let top: number;
    if (o.below) {
      top = a.bottom - sr.top + 8;
      el.style.left = (o.alignLeft ? a.left - sr.left : Math.min(a.right - sr.left - o.width, sr.width - o.width - 8)) + 'px';
    } else {
      el.style.left = a.right - sr.left + 8 + 'px';
      if (o.section === 'bottom') top = a.bottom - sr.top - el.offsetHeight;
      else if (o.searchAlign) {
        const search = el.querySelector<HTMLElement>('.ats-search-input');
        top = a.top - sr.top - (search ? search.offsetTop : 0);
      } else top = a.top - sr.top;
    }
    // clamp within the stage
    if (top + el.offsetHeight > sr.height - 8) top = sr.height - el.offsetHeight - 8;
    if (top < 8) top = 8;
    el.style.top = top + 'px';
  }
}

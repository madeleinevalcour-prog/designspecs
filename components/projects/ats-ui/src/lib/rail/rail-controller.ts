import { Injectable, signal } from '@angular/core';

export type RailNavState = 'collapsed' | 'hover' | 'open';
/** Hover treatment: 1 = floating card, 2 = flush overlay, 3 = always a card. */
export type RailHoverOption = '1' | '2' | '3';
/** Fast Find: 1 = Find tab morphs into an inline search; 2 = wide overlay with its own search. */
export type RailFastFind = '1' | '2';
export type RailEntityType = 'candidate' | 'job' | 'note' | 'company' | 'contact';
export type RailOverlayKind = 'menu' | 'add' | 'find' | 'user' | 'tbfind' | 'tbuser';

export interface RailEntityTab {
  id: string;
  type: RailEntityType;
  label: string;
  /** Glyph override (defaults to the entity type), e.g. candidate-list. */
  icon?: string;
  pinned: boolean;
  active: boolean;
  /** Pin / close actions are hidden for unpinnable tabs (source: the "Add Note" tab). */
  pinnable?: boolean;
}

export interface RailOverlayRequest {
  kind: RailOverlayKind;
  anchor: HTMLElement;
  width: number;
  section: 'top' | 'bottom';
  /** Align the overlay's own search input with the anchor's top edge. */
  searchAlign?: boolean;
  /** Open below the anchor instead of to its right. */
  below?: boolean;
  alignLeft?: boolean;
}

export interface RailTooltip {
  text: string;
  x: number;
  y: number;
}

/** Starting record tabs (same as the prototype). */
export const RAIL_DEFAULT_TABS: RailEntityTab[] = [
  { id: 'candidates', type: 'candidate', label: 'Candidates', icon: 'candidate-list', pinned: false, active: true },
  { id: 'tyler', type: 'candidate', label: '213 | Tyler Brooks', pinned: true, active: false },
  { id: 'jobs', type: 'job', label: 'Jobs', icon: 'job-list', pinned: false, active: false },
  { id: 'swe', type: 'job', label: '425 | Software Engineer', pinned: false, active: false },
  { id: 'note', type: 'note', label: 'Add Note', pinned: false, active: false, pinnable: false },
];

/** Hover-intent timing (ms). Open is slow so incidental passes near the edge don't peek it open. */
export const RAIL_HOVER_OPEN_DELAY = 600;
export const RAIL_HOVER_CLOSE_DELAY = 200;

/**
 * RailController — the shared state for one rail layout (port of the prototype's
 * `scripts/rail.ts` global controller). Provided by `<ats-rail-shell>`, injected by
 * the rail, its tabs, the overlays, the header and the Amplify panel.
 *
 * Nav state machine: collapsed ⇄ hover (hover intent) and collapsed ⇄ open (toggle /
 * ⌘/Ctrl+B). An open overlay pins the hover state until it is dismissed.
 */
@Injectable()
export class RailController {
  readonly nav = signal<RailNavState>('collapsed');
  readonly hoverOption = signal<RailHoverOption>('1');
  readonly fastFind = signal<RailFastFind>('1');
  readonly topbar = signal(false);
  readonly amplify = signal(false);
  /** Fast Find option 1: the Find tab is showing as the inline search input. */
  readonly findOpen = signal(false);
  /** Text typed in whichever Fast Find search is driving the open results list. */
  readonly findQuery = signal('');
  readonly tabs = signal<RailEntityTab[]>(RAIL_DEFAULT_TABS.map((t) => ({ ...t })));
  readonly overlay = signal<RailOverlayRequest | null>(null);
  readonly tooltip = signal<RailTooltip | null>(null);
  readonly railHovered = signal(false);
  /** Freeze the nav state (docs / showcases): hover intent and the toggle do nothing. */
  readonly locked = signal(false);

  /** Set by the shell / rail / overlay layer so positions can be measured. */
  stage?: HTMLElement;
  rail?: HTMLElement;
  overlayEl?: HTMLElement;

  private findPrevNav: RailNavState | null = null;
  private initialTabs = RAIL_DEFAULT_TABS.map((t) => ({ ...t }));
  private openTimer?: ReturnType<typeof setTimeout>;
  private closeTimer?: ReturnType<typeof setTimeout>;

  setTabs(tabs: RailEntityTab[]) {
    this.initialTabs = tabs.map((t) => ({ ...t }));
    this.tabs.set(tabs.map((t) => ({ ...t })));
  }
  resetTabs() {
    this.tabs.set(this.initialTabs.map((t) => ({ ...t })));
  }

  // ---------- nav ----------
  toggleOpen() {
    if (this.locked()) return;
    if (this.nav() === 'open') {
      this.closeOverlay();
      this.nav.set('collapsed');
    } else this.nav.set('open');
  }

  railEnter() {
    this.railHovered.set(true);
    if (this.locked()) return;
    clearTimeout(this.closeTimer);
    clearTimeout(this.openTimer);
    this.openTimer = setTimeout(() => {
      if (this.nav() === 'collapsed' && this.railHovered()) this.nav.set('hover');
    }, RAIL_HOVER_OPEN_DELAY);
  }
  railLeave() {
    this.railHovered.set(false);
    if (this.locked()) return;
    clearTimeout(this.openTimer);
    if (this.nav() === 'hover') this.scheduleCollapse();
  }
  private scheduleCollapse() {
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      const overOverlay = !!this.overlayEl?.matches(':hover');
      if (this.nav() === 'hover' && !this.railHovered() && !overOverlay && !this.overlay()) this.nav.set('collapsed');
    }, RAIL_HOVER_CLOSE_DELAY);
  }

  // ---------- overlays ----------
  openOverlay(req: RailOverlayRequest) {
    if (this.overlay()?.kind === req.kind) {
      this.closeOverlay();
      return;
    }
    this.closeOverlay();
    this.overlay.set(req);
  }

  closeOverlay() {
    this.overlay.set(null);
    // revert the Option-1 inline Find search: search input → Find tab, restore nav
    if (this.findOpen()) {
      this.findOpen.set(false);
      this.findQuery.set('');
      if (this.findPrevNav) {
        this.nav.set(this.findPrevNav);
        this.findPrevNav = null;
      }
    }
  }

  /** Close from a search input's X: also collapses a hover-expanded rail. */
  dismissSearch() {
    this.closeOverlay();
    if (this.nav() === 'hover' && !this.locked()) this.nav.set('collapsed');
  }

  /** A rail opener was clicked (main tabs + the user foot item). */
  opener(kind: 'menu' | 'add' | 'find' | 'user' | 'amplify', anchor: HTMLElement) {
    if (kind === 'menu') this.openOverlay({ kind, anchor, width: 320, section: 'top', searchAlign: true });
    else if (kind === 'add') this.openOverlay({ kind, anchor, width: 232, section: 'top' });
    else if (kind === 'user') this.openOverlay({ kind, anchor, width: 200, section: 'bottom' });
    else if (kind === 'amplify') {
      this.closeOverlay();
      this.amplify.update((v) => !v);
    } else if (this.fastFind() === '1') this.openFindInline(anchor);
    else this.openOverlay({ kind: 'find', anchor, width: 600, section: 'top', searchAlign: true });
  }

  /** Option 1: expand the nav, morph Find into an inline search, list below it. */
  private openFindInline(anchor: HTMLElement) {
    if (this.overlay()?.kind === 'find') {
      this.closeOverlay();
      return;
    }
    this.closeOverlay();
    this.findPrevNav = this.nav() === 'open' || this.locked() ? this.nav() : 'collapsed';
    this.nav.set('open');
    this.findOpen.set(true);
    this.findQuery.set('');
    this.overlay.set({ kind: 'find', anchor, width: anchor.offsetWidth, section: 'top', below: true, alignLeft: true });
  }

  /** Is `kind` the overlay whose opener should show as active? */
  isOpen(kind: RailOverlayKind) {
    return this.overlay()?.kind === kind;
  }

  // ---------- entity tabs ----------
  activateTab(id: string) {
    this.tabs.update((ts) => ts.map((t) => ({ ...t, active: t.id === id })));
  }
  togglePin(id: string) {
    this.tabs.update((ts) => ts.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)));
    this.tooltip.set(null);
  }
  closeTab(id: string) {
    this.tabs.update((ts) => ts.filter((t) => t.id !== id));
  }
  clearTabs() {
    this.tabs.set([]);
  }
  /** Move `id` so it lands at `index` in the list without it. */
  moveTab(id: string, index: number) {
    this.tabs.update((ts) => {
      const moving = ts.find((t) => t.id === id);
      if (!moving) return ts;
      const rest = ts.filter((t) => t.id !== id);
      rest.splice(index, 0, moving);
      return rest;
    });
  }

  // ---------- tooltip ----------
  showTooltip(anchor: HTMLElement, text: string) {
    const r = anchor.getBoundingClientRect();
    const sr = this.stage?.getBoundingClientRect() ?? new DOMRect();
    // bottom-right: below the anchor; the top-left arrow (~15px in) points up at it
    this.tooltip.set({ text, x: r.left + r.width / 2 - sr.left - 15, y: r.bottom - sr.top + 2 });
  }
  hideTooltip() {
    this.tooltip.set(null);
  }
}

import { Injectable, signal } from '@angular/core';

export type BowlingAlleyNavState = 'collapsed' | 'hover' | 'open';
export type BowlingAlleyEntityType = 'candidate' | 'job' | 'note' | 'company' | 'contact';
/** Overlays opened from the bowling alley (Figma: Overlays + Overlay Positioning under 157:511). */
export type BowlingAlleyOverlayKind = 'menu' | 'add' | 'user' | 'help';

export interface BowlingAlleyEntityTab {
  id: string;
  type: BowlingAlleyEntityType;
  label: string;
  /** Glyph override (defaults to the entity type), e.g. candidate-list. */
  icon?: string;
  pinned: boolean;
  active: boolean;
  /** Pin / close actions are hidden for unpinnable tabs (source: the "Add Note" tab). */
  pinnable?: boolean;
}

/**
 * Where an overlay sits against the tab that opened it (Figma "Overlay Positioning"):
 * always 8px right of the tab; `top` = top edges in line (Add), `search` = the
 * overlay's search input in line with the tab's top (Menu), `bottom` = bottom edges
 * in line (user / Help, in the foot).
 */
export interface BowlingAlleyOverlayRequest {
  kind: BowlingAlleyOverlayKind;
  anchor: HTMLElement;
  align: 'top' | 'search' | 'bottom';
}

export interface BowlingAlleyTooltip {
  text: string;
  x: number;
  y: number;
}

/** Starting record tabs (same as the prototype). */
export const BOWLING_ALLEY_DEFAULT_TABS: BowlingAlleyEntityTab[] = [
  { id: 'candidates', type: 'candidate', label: 'Candidates', icon: 'candidate-list', pinned: false, active: true },
  { id: 'tyler', type: 'candidate', label: '213 | Tyler Brooks', pinned: true, active: false },
  { id: 'jobs', type: 'job', label: 'Jobs', icon: 'job-list', pinned: false, active: false },
  { id: 'swe', type: 'job', label: '425 | Software Engineer', pinned: false, active: false },
  { id: 'note', type: 'note', label: 'Add Note', pinned: false, active: false, pinnable: false },
];

/** Hover-intent timing (ms). Figma (State=Hover 2): expands 600ms after the pointer enters. */
export const BOWLING_ALLEY_HOVER_OPEN_DELAY = 600;
export const BOWLING_ALLEY_HOVER_CLOSE_DELAY = 200;
/** Overlay offset from the tab that opened it (Figma annotations: "8px away"). */
export const BOWLING_ALLEY_OVERLAY_GAP = 8;

/**
 * BowlingAlleyController — shared state for one bowling-alley layout. Provided by
 * `<ats-bowling-alley-shell>`, injected by the bowling alley, its tabs and overlays.
 *
 * Nav: collapsed ⇄ hover (hover intent, shown as a floating card) and
 * collapsed ⇄ open (toggle / ⌘/Ctrl+B). An open overlay holds the hover state.
 * Fast Find (Figma 1323:67008): Find turns into a search input, the bowling alley
 * widens over the page, and the results list opens below the search.
 */
@Injectable()
export class BowlingAlleyController {
  readonly nav = signal<BowlingAlleyNavState>('collapsed');
  /** Fast Find mode is on (Find tab shown as the search input, alley widened). */
  readonly findOpen = signal(false);
  /** Text typed in the Fast Find search. */
  readonly findQuery = signal('');
  readonly tabs = signal<BowlingAlleyEntityTab[]>(BOWLING_ALLEY_DEFAULT_TABS.map((t) => ({ ...t })));
  readonly overlay = signal<BowlingAlleyOverlayRequest | null>(null);
  readonly tooltip = signal<BowlingAlleyTooltip | null>(null);
  readonly hovered = signal(false);
  /** Freeze the nav state (docs / showcases): hover intent and the toggle do nothing. */
  readonly locked = signal(false);

  /** Set by the shell / bowling alley / overlay layer so positions can be measured. */
  stage?: HTMLElement;
  alley?: HTMLElement;
  overlayEl?: HTMLElement;
  /** Called when the Amplify tab is clicked (the shell re-emits it as `amplifyClick`). */
  onAmplify?: () => void;

  private initialTabs = BOWLING_ALLEY_DEFAULT_TABS.map((t) => ({ ...t }));
  private openTimer?: ReturnType<typeof setTimeout>;
  private closeTimer?: ReturnType<typeof setTimeout>;

  setTabs(tabs: BowlingAlleyEntityTab[]) {
    this.initialTabs = tabs.map((t) => ({ ...t }));
    this.tabs.set(tabs.map((t) => ({ ...t })));
  }
  resetTabs() {
    this.tabs.set(this.initialTabs.map((t) => ({ ...t })));
  }

  // ---------- nav ----------
  toggleOpen() {
    if (this.locked()) return;
    this.closeFind();
    this.closeOverlay();
    this.nav.set(this.nav() === 'open' ? 'collapsed' : 'open');
  }

  pointerEnter() {
    this.hovered.set(true);
    if (this.locked()) return;
    clearTimeout(this.closeTimer);
    clearTimeout(this.openTimer);
    this.openTimer = setTimeout(() => {
      if (this.nav() === 'collapsed' && this.hovered()) this.nav.set('hover');
    }, BOWLING_ALLEY_HOVER_OPEN_DELAY);
  }
  pointerLeave() {
    this.hovered.set(false);
    if (this.locked()) return;
    clearTimeout(this.openTimer);
    if (this.nav() === 'hover') this.scheduleCollapse();
  }
  private scheduleCollapse() {
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      const overOverlay = !!this.overlayEl?.matches(':hover');
      if (this.nav() === 'hover' && !this.hovered() && !overOverlay && !this.overlay() && !this.findOpen()) this.nav.set('collapsed');
    }, BOWLING_ALLEY_HOVER_CLOSE_DELAY);
  }
  /** After an overlay / Fast Find closes: collapse a hover-expanded alley the pointer has left. */
  settle() {
    if (this.nav() === 'hover' && !this.hovered() && !this.locked()) this.nav.set('collapsed');
  }

  // ---------- overlays ----------
  /** Open an overlay; the same opener again closes it, another opener swaps it. */
  openOverlay(req: BowlingAlleyOverlayRequest) {
    const same = this.overlay()?.kind === req.kind;
    this.closeFind();
    this.overlay.set(same ? null : req);
  }
  closeOverlay() {
    this.overlay.set(null);
  }
  /** Close whatever is open (overlay or Fast Find) — Escape, outside click, the search X. */
  dismiss() {
    this.closeOverlay();
    this.closeFind();
    this.settle();
  }

  /** A tab opener was clicked (main tabs + the foot's Help / user). */
  opener(kind: BowlingAlleyOverlayKind | 'find' | 'amplify', anchor: HTMLElement) {
    if (kind === 'find') this.toggleFind();
    else if (kind === 'amplify') {
      this.dismiss();
      this.onAmplify?.();
    } else if (kind === 'menu') this.openOverlay({ kind, anchor, align: 'search' });
    else if (kind === 'add') this.openOverlay({ kind, anchor, align: 'top' });
    else this.openOverlay({ kind, anchor, align: 'bottom' });
  }

  /** Is `kind` the overlay whose opener should show as active? */
  isOpen(kind: BowlingAlleyOverlayKind) {
    return this.overlay()?.kind === kind;
  }

  // ---------- Fast Find ----------
  toggleFind() {
    if (this.findOpen()) {
      this.dismiss();
      return;
    }
    this.closeOverlay();
    this.findQuery.set('');
    this.findOpen.set(true);
  }
  closeFind() {
    if (!this.findOpen()) return;
    this.findOpen.set(false);
    this.findQuery.set('');
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

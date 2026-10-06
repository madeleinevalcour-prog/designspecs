import { Injectable, computed, signal } from '@angular/core';
import { BOWLING_ALLEY_MENU_APPS, BOWLING_ALLEY_MENU_FOLDERS, BowlingAlleyMenuApp, BowlingAlleyMenuFolder } from './bowling-alley-data';

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

/** The Menu overlay shows the app grid (`menu`) or the Edit Menu (`edit`, Figma menu-edit). */
export type BowlingAlleyMenuMode = 'menu' | 'edit';

/** One block of the Menu grid: the ungrouped apps (no title), or a grouped folder. */
export interface BowlingAlleyMenuSection {
  id: string;
  /** Group label; undefined for the ungrouped block. */
  title?: string;
  apps: BowlingAlleyMenuApp[];
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

  // ---------- Menu (apps, Edit Menu, order) ----------
  /** Menu overlay mode: the app grid or the Edit Menu. */
  readonly menuMode = signal<BowlingAlleyMenuMode>('menu');
  /** App order in the Menu (ids); changed by drag-and-drop or Alt+Arrow keys. */
  readonly menuOrder = signal<string[]>(BOWLING_ALLEY_MENU_APPS.map((a) => a.id));
  /** Apps unchecked in the Edit Menu are hidden from the Menu. */
  readonly menuHidden = signal<ReadonlySet<string>>(new Set());
  /** The Edit Menu's folders, with their "Grouped" switch state. */
  readonly menuFolders = signal<BowlingAlleyMenuFolder[]>(BOWLING_ALLEY_MENU_FOLDERS.map((f) => ({ ...f })));

  /**
   * The Menu grid, in `menuOrder`: first the checked apps of folders that aren't
   * grouped (no label), then one labelled section per grouped folder.
   */
  readonly menuSections = computed<BowlingAlleyMenuSection[]>(() => {
    const byId = new Map(BOWLING_ALLEY_MENU_APPS.map((a) => [a.id, a]));
    const order = this.menuOrder();
    const hidden = this.menuHidden();
    const pick = (ids: Set<string>) => order.filter((id) => ids.has(id) && !hidden.has(id)).map((id) => byId.get(id)!);
    const folders = this.menuFolders();
    const loose = new Set(folders.filter((f) => !f.grouped).flatMap((f) => f.apps));
    const sections: BowlingAlleyMenuSection[] = [{ id: 'apps', apps: pick(loose) }];
    for (const f of folders.filter((x) => x.grouped)) sections.push({ id: f.id, title: f.title, apps: pick(new Set(f.apps)) });
    return sections.filter((x) => x.apps.length);
  });

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
    if (req.kind === 'menu') this.menuMode.set('menu');
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

  // ---------- Menu ----------
  setMenuMode(mode: BowlingAlleyMenuMode) {
    this.menuMode.set(mode);
  }
  /** Edit Menu check-list: checked = shown in the Menu. */
  setAppVisible(id: string, visible: boolean) {
    this.menuHidden.update((h) => {
      const next = new Set(h);
      if (visible) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  /** Edit Menu folder-title "Grouped" switch. */
  setFolderGrouped(id: string, grouped: boolean) {
    this.menuFolders.update((fs) => fs.map((f) => (f.id === id ? { ...f, grouped } : f)));
  }
  /** Move app `id` next to `targetId` (before it, or after it when `after`). */
  moveApp(id: string, targetId: string, after = false) {
    if (id === targetId) return;
    this.menuOrder.update((order) => {
      const rest = order.filter((x) => x !== id);
      const at = rest.indexOf(targetId);
      if (at < 0) return order;
      rest.splice(after ? at + 1 : at, 0, id);
      return rest;
    });
  }
  /** Keyboard reorder: move `id` by `delta` places within its Menu section. */
  moveAppBy(sectionId: string, id: string, delta: number) {
    const apps = this.menuSections().find((x) => x.id === sectionId)?.apps ?? [];
    const i = apps.findIndex((a) => a.id === id);
    if (i < 0) return;
    const j = Math.max(0, Math.min(apps.length - 1, i + delta));
    if (j !== i) this.moveApp(id, apps[j].id, j > i);
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

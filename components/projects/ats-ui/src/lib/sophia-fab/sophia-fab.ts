import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, afterNextRender, computed,
  effect, inject, input, model, numberAttribute, output, signal, untracked, viewChild,
} from '@angular/core';
import { Icon } from '../icon/icon';
import {
  SOPHIA_FAB_DRAG_THRESHOLD, SOPHIA_FAB_OPTIONS, SophiaFabPlacement, SophiaFabPosition, SophiaFabPt, SophiaFabSpot,
  SophiaFabZone, sophiaFabNearestSpot, sophiaFabSpotCenters,
} from './sophia-fab-geometry';

/**
 * Sophia FAB (Figma: Component Migration 6084:152232) — the Sophia support-chatbot
 * button. Port of the prototype repo's SophiaFab.astro + sophia-fab.ts.
 *
 * The host is a pointer-transparent layer that fills its nearest positioned
 * ancestor (the page stage); the FAB is a native <button> inside it and always sits
 * on one of its placement's spots. Drag it to snap to the nearest spot (drop targets
 * show while dragging), or use the arrow keys to step between spots.
 *
 *   <ats-sophia-fab placement="A" [railWidth]="64" [railZones]="zones" [(spot)]="spot"
 *                   (activate)="openChat()" (positionChange)="save($event)" />
 *
 * Placement: A inside the rail (32px) · B screen edges only (56px) · C outside the
 * rail edge (56px). Rail geometry comes in as inputs (no DOM querying).
 */
@Component({
  selector: 'ats-sophia-fab',
  imports: [Icon],
  templateUrl: './sophia-fab.html',
  styleUrl: './sophia-fab.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class SophiaFab {
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly btn = viewChild.required<ElementRef<HTMLButtonElement>>('btn');

  /** Placement option: A inside the rail · B screen edges · C outside the rail edge. */
  readonly placement = input<SophiaFabPlacement>();
  /** Current spot (two-way). Invalid / unset → the placement's default spot. */
  readonly spot = model<SophiaFabSpot>();
  /** Rendered rail width in px; option A centers in it (follows hover-peek). */
  readonly railWidth = input(64, { transform: numberAttribute });
  /** Committed rail width in px; option C parks 8px outside it. Defaults to railWidth. */
  readonly railCommittedWidth = input<number | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)),
  });
  /** Rail's left offset inside the container, px. */
  readonly railLeft = input(0, { transform: numberAttribute });
  /** Occupied vertical ranges in the rail (container px); option A docks in the gaps. */
  readonly railZones = input<SophiaFabZone[]>([]);
  /** Accessible name. Default "Sophia — drag to move". */
  readonly label = input<string>();

  /** Fires when the FAB settles on a spot (first placement, drop, keyboard, reflow). */
  readonly positionChange = output<SophiaFabPosition>();
  /** Fires on a click / Enter / Space that wasn't the end of a drag. */
  readonly activate = output<void>();

  protected readonly resolvedPlacement = computed<SophiaFabPlacement>(() => {
    const p = this.placement();
    return p === 'B' || p === 'C' ? p : 'A';
  });
  protected readonly resolvedSpot = computed<SophiaFabSpot>(() => {
    const opt = SOPHIA_FAB_OPTIONS[this.resolvedPlacement()];
    const s = this.spot();
    return s && opt.spots.includes(s) ? s : opt.fallback;
  });
  protected readonly iconSize = computed(() => (this.resolvedPlacement() === 'A' ? 16 : 24));
  protected readonly hostClass = computed(() => `ats-sophia-fab ats-sophia-fab--${this.resolvedPlacement()}`);

  protected readonly dragging = signal(false);
  protected readonly nearest = signal<SophiaFabSpot | null>(null);
  protected readonly targets = signal<(SophiaFabPt & { spot: SophiaFabSpot })[]>([]);

  private readonly box = signal({ w: 0, h: 0 });
  private readonly centers = computed(() => {
    const { w, h } = this.box();
    return sophiaFabSpotCenters(this.resolvedPlacement(), w, h, {
      left: this.railLeft(),
      width: this.railWidth(),
      committedWidth: this.railCommittedWidth() ?? this.railWidth(),
      zones: this.railZones(),
    });
  });

  private placed = false;
  private lastPlacement?: SophiaFabPlacement;
  private press: { id: number; x: number; y: number; dx: number; dy: number; centers: Partial<Record<SophiaFabSpot, SophiaFabPt>> } | null = null;
  private suppressClick = false;

  constructor() {
    afterNextRender(() => {
      const measure = () => {
        const r = this.host.getBoundingClientRect();
        if (r.width !== this.box().w || r.height !== this.box().h) this.box.set({ w: r.width, h: r.height });
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(this.host);
      this.destroyRef.onDestroy(() => ro.disconnect());
    });

    // Re-place on any input / size change; a placement switch (or first paint) snaps without the tween.
    effect(() => {
      const centers = this.centers();
      const spot = this.resolvedSpot();
      const placement = this.resolvedPlacement();
      if (!this.box().w) return;
      untracked(() => {
        if (this.dragging()) return;
        const snap = !this.placed || placement !== this.lastPlacement;
        this.lastPlacement = placement;
        this.moveTo(centers[spot]!, snap);
        this.positionChange.emit({ spot, ...centers[spot]! });
      });
    });
  }

  private moveTo(p: SophiaFabPt, snap = false) {
    const el = this.btn().nativeElement;
    const half = SOPHIA_FAB_OPTIONS[this.resolvedPlacement()].size / 2;
    if (snap) el.classList.add('is-snapping');
    el.style.left = `${p.x - half}px`;
    el.style.top = `${p.y - half}px`;
    if (snap) {
      void el.offsetWidth; // commit before re-enabling the tween
      el.classList.remove('is-snapping');
    }
    if (!this.placed) { this.placed = true; el.classList.add('is-placed'); }
  }

  private pointerPt(e: PointerEvent): SophiaFabPt {
    const r = this.host.getBoundingClientRect();
    return { x: e.clientX - this.press!.dx - r.left, y: e.clientY - this.press!.dy - r.top };
  }

  protected onPointerDown(e: PointerEvent) {
    this.suppressClick = false; // a click swallowed by a drag never leaks into the next press
    if (e.button !== 0) return;
    const fr = this.btn().nativeElement.getBoundingClientRect();
    this.press = {
      id: e.pointerId, x: e.clientX, y: e.clientY,
      // pointer offset from the FAB center, so the FAB doesn't jump under the cursor
      dx: e.clientX - (fr.left + fr.width / 2), dy: e.clientY - (fr.top + fr.height / 2),
      centers: this.centers(),
    };
    try { this.btn().nativeElement.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
  }

  protected onPointerMove(e: PointerEvent) {
    const press = this.press;
    if (!press || e.pointerId !== press.id) return;
    if (!this.dragging() && Math.hypot(e.clientX - press.x, e.clientY - press.y) < SOPHIA_FAB_DRAG_THRESHOLD) return;
    if (!this.dragging()) {
      this.dragging.set(true);
      this.targets.set((Object.keys(press.centers) as SophiaFabSpot[]).map((spot) => ({ spot, ...press.centers[spot]! })));
    }
    const p = this.pointerPt(e);
    this.moveTo(p);
    this.nearest.set(sophiaFabNearestSpot(p, press.centers));
  }

  protected endPress(e: PointerEvent) {
    const press = this.press;
    if (!press || e.pointerId !== press.id) return;
    if (this.dragging()) {
      const spot = sophiaFabNearestSpot(this.pointerPt(e), press.centers);
      this.dragging.set(false); // tween resumes → snaps into place with the standard easing
      this.nearest.set(null);
      this.suppressClick = true;
      if (spot === this.resolvedSpot()) {
        this.moveTo(press.centers[spot]!);
        this.positionChange.emit({ spot, ...press.centers[spot]! });
      } else {
        this.spot.set(spot); // the effect re-places and emits
      }
    }
    this.press = null;
  }

  protected onClick() {
    if (this.suppressClick) { this.suppressClick = false; return; }
    this.activate.emit();
  }

  /** Arrow keys step to the nearest spot in that direction. */
  protected onKeydown(e: KeyboardEvent) {
    this.suppressClick = false;
    const dir = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } as Record<string, number[]>)[e.key];
    if (!dir) return;
    e.preventDefault();
    const centers = this.centers();
    const from = centers[this.resolvedSpot()]!;
    let best: SophiaFabSpot | null = null, bestD = Infinity;
    for (const sp of Object.keys(centers) as SophiaFabSpot[]) {
      const c = centers[sp]!;
      const along = (c.x - from.x) * dir[0] + (c.y - from.y) * dir[1];
      if (along <= 1) continue;
      const d = Math.hypot(c.x - from.x, c.y - from.y);
      if (d < bestD) { bestD = d; best = sp; }
    }
    if (best) this.spot.set(best);
  }
}

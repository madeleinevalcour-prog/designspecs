import { Component, computed, input, linkedSignal, numberAttribute, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Button, SophiaFab, SophiaFabPlacement, SophiaFabPosition, SophiaFabSpot, SophiaFabZone } from 'ats-ui';

const BOWLING_ALLEY_COLLAPSED = 64; // prototype --bowling-alley-w
const BOWLING_ALLEY_OPEN = 258;     // prototype --panel-w

/**
 * /sophia-fab — the Sophia FAB on a mock page stage with a stand-in bowling alley (gray
 * blocks mark the bowling alley's occupied zones: nav at the top, open tabs, foot at the
 * bottom). The reference view has a placement switcher (A / B / C) plus bowling alley and
 * tab toggles; drag the FAB or use the arrow keys to move it between spots.
 *
 * Embed mode: pass any of these to render one compact stage for a docs page, e.g.
 *   /examples/sophia-fab?placement=B&spot=right-middle
 * Params: placement = A (default) | B | C,
 *         spot (a spot of that placement; default = the placement's default spot),
 *         bowlingAlley = collapsed (default) | open,
 *         tabs = number of open record tabs in the mock bowling alley (default 3),
 *         height = stage height in px (default 360).
 */
@Component({
  imports: [Button, DecimalPipe, SophiaFab],
  selector: 'app-sophia-fab-page',
  styleUrl: './sophia-fab-page.css',
  templateUrl: './sophia-fab-page.html',
})
export class SophiaFabPage {
  // Bound from query params. Absent params arrive as `undefined`; defaults are applied below.
  readonly placement = input<SophiaFabPlacement>();
  readonly spot = input<SophiaFabSpot>();
  readonly bowlingAlley = input<'collapsed' | 'open'>();
  readonly tabs = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null ? undefined : numberAttribute(v)) });
  readonly height = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null ? undefined : numberAttribute(v)) });

  protected readonly embed = computed(() => !!(this.placement() || this.spot() || this.bowlingAlley()));
  protected readonly placements: { id: SophiaFabPlacement; name: string }[] = [
    { id: 'A', name: 'Inside the bowling alley' },
    { id: 'B', name: 'Screen edges only' },
    { id: 'C', name: 'Outside the bowling alley' },
  ];

  // Live state (reference view starts from the query params, then the controls take over).
  protected readonly current = linkedSignal<SophiaFabPlacement>(() => {
    const p = this.placement();
    return p === 'B' || p === 'C' ? p : 'A';
  });
  /** One remembered spot per placement, like the prototype. */
  protected readonly spots = signal<Partial<Record<SophiaFabPlacement, SophiaFabSpot>>>({});
  protected readonly currentSpot = computed(() => this.spots()[this.current()] ?? this.spot());
  protected readonly bowlingAlleyOpen = linkedSignal(() => this.bowlingAlley() === 'open');
  protected readonly tabCount = linkedSignal(() => Math.max(0, Math.min(6, this.tabs() ?? 3)));
  protected readonly stageHeight = computed(() => this.height() ?? (this.embed() ? 360 : 520));
  protected readonly last = signal<SophiaFabPosition | null>(null);
  protected readonly activations = signal(0);

  protected readonly bowlingAlleyWidth = computed(() => (this.bowlingAlleyOpen() ? BOWLING_ALLEY_OPEN : BOWLING_ALLEY_COLLAPSED));
  /** Mock bowling alley zones (stage px): nav head, one 40px row per open tab, the foot. */
  protected readonly zones = computed<SophiaFabZone[]>(() => {
    const h = this.stageHeight();
    const z: SophiaFabZone[] = [{ top: 16, bottom: 64 }];
    for (let i = 0; i < this.tabCount(); i++) z.push({ top: 80 + i * 44, bottom: 80 + i * 44 + 36 });
    z.push({ top: h - 56, bottom: h - 16 });
    return z;
  });

  protected setPlacement(p: SophiaFabPlacement) { this.current.set(p); }
  protected setSpot(s: SophiaFabSpot) { this.spots.update((m) => ({ ...m, [this.current()]: s })); }
}

import { NgTemplateOutlet } from '@angular/common';
import { Component, booleanAttribute, computed, input, signal } from '@angular/core';
import {
  BowlingAlley,
  BowlingAlleyNavState,
  BowlingAlleyShell,
  FastFindResults,
  HelpOverlay,
  Menu,
  Tooltip,
} from 'ats-ui';

type View = 'layout' | 'overlay' | 'tooltip';
type OverlayView = 'menu' | 'edit' | 'add' | 'user' | 'help' | 'find';
const flag = (v: unknown) => v != null && booleanAttribute(v);

/**
 * /bowling-alley — the Bowling Alley navigation with its overlays and Fast Find.
 *
 * Embed mode: pass `view` to render one piece for a docs page, e.g.
 *   /examples/bowling-alley?view=layout&nav=open&lock=true
 * Params:
 *   view = layout | overlay | tooltip
 *   layout: nav = collapsed | hover | open (default collapsed), lock = true (freeze nav),
 *     find = true (start in Fast Find mode), userOnly = true (collapsed footer shows only
 *     the avatar), height (px, default 640).
 *   overlay: overlay = menu | edit | add | user | help | find (default menu; menu / edit / add / user
 *     render <ats-menu>, edit = the Menu in edit mode; the Menu page has the full set); query (find only:
 *     shows the "View All" search state).
 *   tooltip: text (default "Pin").
 */
@Component({
  imports: [NgTemplateOutlet, BowlingAlleyShell, BowlingAlley, Tooltip, Menu, HelpOverlay, FastFindResults],
  selector: 'app-bowling-alley-page',
  styleUrl: './bowling-alley-page.css',
  templateUrl: './bowling-alley-page.html',
})
export class BowlingAlleyPage {
  // Bound from query params. Absent params arrive as `undefined`, so defaults live in computeds.
  readonly view = input<View>();
  readonly nav = input<BowlingAlleyNavState>();
  readonly lock = input(false, { transform: flag });
  readonly find = input(false, { transform: flag });
  readonly userOnly = input(false, { transform: flag });
  readonly height = input<string>();
  readonly overlay = input<OverlayView>();
  readonly query = input<string>();
  readonly text = input<string>();

  protected readonly embed = computed(() => !!this.view());
  protected readonly embedNav = computed(() => this.nav() ?? 'collapsed');
  protected readonly embedHeight = computed(() => Number(this.height()) || 640);
  protected readonly embedOverlay = computed(() => this.overlay() ?? 'menu');
  protected readonly embedQuery = computed(() => this.query() ?? '');
  protected readonly embedText = computed(() => this.text() ?? 'Pin');

  protected readonly navStates: BowlingAlleyNavState[] = ['collapsed', 'hover', 'open'];
  protected readonly lastPick = signal('');
}

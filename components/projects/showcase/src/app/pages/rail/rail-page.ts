import { NgTemplateOutlet } from '@angular/common';
import { Component, booleanAttribute, computed, input, signal } from '@angular/core';
import {
  AddOverlay,
  Amplify,
  FastFindOverlay,
  Header,
  ListItem,
  MenuOverlay,
  RAIL_FAST_FIND_RESULTS,
  Rail,
  RailFastFind,
  RailHoverOption,
  RailNavState,
  RailShell,
  SearchInput,
  Tooltip,
  UserOverlay,
} from 'ats-ui';

type View = 'layout' | 'rail' | 'search-input' | 'list-item' | 'tooltip' | 'overlay' | 'amplify' | 'header';
type OverlayView = 'menu' | 'add' | 'user' | 'find' | 'find-inline';
const flag = (v: unknown) => v != null && booleanAttribute(v);

/**
 * /rail — Rail ("Bowling Alley") + Header + Amplify working together, then every
 * piece on its own.
 *
 * Embed mode: pass `view` to render one piece for a docs page, e.g.
 *   /examples/rail?view=layout&nav=open&topbar=true&amplify=true
 * Params:
 *   view = layout | rail | search-input | list-item | tooltip | overlay | amplify | header
 *   layout / rail: nav = collapsed | hover | open (default collapsed), hover = 1 | 2 | 3,
 *     fastFind = 1 | 2, topbar = true, amplify = true (Amplify open), lock = true (freeze nav),
 *     userOnly = true (collapsed foot shows only the avatar), height (px, default 640 / 560).
 *     `view=rail` is the rail alone (no header / Amplify) with a blank canvas.
 *   overlay: overlay = menu | add | user | find | find-inline (default menu).
 *   search-input: state = default | active, placeholder.
 *   list-item: entity (default all four sample results).
 *   tooltip: text (default "Pin").
 */
@Component({
  imports: [NgTemplateOutlet, RailShell, Rail, Header, Amplify, SearchInput, ListItem, Tooltip, MenuOverlay, AddOverlay, UserOverlay, FastFindOverlay],
  selector: 'app-rail-page',
  styleUrl: './rail-page.css',
  templateUrl: './rail-page.html',
})
export class RailPage {
  // Bound from query params. Absent params arrive as `undefined`, so defaults live in computeds.
  readonly view = input<View>();
  readonly nav = input<RailNavState>();
  readonly hover = input<RailHoverOption>();
  readonly fastFind = input<RailFastFind>();
  readonly topbar = input(false, { transform: flag });
  readonly amplify = input(false, { transform: flag });
  readonly lock = input(false, { transform: flag });
  readonly userOnly = input(false, { transform: flag });
  readonly height = input<string>();
  readonly overlay = input<OverlayView>();
  readonly state = input<'default' | 'active'>();
  readonly placeholder = input<string>();
  readonly entity = input<string>();
  readonly text = input<string>();

  protected readonly embed = computed(() => !!this.view());
  protected readonly embedNav = computed(() => this.nav() ?? 'collapsed');
  protected readonly embedHover = computed(() => this.hover() ?? '1');
  protected readonly embedFastFind = computed(() => this.fastFind() ?? '1');
  protected readonly embedHeight = computed(() => Number(this.height()) || (this.view() === 'rail' ? 560 : 640));
  protected readonly embedOverlay = computed(() => this.overlay() ?? 'menu');
  protected readonly embedPlaceholder = computed(() => this.placeholder() ?? 'Find anything in Bullhorn…');
  protected readonly embedText = computed(() => this.text() ?? 'Pin');
  protected readonly embedResults = computed(() => {
    const e = this.entity();
    return e ? RAIL_FAST_FIND_RESULTS.filter((r) => r.entity === e) : RAIL_FAST_FIND_RESULTS;
  });

  protected readonly results = RAIL_FAST_FIND_RESULTS;
  protected readonly navStates: RailNavState[] = ['collapsed', 'hover', 'open'];
  protected readonly hoverOptions: { id: RailHoverOption; name: string }[] = [
    { id: '1', name: 'Floating card' },
    { id: '2', name: 'Flush overlay' },
    { id: '3', name: 'Card in every state' },
  ];

  // controls for the full-layout demo
  protected readonly demoHover = signal<RailHoverOption>('1');
  protected readonly demoFastFind = signal<RailFastFind>('1');
  protected readonly demoTopbar = signal(false);
  protected readonly lastPick = signal('');
}

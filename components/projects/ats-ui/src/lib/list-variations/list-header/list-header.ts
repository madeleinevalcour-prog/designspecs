import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation,
  afterNextRender, booleanAttribute, computed, inject, input, model, output, signal,
} from '@angular/core';
import { Button } from '../../button/button';
import { Icon } from '../../icon/icon';
import { AdvancedSearch } from '../advanced-search/advanced-search';
import { Toggle, ToggleOption } from '../toggle/toggle';
import { ListVariant, ListView } from '../list-data-table-container/list-data-table-container';

export interface ListHeaderAction { icon: string; label: string; }
export interface ListHeaderFilter { label: string; icon: string; /** Show a trailing chevron-down. */ chevron?: boolean; }

const DEFAULT_ACTIONS: ListHeaderAction[] = [
  { icon: 'columns', label: 'Columns' },
  { icon: 'star-o', label: 'Favorite' },
  { icon: 'refresh-outline', label: 'Refresh' },
  { icon: 'close', label: 'Close' },
];
const DEFAULT_FILTERS: ListHeaderFilter[] = [
  { icon: 'add-thin', label: 'Add Filter' },
  { icon: 'user-outline', label: 'Users', chevron: true },
  { icon: 'category-tags', label: 'Status', chevron: true },
  { icon: 'location', label: 'Status', chevron: true },
];
const SOURCE_OPTIONS: ToggleOption[] = [
  { value: 'bullhorn', label: 'Bullhorn' },
  { value: 'jobboards', label: 'Job Boards' },
];
const VIEW_OPTIONS: ToggleOption[] = [
  { value: 'list', icon: 'list', ariaLabel: 'List view' },
  { value: 'cards', icon: 'dashboard', ariaLabel: 'Card view' },
];

/**
 * ListHeader (Figma: "header option 2" = Classic, "header option 4" = Modern; List
 * Variations file 0LCuwDp7YHGGqK6WiseTRi). Sticky header of the record list:
 * - toolbar: entity avatar + title, record icon Buttons (theme icon), Bullhorn / Job Boards Toggle;
 * - ats-advanced-search;
 * - filter bar: secondary-Button filter chips + the list / cards view Toggle.
 *
 * Classic keeps a persistent elevation. Modern is flat/transparent, and in card view
 * turns translucent white + blur + elevation once content scrolls under it (> 4px).
 * The header watches the scroll of whichever ancestor scrolls; `scrolled` forces it.
 *
 *   <ats-list-header variant="modern" [(view)]="view" (search)="run($event)" />
 *
 * Port of the prototype repo's list-variations/ListHeader.astro + the view toggle and
 * scroll morph from scripts/list-variations.ts.
 */
@Component({
  selector: 'ats-list-header',
  imports: [Button, Icon, Toggle, AdvancedSearch],
  templateUrl: './list-header.html',
  styleUrl: './list-header.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class ListHeader {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly variant = input<ListVariant>();
  /** list / cards (two-way; driven by the view Toggle). */
  readonly view = model<ListView>('list');
  /** Bullhorn / Job Boards source toggle value (two-way). */
  readonly source = model<string>('bullhorn');
  readonly heading = input<string>();
  /** Entity icon in the avatar. */
  readonly entityIcon = input<string>();
  readonly actions = input<ListHeaderAction[]>();
  readonly filters = input<ListHeaderFilter[]>();
  readonly searchPlaceholder = input<string>();
  /** Force the Modern scrolled state on/off (otherwise from scroll position). */
  readonly scrolled = input<boolean | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)),
  });
  /** Emits the AdvancedSearch text on Search / Enter. */
  readonly search = output<string>();

  protected readonly sourceOptions = SOURCE_OPTIONS;
  protected readonly viewOptions = VIEW_OPTIONS;
  protected readonly title = computed(() => this.heading() ?? 'Candidates');
  protected readonly avatarIcon = computed(() => this.entityIcon() ?? 'candidate');
  protected readonly actionList = computed(() => this.actions() ?? DEFAULT_ACTIONS);
  protected readonly filterList = computed(() => this.filters() ?? DEFAULT_FILTERS);

  /** scrollTop of the nearest scrolled ancestor (or the document). */
  private readonly scrollTop = signal(0);

  protected readonly isScrolled = computed(() => {
    if ((this.variant() ?? 'classic') !== 'modern') return false;
    return this.scrolled() ?? (this.view() === 'cards' && this.scrollTop() > 4);
  });

  protected readonly hostClass = computed(() =>
    [
      'ats-list-header',
      `ats-list-header--${this.variant() ?? 'classic'}`,
      this.isScrolled() && 'is-scrolled',
    ].filter(Boolean).join(' '),
  );

  constructor() {
    // Scroll events don't bubble, so listen in the capture phase and keep the ones
    // from an ancestor of the header (the element its content scrolls in).
    const onScroll = (e: Event) => {
      const t = e.target;
      if (t === document) this.scrollTop.set(document.scrollingElement?.scrollTop ?? 0);
      else if (t instanceof Element && t.contains(this.host)) this.scrollTop.set(t.scrollTop);
    };
    afterNextRender(() => document.addEventListener('scroll', onScroll, { capture: true, passive: true }));
    inject(DestroyRef).onDestroy(() => document.removeEventListener('scroll', onScroll, { capture: true }));
  }
}

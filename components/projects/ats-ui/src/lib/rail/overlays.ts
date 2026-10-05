import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Icon } from '../icon/icon';
import { ListItem } from './list-item';
import { SearchInput } from './search-input';
import { RAIL_ADD_ITEMS, RAIL_FAST_FIND_RESULTS, RAIL_MENU_ROWS, matches, resultText } from './rail-data';

/*
 * The rail's overlay panels. In the prototype these were HTML strings built by the
 * controller; here each is a component. They render only their content — the
 * floating card (.ats-overlay: border, radius, shadow, position) is the overlay
 * layer inside <ats-rail-shell>, so each panel can also be shown on its own.
 */

/** Menu (app launcher): search + "Recently used" row + the entity grid. */
@Component({
  selector: 'ats-menu-overlay',
  imports: [Icon, SearchInput],
  template: `
    <ats-search-input #search class="ats-overlay__search" placeholder="Search" active [(value)]="query" (closed)="closed.emit()" />
    @for (row of rows; track $index; let first = $first) {
      <div class="ats-menu__section" [class.ats-menu__section--recent]="first">
        @if (first) { <div class="ats-menu__label">Recently used</div> }
        <div class="ats-menu__row">
          @for (item of row; track item.label) {
            <button class="ats-menu__item" type="button" [hidden]="!show(item.label)" (click)="selected.emit(item.label)">
              <span class="ats-menu__chip" [style.background]="item.bg">
                <ats-icon [name]="item.glyph" [size]="20" color="var(--color-icon-icon-knockout)" />
              </span>
              <span class="ats-menu__item-label">{{ item.label }}</span>
            </button>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './overlays.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-menu-overlay' },
})
export class MenuOverlay implements AfterViewInit {
  /** Focus the search when shown (the rail opens it that way). */
  readonly autofocus = input(true, { transform: booleanAttribute });
  readonly closed = output<void>();
  readonly selected = output<string>();
  protected readonly rows = RAIL_MENU_ROWS;
  protected readonly query = signal('');
  private readonly search = viewChild.required<SearchInput>('search');
  protected show = (label: string) => matches(label, this.query());
  ngAfterViewInit() {
    if (this.autofocus()) setTimeout(() => this.search().focus());
  }
}

/** Add menu: option rows (type=Entity) — entity chip + label. */
@Component({
  selector: 'ats-add-overlay',
  imports: [Icon],
  template: `
    @for (item of items; track item.label) {
      <button class="ats-overlay__row" type="button" (click)="selected.emit(item.label)">
        <span class="ats-entity-chip" [style.background]="'var(--color-entity-' + item.color + ')'">
          <ats-icon [name]="item.glyph" [size]="12" color="var(--color-icon-icon-knockout)" />
        </span>
        <span>{{ item.label }}</span>
      </button>
    }
  `,
  styleUrl: './overlays.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-add-overlay ats-overlay__list' },
})
export class AddOverlay {
  readonly selected = output<string>();
  protected readonly items = RAIL_ADD_ITEMS;
}

/** User dropdown: option rows (type=Default) — 16px icon + label. */
@Component({
  selector: 'ats-user-overlay',
  imports: [Icon],
  template: `
    <button class="ats-overlay__row" type="button" (click)="selected.emit('preferences')">
      <ats-icon name="configure-outline" [size]="16" color="var(--color-icon-subtle)" /><span>Preferences</span>
    </button>
    <button class="ats-overlay__row" type="button" (click)="selected.emit('logout')">
      <ats-icon name="logout" [size]="16" color="var(--color-icon-subtle)" /><span>Logout</span>
    </button>
  `,
  styleUrl: './overlays.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-user-overlay ats-overlay__list' },
})
export class UserOverlay {
  readonly selected = output<'preferences' | 'logout'>();
}

/**
 * Fast Find results.
 *  - `wide`   (Fast Find option 2): its own search + "Recently viewed" + results.
 *  - `inline` (option 1): the narrow "Recently Viewed" list under the rail's inline search.
 *  - `header` (Top Bar): results dropdown under the header search.
 * `inline` / `header` filter by `query` (typed in the rail / header search).
 */
@Component({
  selector: 'ats-fast-find-overlay',
  imports: [ListItem, SearchInput],
  template: `
    @if (variant() === 'inline') {
      <div class="ats-ff__recent">
        <div class="ats-ff__recent-label">Recently Viewed</div>
        <div class="ats-ff__list">
          @for (r of visible(); track r.title) {
            <button ats-list-item compact [entity]="r.entity" [label]="r.title" [fields]="r.fields" (click)="selected.emit(r.title)"></button>
          }
        </div>
      </div>
    } @else {
      <div class="ats-ff__head">
        @if (variant() === 'wide') {
          <ats-search-input #search active [(value)]="ownQuery" (closed)="closed.emit()" />
        }
        <div class="ats-ff__label">Recently viewed</div>
      </div>
      <div class="ats-ff__list">
        @for (r of visible(); track r.title) {
          <button ats-list-item [entity]="r.entity" [label]="r.title" [fields]="r.fields" (click)="selected.emit(r.title)"></button>
        }
      </div>
    }
  `,
  styleUrl: './overlays.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-fast-find-overlay', '[class.ats-fast-find-overlay--inline]': "variant() === 'inline'" },
})
export class FastFindOverlay implements AfterViewInit {
  readonly variant = input<'wide' | 'inline' | 'header'>('wide');
  readonly query = input('');
  readonly autofocus = input(true, { transform: booleanAttribute });
  readonly closed = output<void>();
  readonly selected = output<string>();
  protected readonly ownQuery = signal('');
  private readonly search = viewChild<SearchInput>('search');
  protected readonly visible = computed(() => {
    const q = this.variant() === 'wide' ? this.ownQuery() : this.query();
    return RAIL_FAST_FIND_RESULTS.filter((r) => matches(resultText(r), q));
  });
  ngAfterViewInit() {
    if (this.autofocus()) setTimeout(() => this.search()?.focus());
  }
}

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { ListItem } from '../list-item/list-item';
import { SearchInput } from '../search-input/search-input';
import {
  BOWLING_ALLEY_ADD_ITEMS,
  BOWLING_ALLEY_FAST_FIND_RESULTS,
  BOWLING_ALLEY_MENU_APPS,
  matches,
  resultText,
} from './bowling-alley-data';

/*
 * The bowling alley's overlays, built from the Figma "Overlays" section (491:38819)
 * under 157:511. Each renders its own card, so it can also be shown on its own;
 * `<ats-bowling-alley-shell>` positions it next to the tab that opened it.
 */

/** Menu (Figma novo-drag-container 1323:68245): header + Filter, then app sections. */
@Component({
  selector: 'ats-menu-overlay',
  imports: [Button, Icon, SearchInput],
  template: `
    <div class="ats-menu__header">
      <div class="ats-menu__title-row">
        <span class="ats-menu__title">Menu</span>
        <button ats-button theme="dialogue" size="small" (click)="addRemove.emit()">Add/Remove</button>
      </div>
      <ats-search-input #search variant="pill" placeholder="Filter Items" [(value)]="query" (closed)="closed.emit()" />
    </div>
    <div class="ats-menu__contents">
      <div class="ats-menu__grid">
        @for (item of apps; track $index) {
          <button class="ats-menu__item" type="button" [hidden]="!show(item.label)" (click)="selected.emit(item.label)">
            <span class="ats-menu__chip" [class.ats-menu__chip--amplify]="item.color === 'amplify'" [style.background]="chipColor(item.color)">
              <ats-icon [name]="item.glyph" [size]="20" color="var(--color-icon-icon-knockout)" />
            </span>
            <span class="ats-menu__item-label">{{ item.label }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './overlays.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-menu-overlay' },
})
export class MenuOverlay implements AfterViewInit {
  /** Focus the Filter when shown (Figma: "Focus keyboard automatically on search input"). */
  readonly autofocus = input(true, { transform: booleanAttribute });
  readonly closed = output<void>();
  readonly selected = output<string>();
  readonly addRemove = output<void>();
  protected readonly apps = BOWLING_ALLEY_MENU_APPS;
  protected chipColor = (color: string) =>
    color === 'amplify' ? null : color === 'neutral' ? 'var(--color-entity-note)' : `var(--color-entity-${color})`;
  protected readonly query = signal('');
  private readonly search = viewChild.required<SearchInput>('search');
  protected show = (label: string) => matches(label, this.query());
  ngAfterViewInit() {
    if (this.autofocus()) setTimeout(() => this.search().focus());
  }
}

/** Add (Figma fast-add-menu 4711:109319): menu-options with an entity chip. */
@Component({
  selector: 'ats-add-overlay',
  imports: [Icon],
  template: `
    @for (item of items; track item.label) {
      <button class="ats-menu-option" type="button" (click)="selected.emit(item.label)">
        <span class="ats-menu-option__chip" [style.background]="'var(--color-entity-' + item.color + ')'">
          <ats-icon [name]="item.glyph" [size]="12" color="var(--color-icon-icon-knockout)" />
        </span>
        <span class="ats-menu-option__label">{{ item.label }}</span>
      </button>
    }
  `,
  styleUrl: './overlays.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-add-overlay ats-dropdown-card' },
})
export class AddOverlay {
  readonly selected = output<string>();
  protected readonly items = BOWLING_ALLEY_ADD_ITEMS;
}

/** User menu (Figma user-dropdown 491:38833): Preferences, Logout. */
@Component({
  selector: 'ats-user-overlay',
  imports: [Icon],
  template: `
    <button class="ats-menu-option" type="button" (click)="selected.emit('preferences')">
      <ats-icon name="configure-outline" [size]="16" color="var(--color-icon-subtle)" /><span class="ats-menu-option__label">Preferences</span>
    </button>
    <button class="ats-menu-option" type="button" (click)="selected.emit('logout')">
      <ats-icon name="logout" [size]="16" color="var(--color-icon-subtle)" /><span class="ats-menu-option__label">Logout</span>
    </button>
  `,
  styleUrl: './overlays.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-user-overlay ats-dropdown-card' },
})
export class UserOverlay {
  readonly selected = output<'preferences' | 'logout'>();
}

/** Sophia chat button positions in the Help menu's picker (Figma chat-position-wrapper 4711:109500). */
export type ChatPosition = 'left-top' | 'left-bottom' | 'center-bottom' | 'right-top' | 'right-bottom';

/**
 * Help (Figma help-dropdown-container 4711:109561): Bullhorn Hub link, then Sophia
 * support — Open Chat, the Show Chat Button switch and the chat-position picker.
 */
@Component({
  selector: 'ats-help-overlay',
  imports: [Button, Icon],
  template: `
    <div class="ats-help__group">
      <span class="ats-help__heading">Bullhorn Hub</span>
      <a class="ats-help__link" [href]="hubHref()" target="_blank" rel="noopener" (click)="hubClick.emit()">
        <ats-icon name="external-open" [size]="10" color="var(--link-text-color-default)" />
        <span>Access Knowledge, Support, and Training</span>
      </a>
    </div>
    <div class="ats-help__group">
      <span class="ats-help__heading">Sophia AI Powered Support</span>
      <button ats-button theme="secondary" pill iconRight="arrow-right" class="ats-help__chat" (click)="openChat.emit()">Open Chat</button>
      <div class="ats-help__chat-settings">
        <label class="ats-switch">
          <span class="ats-switch__label">Show Chat Button</span>
          <input class="ats-switch__input" type="checkbox" role="switch" [checked]="showChat()" (change)="showChat.set($any($event.target).checked)" />
          <span class="ats-switch__track" aria-hidden="true"><span class="ats-switch__thumb"></span></span>
        </label>
        <div class="ats-chat-pos" role="radiogroup" aria-label="Chat button position" [class.is-disabled]="!showChat()">
          <span class="ats-chat-pos__bar"></span>
          <span class="ats-chat-pos__screen">
            @for (col of columns; track $index) {
              <span class="ats-chat-pos__col">
                @for (p of col; track p) {
                  <button class="ats-chat-pos__spot" type="button" role="radio" [attr.aria-checked]="chatPosition() === p"
                    [attr.aria-label]="p.replace('-', ' ')" [disabled]="!showChat()" (click)="chatPosition.set(p)"></button>
                }
              </span>
            }
          </span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './overlays.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-help-overlay ats-dropdown-card' },
})
export class HelpOverlay {
  readonly hubHref = input('#');
  /** "Show Chat Button" switch (two-way). */
  readonly showChat = model(true);
  /** Selected chat button position (two-way). */
  readonly chatPosition = model<ChatPosition>('left-bottom');
  readonly openChat = output<void>();
  readonly hubClick = output<void>();
  protected readonly columns: ChatPosition[][] = [['left-top', 'left-bottom'], ['center-bottom'], ['right-top', 'right-bottom']];
}

/**
 * Fast Find results (Figma fast-find-results 1323:67009 / 1780:24700). Empty query:
 * "Recently Viewed" label + recent records. While typing: the matches, headed by a
 * "View All" action. Filtered by `query` (typed in the bowling alley's search).
 */
@Component({
  selector: 'ats-fast-find-results',
  imports: [Button, ListItem],
  template: `
    @if (query().trim()) {
      <div class="ats-ff__view-all">
        <button ats-button theme="dialogue" iconRight="view-all" (click)="viewAll.emit(query())">View All</button>
      </div>
    } @else {
      <div class="ats-ff__label">Recently Viewed</div>
    }
    <div class="ats-ff__list" role="list">
      @for (r of visible(); track r.title) {
        <button ats-list-item role="listitem" [entity]="r.entity" [label]="r.title" [fields]="r.fields" [body]="r.body" (click)="selected.emit(r.title)"></button>
      } @empty {
        <div class="ats-ff__empty">No matches</div>
      }
    </div>
  `,
  styleUrl: './overlays.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-fast-find-results', '[class.is-searching]': '!!query().trim()' },
})
export class FastFindResults {
  readonly query = input('');
  readonly selected = output<string>();
  readonly viewAll = output<string>();
  protected readonly visible = computed(() => BOWLING_ALLEY_FAST_FIND_RESULTS.filter((r) => matches(resultText(r), this.query())));
}

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
import { IconContainerTheme } from '../icon-container/icon-container';
import { MenuHeader } from '../menu-header/menu-header';
import { MenuItem } from '../menu-item/menu-item';
import { MenuOption } from '../menu-option/menu-option';
import { NovoList } from '../novo-list/novo-list';
import { NovoListItemDefault } from '../novo-list/presets';
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

/** Data color → icon-container theme (Figma: job = `jobs`; note, task, neutral = `neutral`). */
const iconContainerTheme = (color: string): IconContainerTheme =>
  color === 'job' ? 'jobs' : color === 'note' || color === 'neutral' || color === 'task' ? 'neutral' : (color as IconContainerTheme);

/**
 * Menu (Figma novo-drag-container 1323:68245 / 1217:58484): a MenuHeader (title,
 * Add/Remove, Filter), then the apps as MenuItems (icon-container md + label).
 */
@Component({
  selector: 'ats-menu-overlay',
  imports: [MenuHeader, MenuItem],
  template: `
    <ats-menu-header #header placeholder="Filter Items" [(filter)]="query" (closed)="closed.emit()" (addRemove)="addRemove.emit()" />
    <div class="ats-menu__contents">
      <div class="ats-menu__grid">
        @for (item of apps; track $index) {
          <button ats-menu-item [theme]="iconTheme(item.color)" [icon]="item.glyph" [background]="iconFill(item.color)"
            [hidden]="!show(item.label)" (click)="selected.emit(item.label)">{{ item.label }}</button>
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
  // Each app icon is an icon-container (size md). Task has no icon-container theme,
  // so it keeps --color-entity-task as a fill override.
  protected iconTheme = iconContainerTheme;
  protected iconFill = (color: string) => (color === 'task' ? 'var(--color-entity-task)' : undefined);
  protected readonly query = signal('');
  private readonly header = viewChild.required<MenuHeader>('header');
  protected show = (label: string) => matches(label, this.query());
  ngAfterViewInit() {
    if (this.autofocus()) setTimeout(() => this.header().focusFilter());
  }
}

/** Add (Figma fast-add-menu 4711:42682): menu-options, type entity (icon-container sm). */
@Component({
  selector: 'ats-add-overlay',
  imports: [MenuOption],
  template: `
    @for (item of items; track item.label) {
      <button ats-menu-option type="entity" [theme]="iconTheme(item.color)" [icon]="item.glyph" (click)="selected.emit(item.label)">{{ item.label }}</button>
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
  protected iconTheme = iconContainerTheme;
}

/** User menu (Figma user-dropdown-panel 168:19961): menu-options, type default: Preferences, Logout. */
@Component({
  selector: 'ats-user-overlay',
  imports: [MenuOption],
  template: `
    <button ats-menu-option icon="configure-outline" (click)="selected.emit('preferences')">Preferences</button>
    <button ats-menu-option icon="logout" (click)="selected.emit('logout')">Logout</button>
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
 * Fast Find results (Figma fast-find-results 1323:67009 / 1780:24700). Each row is a
 * Novo List item (NovoListItemDefault: entity icon-container + title, wrapping
 * fields, body), clickable and keyboard-activatable through its row button. Empty query:
 * "Recently Viewed" label + recent records. While typing: the matches, headed by a
 * "View All" action. Filtered by `query` (typed in the bowling alley's search).
 */
@Component({
  selector: 'ats-fast-find-results',
  imports: [Button, NovoList, NovoListItemDefault],
  template: `
    @if (query().trim()) {
      <div class="ats-ff__view-all">
        <button ats-button theme="dialogue" iconRight="view-all" (click)="viewAll.emit(query())">View All</button>
      </div>
    } @else {
      <div class="ats-ff__label">Recently Viewed</div>
    }
    <ats-novo-list class="ats-ff__list">
      @for (r of visible(); track r.title) {
        <ats-novo-list-item-default [entity]="r.entity" [title]="r.title" [fields]="r.fields" [comment]="r.body" (itemClick)="selected.emit(r.title)" />
      } @empty {
        <div class="ats-ff__empty">No matches</div>
      }
    </ats-novo-list>
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

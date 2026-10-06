import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { NovoList } from '../novo-list/novo-list';
import { NovoListItemDefault } from '../novo-list/presets';
import { Switch } from '../switch/switch';
import { BOWLING_ALLEY_FAST_FIND_RESULTS, matches, resultText } from './bowling-alley-data';

/*
 * The bowling alley's own overlays: Help and the Fast Find results (Figma "Overlays"
 * 491:38819 under 157:511). The Menu, Add and user overlays are variants of the Menu
 * component (`<ats-menu>`, lib/menu/). `<ats-bowling-alley-shell>` positions them all
 * next to the tab that opened them.
 */

/** Sophia chat button positions in the Help menu's picker (Figma chat-position-wrapper 4711:109500). */
export type ChatPosition = 'left-top' | 'left-bottom' | 'center-bottom' | 'right-top' | 'right-bottom';

/**
 * Help (Figma help-dropdown-container 4711:109561): Bullhorn Hub link, then Sophia
 * support — Open Chat, the Show Chat Button switch and the chat-position picker.
 */
@Component({
  selector: 'ats-help-overlay',
  imports: [Button, Icon, Switch],
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
        <label ats-switch class="ats-help__switch" [(checked)]="showChat">Show Chat Button</label>
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
  styleUrls: ['../menu/dropdown-card.css', './overlays.css'],
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

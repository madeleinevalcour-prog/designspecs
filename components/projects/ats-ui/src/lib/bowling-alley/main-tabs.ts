import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';
import { IconButtonNoContainer } from '../icon-button-no-container/icon-button-no-container';
import { SearchInput } from '../search-input/search-input';
import { BowlingAlleyController } from './bowling-alley-controller';

/**
 * MainTabs (Figma: "main-tabs") — Find / Menu / Add / Amplify, Find on top. Each
 * opener shows a "next" chevron on hover / while its overlay is open. The Amplify tab goes to
 * the Amplify landing page; its own chevron button opens the Amplify menu. In Fast Find
 * mode (Figma 1323:67008) the Find tab is replaced by a SearchInput. Lives inside
 * `<ats-bowling-alley>`; state comes from the BowlingAlleyController.
 */
@Component({
  selector: 'ats-main-tabs',
  imports: [Icon, IconButtonNoContainer, SearchInput],
  template: `
    @if (ctrl.findOpen()) {
      <ats-search-input #find class="ats-bowling-alley__find" active placeholder="Find anything in Bullhorn"
        [value]="ctrl.findQuery()" (valueChange)="ctrl.findQuery.set($event)" (closed)="ctrl.dismiss()" />
    } @else {
      <button class="ats-bowling-alley-tab ats-bowling-alley-tab--opener" data-opener="find" type="button" aria-label="Find"
        (click)="ctrl.opener('find', $any($event.currentTarget))">
        <span class="ats-bowling-alley-tab__icon"><ats-icon name="search" [size]="14" color="var(--bowling-alley-color-content-icon-default)" /></span>
        <span class="ats-bowling-alley-tab__label">Find</span>
        <span class="ats-bowling-alley-tab__next"><ats-icon name="next" [size]="12" color="var(--bowling-alley-color-content-icon-default)" /></span>
      </button>
    }
    <button class="ats-bowling-alley-tab ats-bowling-alley-tab--opener" data-opener="menu" type="button"
      [class.is-active]="ctrl.isOpen('menu')" [attr.aria-expanded]="ctrl.isOpen('menu')" aria-label="Menu"
      (click)="ctrl.opener('menu', $any($event.currentTarget))">
      <span class="ats-bowling-alley-tab__icon"><ats-icon name="menu-outline" [size]="14" color="var(--bowling-alley-color-content-icon-default)" /></span>
      <span class="ats-bowling-alley-tab__label">Menu</span>
      <span class="ats-bowling-alley-tab__next"><ats-icon name="next" [size]="12" color="var(--bowling-alley-color-content-icon-default)" /></span>
    </button>
    <button class="ats-bowling-alley-tab ats-bowling-alley-tab--opener" data-opener="add" type="button"
      [class.is-active]="ctrl.isOpen('add')" [attr.aria-expanded]="ctrl.isOpen('add')" aria-label="Add"
      (click)="ctrl.opener('add', $any($event.currentTarget))">
      <span class="ats-bowling-alley-tab__icon"><ats-icon name="add-thin" [size]="14" color="var(--bowling-alley-color-content-icon-default)" /></span>
      <span class="ats-bowling-alley-tab__label">Add</span>
      <span class="ats-bowling-alley-tab__next"><ats-icon name="next" [size]="12" color="var(--bowling-alley-color-content-icon-default)" /></span>
    </button>
    <!-- Amplify: the tab goes to the Amplify landing page; its chevron (icon-button-no-container,
         Figma main-tabs "show button") opens the Amplify menu (amplify-nav-dropdown 6815:49406). -->
    <div class="ats-bowling-alley__amplify" #amp [class.is-menu-open]="ctrl.isOpen('amplify')">
      <button class="ats-bowling-alley-tab" data-opener="amplify" type="button" aria-label="Amplify"
        [class.is-active]="ctrl.amplifyActive()" [attr.aria-current]="ctrl.amplifyActive() ? 'page' : null"
        (click)="ctrl.opener('amplify', $any($event.currentTarget))">
        <span class="ats-bowling-alley-tab__icon"><ats-icon class="ats-bowling-alley__amplify-glyph" name="amplify" [size]="14" /></span>
        <span class="ats-bowling-alley-tab__label">Amplify</span>
      </button>
      <button ats-icon-button-no-container class="ats-bowling-alley__amplify-menu" icon="next" data-opener="amplify-menu"
        aria-label="Amplify menu" aria-haspopup="true" [attr.aria-expanded]="ctrl.isOpen('amplify')"
        (click)="ctrl.opener('amplify-menu', amp)"></button>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-main-tabs ats-bowling-alley__section' },
})
export class MainTabs {
  protected readonly ctrl = inject(BowlingAlleyController);
  private readonly find = viewChild<SearchInput>('find');

  constructor() {
    // focus the search as soon as Find turns into it (when the user opened it)
    effect(() => {
      const f = this.find();
      if (f && this.ctrl.findFocus) setTimeout(() => f.focus());
    });
  }
}

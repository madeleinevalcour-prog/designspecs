import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';
import { RailController } from './rail-controller';
import { SearchInput } from './search-input';

/**
 * MainTabs (Figma: "main-tabs", 157:2575 updated) — Find / Menu / Add / Amplify
 * openers, Find on top. Each shows a "next" chevron on hover / when its overlay is
 * open. With Fast Find option 1 the Find tab morphs into an inline SearchInput.
 * Lives inside `<ats-rail>`; state comes from the RailController.
 */
@Component({
  selector: 'ats-main-tabs',
  imports: [Icon, SearchInput],
  template: `
    <button class="ats-rail-tab ats-rail-tab--find ats-rail-tab--opener" data-overlay="find" type="button"
      [class.is-active]="ctrl.isOpen('find')" [attr.aria-expanded]="ctrl.isOpen('find')" aria-label="Find"
      (click)="ctrl.opener('find', $any($event.currentTarget))">
      <span class="ats-rail-tab__icon"><ats-icon name="search" [size]="14" color="var(--bowling-alley-color-content-icon-default)" /></span>
      <span class="ats-rail-tab__label">Find</span>
      <span class="ats-rail-tab__next"><ats-icon name="next" [size]="12" color="var(--bowling-alley-color-content-icon-default)" /></span>
    </button>
    <div class="ats-rail-findsearch">
      <ats-search-input #find active [value]="ctrl.findQuery()" (valueChange)="ctrl.findQuery.set($event)" (closed)="ctrl.closeOverlay()" />
    </div>
    <button class="ats-rail-tab ats-rail-tab--menu ats-rail-tab--opener" data-overlay="menu" type="button"
      [class.is-active]="ctrl.isOpen('menu')" [attr.aria-expanded]="ctrl.isOpen('menu')" aria-label="Menu"
      (click)="ctrl.opener('menu', $any($event.currentTarget))">
      <span class="ats-rail-tab__icon"><ats-icon name="menu-outline" [size]="14" color="var(--bowling-alley-color-content-icon-default)" /></span>
      <span class="ats-rail-tab__label">Menu</span>
      <span class="ats-rail-tab__next"><ats-icon name="next" [size]="12" color="var(--bowling-alley-color-content-icon-default)" /></span>
    </button>
    <button class="ats-rail-tab ats-rail-tab--opener" data-overlay="add" type="button"
      [class.is-active]="ctrl.isOpen('add')" [attr.aria-expanded]="ctrl.isOpen('add')" aria-label="Add"
      (click)="ctrl.opener('add', $any($event.currentTarget))">
      <span class="ats-rail-tab__icon"><ats-icon name="add-thin" [size]="14" color="var(--bowling-alley-color-content-icon-default)" /></span>
      <span class="ats-rail-tab__label">Add</span>
      <span class="ats-rail-tab__next"><ats-icon name="next" [size]="12" color="var(--bowling-alley-color-content-icon-default)" /></span>
    </button>
    <button class="ats-rail-tab ats-rail-tab--amplify ats-rail-tab--opener" data-overlay="amplify" type="button"
      [class.is-active]="ctrl.amplify()" [attr.aria-pressed]="ctrl.amplify()" aria-label="Amplify"
      (click)="ctrl.opener('amplify', $any($event.currentTarget))">
      <span class="ats-rail-tab__icon"><ats-icon class="ats-amplify-glyph" name="amplify" [size]="14" /></span>
      <span class="ats-rail-tab__label">Amplify</span>
      <span class="ats-rail-tab__next"><ats-icon name="next" [size]="12" color="var(--bowling-alley-color-content-icon-default)" /></span>
    </button>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-main-tabs ats-rail__section' },
})
export class MainTabs {
  protected readonly ctrl = inject(RailController);
  private readonly find = viewChild.required<SearchInput>('find');

  constructor() {
    // focus the inline search when Find morphs into it
    effect(() => {
      if (this.ctrl.findOpen()) setTimeout(() => this.find().focus());
    });
  }
}

import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, inject, input, output, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';
import { RailController } from './rail-controller';
import { SearchInput } from './search-input';

/**
 * Header (Figma: "Header", 157:2557) — the Top Bar header: full-width search +
 * Amplify + user. Inside `<ats-rail-shell topbar>` the search opens the Fast Find
 * dropdown below it (filtered as you type), Amplify toggles the panel and the user
 * opens the user menu. Standalone, it just emits the outputs.
 */
@Component({
  selector: 'ats-header',
  imports: [Icon, SearchInput],
  template: `
    <div class="ats-header__search" #wrap (click)="onSearchClick($event)">
      <ats-search-input #search [value]="ctrl?.findQuery() ?? ''" (valueChange)="onType($event)" (focused)="openFind()" (closed)="onSearchClose()" />
    </div>
    <div class="ats-header__right">
      <button class="ats-header__tab" type="button" [attr.aria-pressed]="ctrl?.amplify() ?? null" (click)="onAmplify()">
        <span class="ats-header__ico"><ats-icon class="ats-amplify-glyph" name="amplify" [size]="12" /></span>
        <span>Amplify</span>
      </button>
      <span class="ats-header__divider"></span>
      <button class="ats-header__tab" type="button" [attr.aria-expanded]="userOpen()" (click)="onUser($event)">
        <span class="ats-avatar">{{ userInitials() }}</span>
        <span>{{ userName() }}</span>
      </button>
    </div>
  `,
  styleUrl: './header.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-header', role: 'banner' },
})
export class Header {
  protected readonly ctrl = inject(RailController, { optional: true });
  readonly userName = input('Chloe Davis');
  readonly userInitials = input('CD');
  readonly amplifyClick = output<void>();
  readonly userClick = output<void>();
  readonly search = output<string>();

  private readonly wrap = viewChild.required<ElementRef<HTMLElement>>('wrap');
  private readonly searchInput = viewChild.required<SearchInput>('search');
  protected readonly userOpen = computed(() => !!this.ctrl?.isOpen('tbuser'));

  /** Fast Find opens as a dropdown below the search, matched to its width. */
  protected openFind() {
    if (!this.ctrl || this.ctrl.isOpen('tbfind')) return;
    const anchor = this.wrap().nativeElement.querySelector<HTMLElement>('.ats-search-input') ?? this.wrap().nativeElement;
    this.ctrl.closeOverlay();
    this.ctrl.openOverlay({ kind: 'tbfind', anchor, width: anchor.getBoundingClientRect().width, section: 'top', below: true, alignLeft: true });
  }
  protected onType(v: string) {
    this.openFind();
    this.ctrl?.findQuery.set(v);
    this.search.emit(v);
  }
  /** Clicking anywhere in the pill (icon / padding) focuses + opens. */
  protected onSearchClick(e: Event) {
    if ((e.target as HTMLElement).closest('.ats-search-input__close')) return;
    this.searchInput().focus();
    this.openFind();
  }
  protected onSearchClose() {
    this.ctrl?.findQuery.set('');
    this.searchInput().blur();
    this.ctrl?.closeOverlay();
    this.search.emit('');
  }
  protected onAmplify() {
    this.ctrl?.closeOverlay();
    this.ctrl?.amplify.update((v) => !v);
    this.amplifyClick.emit();
  }
  protected onUser(e: Event) {
    e.stopPropagation();
    this.ctrl?.openOverlay({ kind: 'tbuser', anchor: e.currentTarget as HTMLElement, width: 200, section: 'top', below: true });
    this.userClick.emit();
  }
}

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
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
import { Switch } from '../switch/switch';
import { BowlingAlleyController } from './bowling-alley-controller';
import {
  BOWLING_ALLEY_ADD_ITEMS,
  BOWLING_ALLEY_FAST_FIND_RESULTS,
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

let menuUid = 0;

/**
 * Menu (Figma novo-drag-container 1323:68245 / 1217:58484): a MenuHeader (title,
 * Add/Remove, Filter), then the apps as MenuItems (icon-container md + label), in the
 * controller's order. Apps unchecked in the Edit Menu are left out; a folder with
 * "Grouped" on gets its own labelled section (Figma header style, as "My Applications").
 *
 * Reorder: drag a tile onto another (native drag and drop; the dragged tile shows the
 * menu-item `drag` state, and a bar marks where it will land), or focus a tile and
 * press Alt+Arrow keys (Left/Right one place, Up/Down one row). Tiles move within
 * their section.
 */
@Component({
  selector: 'ats-menu-overlay',
  imports: [MenuHeader, MenuItem],
  template: `
    <ats-menu-header #header [placeholder]="placeholder()" [(filter)]="query" (closed)="closed.emit()" (addRemove)="addRemove.emit()" />
    <div class="ats-menu__contents">
      @for (sec of ctrl.menuSections(); track sec.id) {
        <div class="ats-menu__section" role="group" [attr.aria-label]="sec.title ?? 'Apps'">
          @if (sec.title) { <div class="ats-menu__section-title">{{ sec.title }}</div> }
          <div class="ats-menu__grid">
            @for (item of sec.apps; track item.id) {
              <button ats-menu-item [theme]="iconTheme(item.color)" [icon]="item.glyph" [background]="iconFill(item.color)"
                [attr.data-app]="sec.id + ':' + item.id" [hidden]="!show(item.label)" draggable="true"
                [state]="dragging()?.id === item.id ? 'drag' : undefined"
                [class.is-drop-before]="isDrop(sec.id, item.id, false)" [class.is-drop-after]="isDrop(sec.id, item.id, true)"
                [attr.aria-describedby]="hintId"
                (dragstart)="dragStart($event, sec.id, item.id)" (dragend)="dragEnd()"
                (dragover)="dragOver($event, sec.id, item.id)" (drop)="drop($event)"
                (keydown)="keyMove($event, sec.id, item.id)" (click)="selected.emit(item.label)">{{ item.label }}</button>
            }
          </div>
        </div>
      }
    </div>
    <span class="ats-menu__sr" [id]="hintId">Alt+Arrow keys move this app.</span>
    <span class="ats-menu__sr" aria-live="polite">{{ announce() }}</span>
  `,
  styleUrl: './overlays.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-menu-overlay' },
})
export class MenuOverlay implements AfterViewInit {
  protected readonly ctrl = inject(BowlingAlleyController, { optional: true }) ?? new BowlingAlleyController();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Focus the Filter when shown (Figma: "Focus keyboard automatically on search input"). */
  readonly autofocus = input(true, { transform: booleanAttribute });
  readonly placeholder = input('Filter Items');
  readonly closed = output<void>();
  readonly selected = output<string>();
  /** Add/Remove was clicked (the shell switches to the Edit Menu). */
  readonly addRemove = output<void>();
  // Each app icon is an icon-container (size md). Task has no icon-container theme,
  // so it keeps --color-entity-task as a fill override.
  protected iconTheme = iconContainerTheme;
  protected iconFill = (color: string) => (color === 'task' ? 'var(--color-entity-task)' : undefined);
  protected readonly query = signal('');
  protected readonly hintId = `ats-menu-hint-${++menuUid}`;
  protected readonly dragging = signal<{ section: string; id: string } | null>(null);
  protected readonly dropAt = signal<{ id: string; after: boolean } | null>(null);
  protected readonly announce = signal('');
  private readonly header = viewChild.required<MenuHeader>('header');
  protected show = (label: string) => matches(label, this.query());
  protected isDrop = (section: string, id: string, after: boolean) => {
    const d = this.dropAt();
    return !!d && d.id === id && d.after === after && this.dragging()?.section === section && this.dragging()?.id !== id;
  };

  ngAfterViewInit() {
    if (this.autofocus()) setTimeout(() => this.header().focusFilter());
  }

  protected dragStart(e: DragEvent, section: string, id: string) {
    this.dragging.set({ section, id });
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    }
  }
  protected dragOver(e: DragEvent, section: string, id: string) {
    const d = this.dragging();
    if (!d || d.section !== section) return; // tiles move within their section
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const after = e.clientX > r.left + r.width / 2;
    const cur = this.dropAt();
    if (cur?.id !== id || cur.after !== after) this.dropAt.set({ id, after });
  }
  protected drop(e: DragEvent) {
    e.preventDefault();
    const d = this.dragging();
    const t = this.dropAt();
    if (d && t) this.ctrl.moveApp(d.id, t.id, t.after);
    this.dragEnd();
  }
  protected dragEnd() {
    this.dragging.set(null);
    this.dropAt.set(null);
  }

  /** Alt+Arrow keys: Left/Right one place, Up/Down one row (3 tiles). */
  protected keyMove(e: KeyboardEvent, section: string, id: string) {
    if (!e.altKey) return;
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[e.key];
    if (!delta) return;
    e.preventDefault();
    this.ctrl.moveAppBy(section, id, delta);
    const apps = this.ctrl.menuSections().find((x) => x.id === section)?.apps ?? [];
    const i = apps.findIndex((a) => a.id === id);
    this.announce.set(`${apps[i]?.label} moved to position ${i + 1} of ${apps.length}`);
    // the tile's element moves with it (tracked by id); keep focus on it
    setTimeout(() => this.host.querySelector<HTMLElement>(`[data-app="${section}:${id}"]`)?.focus());
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

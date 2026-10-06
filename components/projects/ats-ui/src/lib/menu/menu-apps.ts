import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { BowlingAlleyController } from '../bowling-alley/bowling-alley-controller';
import { matches } from '../bowling-alley/bowling-alley-data';
import { MenuHeader } from './menu-header';
import { MenuItem } from './menu-item';
import { iconContainerTheme } from './menu-theme';

let menuUid = 0;

/**
 * MenuApps — the app grid of `<ats-menu variant="apps">` (Figma novo-drag-container
 * 1323:68245 / 1217:58484). Internal part of Menu, not exported. A MenuHeader (title,
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
  selector: 'ats-menu-apps',
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
  styleUrl: './menu.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-menu-apps' },
})
export class MenuApps implements AfterViewInit {
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

import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, output, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { RailController, RailEntityTab } from './rail-controller';

/**
 * EntityTabs (Figma: "entity-tabs") — the open record tabs. Click to activate;
 * pin / close actions show on hover when the rail is expanded (a pinned tab keeps
 * its pin visible); drag a tab to reorder, with a drop line marking where it lands.
 * Tabs live in the RailController (`tabs` signal).
 */
@Component({
  selector: 'ats-entity-tabs',
  imports: [Icon],
  template: `
    @for (t of ctrl.tabs(); track t.id; let i = $index) {
      @if (dropIndex() === i) { <div class="ats-rail-drop-line"></div> }
      <div
        class="ats-rail-tab ats-rail-tab--entity"
        role="button"
        tabindex="0"
        draggable="true"
        [attr.data-entity]="t.type"
        [attr.aria-current]="t.active ? 'page' : null"
        [class.is-active]="t.active"
        [class.is-pinned]="t.pinned"
        [class.is-dragging]="dragId() === t.id"
        (click)="activate(t)"
        (keydown.enter)="onKey($event, t)"
        (keydown.space)="onKey($event, t)"
        (dragstart)="onDragStart($event, t)"
        (dragend)="onDragEnd()"
        (dragover)="onDragOver($event, i)"
        (drop)="onDrop($event)"
      >
        <span class="ats-rail-tab__icon">
          <ats-icon [name]="t.icon ?? t.type" [size]="12" color="var(--color-icon-icon-knockout)" />
        </span>
        <span class="ats-rail-tab__label">{{ t.label }}</span>
        @if (t.pinnable !== false) {
          <span class="ats-rail-tab__actions">
            <button class="ats-rail-tab__pin" type="button" [attr.aria-label]="t.pinned ? 'Remove pin' : 'Pin'" [attr.aria-pressed]="t.pinned"
              (click)="$event.stopPropagation(); ctrl.togglePin(t.id)"
              (mouseenter)="ctrl.showTooltip($any($event.currentTarget), t.pinned ? 'Remove pin' : 'Pin')"
              (mouseleave)="ctrl.hideTooltip()" (focus)="ctrl.showTooltip($any($event.currentTarget), t.pinned ? 'Remove pin' : 'Pin')" (blur)="ctrl.hideTooltip()">
              <ats-icon [name]="t.pinned ? 'pin' : 'pin-outline'" [size]="12" color="var(--color-icon-subtle)" />
            </button>
            <button class="ats-rail-tab__close" type="button" aria-label="Close" (click)="$event.stopPropagation(); close(t)">
              <ats-icon name="close" [size]="12" color="var(--color-icon-subtle)" />
            </button>
          </span>
        }
      </div>
    }
    @if (dropIndex() === ctrl.tabs().length) { <div class="ats-rail-drop-line"></div> }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-entity-tabs ats-rail__section', '(dragover)': 'onContainerDragOver($event)', '(drop)': 'onDrop($event)' },
})
export class EntityTabs {
  protected readonly ctrl = inject(RailController);
  /** A tab was activated (clicked / Enter / Space). */
  readonly activated = output<RailEntityTab>();
  readonly closed = output<RailEntityTab>();

  protected readonly dragId = signal<string | null>(null);
  /** Where the drop line sits: before the tab at this index (length = after the last). */
  protected readonly dropIndex = signal<number | null>(null);

  protected activate(t: RailEntityTab) {
    this.ctrl.activateTab(t.id);
    this.activated.emit(t);
  }
  /** Enter / Space on the tab itself (not bubbling up from its pin / close buttons). */
  protected onKey(e: Event, t: RailEntityTab) {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    this.activate(t);
  }
  protected close(t: RailEntityTab) {
    this.ctrl.closeTab(t.id);
    this.ctrl.hideTooltip();
    this.closed.emit(t);
  }

  protected onDragStart(e: DragEvent, t: RailEntityTab) {
    this.dragId.set(t.id);
    e.dataTransfer?.setData('text/plain', t.id);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }
  protected onDragEnd() {
    this.dragId.set(null);
    this.dropIndex.set(null);
  }
  protected onDragOver(e: DragEvent, i: number) {
    if (!this.dragId()) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const after = e.clientY - rect.top > rect.height / 2; // below the midpoint → drop after
    this.dropIndex.set(after ? i + 1 : i);
  }
  /** Over the drop line / gaps: keep the drop allowed, keep the current line. */
  protected onContainerDragOver(e: DragEvent) {
    if (this.dragId()) e.preventDefault();
  }
  protected onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const id = this.dragId();
    const line = this.dropIndex();
    if (id && line != null) {
      // index among the tabs without the dragged one
      const from = this.ctrl.tabs().findIndex((t) => t.id === id);
      this.ctrl.moveTab(id, from < line ? line - 1 : line);
    }
    this.onDragEnd();
  }
}

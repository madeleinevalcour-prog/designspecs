import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output } from '@angular/core';
import { Button } from '../button/button';

export type CardAction = 'add' | 'expand' | 'refresh' | 'configure' | 'close';

const ACTIONS: { action: CardAction; icon: string; label: string }[] = [
  { action: 'add', icon: 'add-thin', label: 'Add' },
  { action: 'expand', icon: 'card-expand', label: 'Expand' },
  { action: 'refresh', icon: 'refresh-outline', label: 'Refresh' },
  { action: 'configure', icon: 'configure-outline', label: 'Configure' },
  { action: 'close', icon: 'close', label: 'Close' },
];

/**
 * CardActions (Figma: novo-card-actions) — the card header's row of no-container
 * icon buttons: Add · Expand · Refresh · [Configure] · Close. Configure shows only
 * with `settings`. Port of the prototype repo's `card/CardActions.astro`.
 *
 *   <ats-card-actions settings (action)="onAction($event)" />
 *
 * Each control is an `ats-button` (theme="icon", small), sized down to the card's
 * 24px no-container hit area in card-actions.css.
 */
@Component({
  selector: 'ats-card-actions',
  imports: [Button],
  template: `
    @for (a of actions(); track a.action) {
      <button ats-button theme="icon" size="small" [icon]="a.icon" [attr.aria-label]="a.label" (click)="action.emit(a.action)"></button>
    }
  `,
  styleUrl: './card-actions.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-card-actions' },
})
export class CardActions {
  /** Show the Configure button. */
  readonly settings = input(false, { transform: booleanAttribute });
  /** Emits which header action was clicked. */
  readonly action = output<CardAction>();

  protected readonly actions = computed(() => ACTIONS.filter((a) => a.action !== 'configure' || this.settings()));
}

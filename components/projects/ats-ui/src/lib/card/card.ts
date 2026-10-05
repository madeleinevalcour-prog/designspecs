import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output } from '@angular/core';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { CardAction, CardActions } from './card-actions';

export type CardVariant = 'resume' | 'details' | 'notes' | 'tasks' | 'submissions';

/** Default header icon + title per variant (from the source's VARIANTS map). */
export const CARD_VARIANTS: Record<CardVariant, { icon: string; title: string }> = {
  resume: { icon: 'resume', title: 'Resume' },
  details: { icon: 'info', title: 'Details' },
  notes: { icon: 'note', title: 'Recent Notes' },
  tasks: { icon: 'check-outline', title: 'Open Tasks' },
  submissions: { icon: 'submission', title: 'Open Submissions' },
};

/**
 * Card (Figma: card / novo-card, Component Migration 311:29059) — header (drag
 * gripper + variant icon + title + actions), a body, and an optional footer.
 * Port of the prototype repo's `card/Card.astro`.
 *
 *   <ats-card variant="details" showFooter (footerClick)="viewAll()">
 *     <ats-card-detail-row label="Owner" value="Chloe Davis" />
 *   </ats-card>
 *
 * `variant` sets the default header icon + title; override with `icon` / `title`.
 * The default content is the body. Project your own header actions with
 * `<ats-card-actions>` (or any element with the `cardActions` attribute); otherwise
 * the default CardActions render and their clicks re-emit as `(action)`.
 * Add the `ats-card__pad` class to a body element for the padded content layout.
 */
@Component({
  selector: 'ats-card',
  imports: [Button, Icon, CardActions],
  templateUrl: './card.html',
  styleUrl: './card.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-card',
    '[style.--card-header-icon-color]': 'iconColor() || null',
  },
})
export class Card {
  readonly variant = input<CardVariant>();
  readonly title = input<string>();
  readonly icon = input<string>();
  /** Drag gripper in the header's left gutter, shown on header hover. */
  readonly gripper = input(true, { transform: booleanAttribute });
  readonly showFooter = input(false, { transform: booleanAttribute });
  readonly footerLabel = input('View All');
  /** Show Configure in the default header actions. */
  readonly settings = input(false, { transform: booleanAttribute });
  /** Override the header icon color (any CSS color or var(), e.g. an entity color). */
  readonly iconColor = input<string>();

  /** A default header action was clicked. */
  readonly action = output<CardAction>();
  /** The footer button ("View All") was clicked. */
  readonly footerClick = output<void>();

  protected readonly headerIcon = computed(() => this.icon() ?? (this.variant() ? CARD_VARIANTS[this.variant()!]?.icon : undefined));
  protected readonly headerTitle = computed(
    () => this.title() ?? (this.variant() ? CARD_VARIANTS[this.variant()!]?.title : undefined) ?? '',
  );
}

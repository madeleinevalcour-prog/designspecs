import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';
import { Icon } from '../../icon/icon';
import { IconButtonNoContainer } from '../../icon-button-no-container/icon-button-no-container';

/** Figma amplify-chat/sources-row `state`. */
export type AmplifyChatSourcesRowState = 'collapsed' | 'expanded';

/** Record type → the circle's `color/entity/*` token. `prospect` (found by Prospect, not yet in the ATS) is neutral grey; once saved it is a `contact`. */
export type AmplifyChatSourceEntity =
  | 'candidate' | 'job' | 'contact' | 'company' | 'placement' | 'lead' | 'opportunity' | 'submission' | 'task' | 'prospect';

/** One record the answer used. */
export interface AmplifyChatSource {
  /** Record name (not the ID), e.g. "Senior Java Developer". */
  label: string;
  /** Record type → entity-color circle. Default job. */
  entity?: AmplifyChatSourceEntity;
  /** Opens the record. Without it the source renders as a button that emits `sourceClick`. */
  href?: string;
}

let nextId = 0;

/**
 * AmplifyChatSourcesRow (Figma: "amplify-chat/sources-row", 6149:20865). Sits under
 * an Amplify reply that used records ("show your work"): a meta/default summary in
 * color/text/secondary ("Based on 14 job orders · Updated today") and an
 * icon-button-no-container chevron toggle. Expanded, it lists the records as small
 * link text (body/sm in link-text/color/default) with an entity-color circle.
 *  - collapsed / expanded: live; the toggle carries aria-expanded + aria-controls.
 *  - `state` sets the initial state (docs); `[(expanded)]` binds it two-way.
 *
 *   <ats-amplify-chat-sources-row summary="Based on 14 job orders · Updated today"
 *     [sources]="[{ label: 'Senior Java Developer', entity: 'job', href: '/job/10482' }]" />
 */
@Component({
  selector: 'ats-amplify-chat-sources-row',
  imports: [Icon, IconButtonNoContainer],
  template: `
    <div class="ats-amplify-chat-sources-row__summary">
      <span class="ats-amplify-chat-sources-row__summary-text">{{ summary() }}</span>
      <button ats-icon-button-no-container class="ats-amplify-chat-sources-row__toggle"
        [icon]="isExpanded() ? 'chevron-up' : 'chevron-down'"
        [attr.aria-expanded]="isExpanded()" [attr.aria-controls]="listId"
        [attr.aria-label]="isExpanded() ? 'Hide sources' : 'Show sources'" (click)="toggle()"></button>
    </div>
    <ul class="ats-amplify-chat-sources-row__sources" [id]="listId" [hidden]="!isExpanded()" aria-label="Sources">
      @for (s of sources() ?? []; track $index) {
        <li>
          @if (s.href) {
            <a class="ats-amplify-chat-sources-row__link" [href]="s.href" (click)="sourceClick.emit(s)">
              <ats-icon name="circle" [size]="10" [color]="circle(s)" />{{ s.label }}
            </a>
          } @else {
            <button type="button" class="ats-amplify-chat-sources-row__link" (click)="sourceClick.emit(s)">
              <ats-icon name="circle" [size]="10" [color]="circle(s)" />{{ s.label }}
            </button>
          }
        </li>
      }
    </ul>
  `,
  styleUrl: './sources-row.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-sources-row', '[class.is-expanded]': 'isExpanded()' },
})
export class AmplifyChatSourcesRow {
  /** meta/default summary, e.g. "Based on 14 job orders · Updated today". */
  readonly summary = input<string>();
  /** The records the answer used. */
  readonly sources = input<AmplifyChatSource[]>();
  /** Initial Figma state (docs). Overridden once the toggle is used or `expanded` is bound. */
  readonly state = input<AmplifyChatSourcesRowState>();
  /** Two-way expanded state. */
  readonly expanded = model<boolean>();
  /** A source was activated (also fires for links, before navigation). */
  readonly sourceClick = output<AmplifyChatSource>();

  protected readonly listId = `ats-amplify-chat-sources-${nextId++}`;
  protected readonly isExpanded = computed(() => this.expanded() ?? this.state() === 'expanded');

  protected circle(s: AmplifyChatSource): string {
    // A prospect not yet in the ATS is neutral grey; once saved it is a contact (entity: 'contact').
    if (s.entity === 'prospect') return 'var(--color-entity-task)';
    return s.entity && s.entity !== 'job'
      ? `var(--color-entity-${s.entity})`
      : 'var(--amplify-chat-sources-row-sources-link-text-circle-vector-color-content-icon-color-entity-job)';
  }

  protected toggle(): void {
    this.expanded.set(!this.isExpanded());
  }
}

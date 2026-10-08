import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import { NovoChip } from '../../novo-chip/novo-chip';
import { IconButtonNoContainer } from '../../icon-button-no-container/icon-button-no-container';
import { NovoListEntity } from '../../novo-list/parts';

/** Figma amplify-context-container `Property 1`. */
export type AmplifyChatContextContainerSize = 'full page' | 'docked';

/**
 * A context item: a label, or a label + entity (sets the chip's dot color; default candidate).
 * `source: true` marks an Amplify data source rather than a record (e.g. "Prospect"): the
 * chip shows the Amplify icon (Amplify Radial) instead of an entity dot, as in Figma.
 */
export type AmplifyChatContextItem = string | { label: string; entity?: NovoListEntity; source?: boolean };

/**
 * AmplifyChatContextContainer (Figma: "amplify-context-container", set 6349:218552).
 * The context row above the chat input: "Context:" (input/label/field-label), one
 * removable NovoChip per record Amplify is working from (link-colored label, entity
 * dot, close), and a + button (IconButtonNoContainer, add-thin) at the end to add
 * context. A card-colored bar with the card border and a 2px shadow.
 *  - size `full page` (4527:169452): border/radius/md.
 *  - size `docked` (6349:218553): border/radius/sm.
 *
 *   <ats-amplify-chat-context-container [items]="['Tyler Brooks']" (removed)="drop($event)" (add)="pickRecord()" />
 *   <ats-amplify-chat-context-container size="docked" [items]="[{ label: '425 | Software Engineer', entity: 'job' }]" />
 */
@Component({
  selector: 'ats-amplify-chat-context-container',
  imports: [NovoChip, IconButtonNoContainer],
  template: `
    <span class="ats-amplify-chat-context-container__label">Context:</span>
    <div class="ats-amplify-chat-context-container__chips">
      @for (item of chips(); track $index) {
        <ats-novo-chip class="ats-amplify-chat-context-container__chip" type="link" size="medium" [icon]="item.source ? 'amplify' : 'circle'" removable
          [class.is-source]="item.source" [label]="item.label" [style.--_ctx-entity]="item.color" (removed)="removed.emit(item.label)" />
      }
    </div>
    <button ats-icon-button-no-container class="ats-amplify-chat-context-container__add" icon="add-thin" aria-label="Add context" (click)="add.emit()"></button>
  `,
  styleUrl: './amplify-context-container.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-context-container', '[attr.data-size]': 'sizeName()' },
})
export class AmplifyChatContextContainer {
  readonly size = input<AmplifyChatContextContainerSize | undefined>('full page');
  /** The context records, in order. */
  readonly items = input<AmplifyChatContextItem[] | undefined>([]);
  /** Emits the label of the chip whose remove (x) was activated. */
  readonly removed = output<string>();
  /** Emits when the + (add context) button is activated. */
  readonly add = output<void>();

  protected readonly sizeName = computed(() => this.size() ?? 'full page');
  protected readonly chips = computed(() =>
    (this.items() ?? []).map((i) => {
      const item = typeof i === 'string' ? { label: i } : i;
      const entity = item.entity ?? 'candidate';
      return {
        label: item.label,
        source: !!item.source,
        color: entity === 'candidate'
          ? 'var(--amplify-chat-context-container-chips-novo-chip-circle-vector-color-content-icon-color-entity-candidate)'
          : `var(--color-entity-${entity})`,
      };
    }),
  );
}

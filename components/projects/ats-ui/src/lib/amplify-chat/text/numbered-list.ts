import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

/**
 * AmplifyChatNumberedList (Figma: "amplify-chat/numbered-list", 6148:20804). An
 * ordered list in an Amplify chat reply — a native `<ol>`, so it keeps list
 * semantics; items are `li[ats-amplify-chat-list-item]`, numbered automatically
 * from 1, gap spacing/gap/xsm. Fills its parent's width.
 * Use only when order means something (rank, priority, steps). At least 2 items;
 * each list starts at 1 (never carry numbering across sections).
 *
 *   <ol ats-amplify-chat-numbered-list>
 *     <li ats-amplify-chat-list-item>Senior Java Developer at Verizon starts Oct 6 with no submittals.</li>
 *     <li ats-amplify-chat-list-item>Data Engineer at PepsiCo has 1 submittal and client priority High.</li>
 *   </ol>
 */
@Component({
  selector: 'ol[ats-amplify-chat-numbered-list]',
  template: `<ng-content />`,
  styleUrl: './numbered-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-numbered-list',
    // list-style: none drops list semantics in Safari/VoiceOver; restore it explicitly.
    role: 'list',
  },
})
export class AmplifyChatNumberedList {}

/**
 * AmplifyChatListItem (Figma: "amplify-chat/list-item", 6148:20801). One item in an
 * AmplifyChatNumberedList: a 16px right-aligned marker column (list indent =
 * spacing/padding/md) in body/default color/text/secondary, then the projected text
 * in body/default color/text/body (may contain entity links). The marker counts
 * automatically; `number` overrides its text (e.g. "4."). One idea per item, under
 * two lines where possible.
 *
 *   <li ats-amplify-chat-list-item>Project Manager at Acme has an interview pending feedback.</li>
 */
@Component({
  selector: 'li[ats-amplify-chat-list-item]',
  template: `
    <span class="ats-amplify-chat-list-item__marker" aria-hidden="true">{{ number() }}</span>
    <span class="ats-amplify-chat-list-item__text"><ng-content /></span>
  `,
  styleUrl: './numbered-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-list-item',
    '[class.has-number]': 'hasNumber()',
  },
})
export class AmplifyChatListItem {
  /** Marker text override (Figma `number`, e.g. "1."). Unset → automatic count. */
  readonly number = input<string>();
  protected readonly hasNumber = computed(() => !!this.number());
}

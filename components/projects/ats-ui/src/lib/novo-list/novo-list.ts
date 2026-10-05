import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * NovoList (Figma: "novo-list", 692:20779 / 575:5824). Port of the prototype
 * repo's NovoList.astro: a vertical stack of list items with a divider between
 * them (the last item drops its divider). Project items or item presets:
 *
 *   <ats-novo-list>
 *     <ats-novo-list-item-default entity="candidate" title="2034 | Tyler Brooks" />
 *     <ats-novo-list-item-task title="Call Tyler Brooks" />
 *   </ats-novo-list>
 */
@Component({
  selector: 'ats-novo-list',
  template: '<ng-content />',
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-novo-list', role: 'list' },
})
export class NovoList {}

/**
 * NovoListItem (Figma: "novo-list-item", 182:18861). The row container: padding
 * plus a bottom divider. Project an <ats-item-header> and/or <ats-item-content>,
 * or use one of the presets (default / task / note / submission).
 */
@Component({
  selector: 'ats-novo-list-item',
  template: '<ng-content />',
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-novo-list-item', role: 'listitem' },
})
export class NovoListItem {}

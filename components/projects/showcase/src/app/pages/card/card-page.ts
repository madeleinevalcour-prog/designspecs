import { Component, booleanAttribute, computed, input } from '@angular/core';
import { Card, CardActions, CardDetailRow, CardResume, CardVariant, RecordDetailsField, RecordDetailsList, ValueWithLabel } from 'ats-ui';

type Part = 'actions' | 'detail-row' | 'value-with-label' | 'record-details-list';
type EmbedVariant = CardVariant | 'columns';
type RowKind = 'text' | 'multi' | 'select' | 'link' | 'all';

/**
 * /card — full reference for the card family (mirrors the prototype repo's
 * /components/card): Card variants, the "columns" details body, and every subcomponent.
 *
 * Embed mode — pass `variant` (one card) or `part` (one subcomponent), e.g.
 *   /examples/card?variant=details&footer=true
 *   /examples/card?part=detail-row&kind=all
 * Card params:
 *   variant = resume | details | notes | tasks | submissions | columns
 *             (columns = details card with a record-details-list body)
 *   footer=true      show the "View All" footer       title=…  override the header title
 *   footerLabel=…    footer button text                icon=…   override the header icon
 *   settings=true    add Configure to the header actions
 *   iconColor=…      header icon color, e.g. var(--color-entity-submission)
 *   gripper=false    hide the drag gripper;  gripper=shown  force it visible (normally hover-only)
 *   body=none        header + footer only (notes / tasks / submissions have no body yet)
 *   width=…          card / part width in px (default 400; 760 for columns + record-details-list)
 *   columns=…        grid columns for variant=columns (default 3)
 * Part params:
 *   part = actions | detail-row | value-with-label | record-details-list
 *   settings=true    (actions) show Configure
 *   kind = text | multi | select | link | all   (detail-row; default all)
 *   columns=…        (record-details-list; default 3)
 */
@Component({
  imports: [Card, CardActions, CardDetailRow, CardResume, RecordDetailsList, ValueWithLabel],
  selector: 'app-card-page',
  styleUrl: './card-page.css',
  templateUrl: './card-page.html',
})
export class CardPage {
  // Bound from query params. Absent params arrive as `undefined` (overriding any
  // input default), so defaults are applied in the computeds below.
  readonly variant = input<EmbedVariant>();
  readonly part = input<Part>();
  readonly footer = input(false, { transform: (v: unknown) => v != null && booleanAttribute(v) });
  readonly settings = input(false, { transform: (v: unknown) => v != null && booleanAttribute(v) });
  readonly title = input<string>();
  readonly icon = input<string>();
  readonly footerLabel = input<string>();
  readonly iconColor = input<string>();
  readonly gripper = input<string>();
  readonly body = input<string>();
  readonly width = input<string>();
  readonly columns = input<string>();
  readonly kind = input<RowKind>();

  protected readonly embed = computed(() => !!this.variant() || !!this.part());
  protected readonly cardVariant = computed<CardVariant>(() => {
    const v = this.variant();
    return v === 'columns' ? 'details' : (v ?? 'details');
  });
  protected readonly isColumns = computed(() => this.variant() === 'columns');
  protected readonly cardTitle = computed(() => this.title() ?? (this.isColumns() ? 'Record Details' : undefined));
  protected readonly showGripper = computed(() => this.gripper() !== 'false');
  protected readonly forceGripper = computed(() => this.gripper() === 'shown');
  protected readonly hasBody = computed(() => this.body() !== 'none');
  protected readonly cardWidth = computed(() => Number(this.width()) || (this.isColumns() || this.part() === 'record-details-list' ? 760 : 400));
  protected readonly cols = computed(() => Number(this.columns()) || 3);
  protected readonly embedFooterLabel = computed(() => this.footerLabel() ?? 'View All');
  protected readonly rowKinds = computed(() => {
    const k = this.kind() ?? 'all';
    return (['text', 'multi', 'select', 'link'] as const).filter((x) => k === 'all' || k === x);
  });

  // ---- sample data (from the prototype repo's showcase + record pages) ----
  protected readonly details = [
    { label: 'Owner', value: 'Chloe Davis' },
    { label: 'Status', value: 'Active' },
    { label: 'Source', value: 'Referral' },
    { label: 'Date Added', value: '07/16/2026' },
    { label: 'Employment Preference', value: 'Permanent, Contract' },
    { label: 'Location', value: 'Columbus, OH' },
  ];
  protected readonly skills = ['JavaScript', 'React', 'SQL', 'Git', 'Agile', 'RESTful APIs'];
  protected readonly recordFields: RecordDetailsField[] = [
    { label: 'Consultant', value: 'Chloe Davis' },
    { label: 'Owner', value: 'Marcus Lee' },
    { label: 'Employment Preference', value: 'Permanent, Contract' },
    { label: 'Current Company', value: 'Nexus Dynamics' },
    { label: 'Current Job Title', value: 'Software Engineer' },
    { label: 'Date Available', value: '06/23/2026', plain: true },
    { label: 'Personal Email', value: 'tyler.brooks@email.com' },
    { label: 'Work Email', value: 't.brooks@nexus.com' },
    { label: 'Address', value: 'Columbus, OH' },
    { label: 'Willing to relocate', value: 'Yes', plain: true },
    { label: 'Date Added', value: '07/16/2026', plain: true, icon: 'calendar' },
    { label: 'Opted Out', value: 'No', plain: true },
  ];
  protected readonly listVariants: CardVariant[] = ['notes', 'tasks', 'submissions'];
}

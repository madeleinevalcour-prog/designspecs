import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { IconContainer, IconContainerTheme } from '../icon-container/icon-container';
import { NovoChip } from '../novo-chip/novo-chip';

// Sub-components of the Figma novo-list family (Component Migration, panel 46:3355).
// Inputs accept `undefined` and fall back in computeds, so an unset binding (e.g. a
// missing query param) still renders the Figma default.

/** Entities with a `--color-entity-<entity>` token and a glyph in the icon set. */
export type NovoListEntity =
  | 'candidate' | 'contact' | 'company' | 'lead' | 'opportunity'
  | 'job' | 'submission' | 'placement' | 'note' | 'task';

/** Figma "item-content" `type` values (the single icon + text field). */
export type ItemFieldType =
  | 'caption' | 'status' | 'company' | 'email' | 'phone' | 'location' | 'date'
  | 'contact' | 'owner' | 'note-action' | 'candidate' | 'date-time';

/** One field in an item-data row. `type` picks the Figma icon + color; `icon` overrides the glyph. */
export interface NovoListField { type?: ItemFieldType; icon?: string; text: string; }

// item-avatar `entity` → icon-container theme. Figma names jobs `jobs` and note `neutral`;
// task has no icon-container theme, so it keeps its own entity color as a fill override.
const ENTITY_THEME: Record<NovoListEntity, IconContainerTheme> = {
  candidate: 'candidate', contact: 'contact', company: 'company', lead: 'lead', opportunity: 'opportunity',
  job: 'jobs', submission: 'submission', placement: 'placement', note: 'neutral', task: 'neutral',
};

const FIELD_ICON: Record<Exclude<ItemFieldType, 'date-time'>, string> = {
  caption: 'info', status: 'info', company: 'company', email: 'email', phone: 'phone',
  location: 'location', date: 'calendar', contact: 'contact', owner: 'user',
  'note-action': 'note', candidate: 'candidate',
};
// Figma tints these three field icons with their entity color; the rest use color/icon/illustration.
const FIELD_COLOR: Partial<Record<ItemFieldType, string>> = {
  company: 'var(--color-entity-company)',
  contact: 'var(--color-entity-contact)',
  candidate: 'var(--color-entity-candidate)',
};

/**
 * ItemAvatar (Figma: "item-avatar", 573:2747). Three options:
 * - `header`  (573:2051): a 14px icon (default `preview`), e.g. the task circle-outline.
 * - `entity`  (1071:21094): an IconContainer instance (size sm: 24px, entity fill,
 *   12px glyph in `icon-container/icon`).
 * - `content` (573:2748): a 16px icon (default `preview`), used by the horizontal list.
 *
 *   <ats-item-avatar option="entity" entity="job" />
 *   <ats-item-avatar icon="circle-outline" />
 */
@Component({
  selector: 'ats-item-avatar',
  imports: [Icon, IconContainer],
  template: `
    @if (opt() === 'entity') {
      <ats-icon-container size="sm" [theme]="theme()" [icon]="icon() ?? entityName()" [background]="fill()" />
    } @else {
      <ats-icon [name]="icon() ?? 'preview'" [size]="opt() === 'content' ? 16 : 14" [color]="color()" />
    }
  `,
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-item-avatar', '[attr.data-option]': 'opt()', '[attr.data-entity]': "opt() === 'entity' ? entityName() : null" },
})
export class ItemAvatar {
  readonly option = input<'header' | 'entity' | 'content' | undefined>('header');
  readonly entity = input<NovoListEntity | undefined>('candidate');
  /** Glyph override (header / content: the icon; entity: replaces the entity glyph). */
  readonly icon = input<string>();
  /** Icon color for header / content (any CSS color or var()); illustration color by default. */
  readonly color = input<string>();
  protected readonly opt = computed(() => this.option() ?? 'header');
  protected readonly entityName = computed(() => this.entity() ?? 'candidate');
  protected readonly theme = computed(() => ENTITY_THEME[this.entityName()]);
  protected readonly fill = computed(() => (this.entityName() === 'task' ? 'var(--color-entity-task)' : undefined));
}

/**
 * LinkText (Figma: "link-text", 737:11402). Optional circle (an entity dot) + a
 * medium-weight label in `link-text/color/default`. It is styled as a link but is
 * not one: the whole list item is the click target.
 *  - size `large` (default): 12px circle, body/lg-medium.
 *  - size `default`: 10px circle, body/default-medium (e.g. the Amplify clarify-option record).
 *
 *   <ats-link-text text="425 | Software Engineer" circle="var(--color-entity-job)" />
 *   <ats-link-text size="default" text="425 | Software Engineer" circle="var(--color-entity-job)" />
 */
@Component({
  selector: 'ats-link-text',
  imports: [Icon],
  template: `
    @if (circle()) { <ats-icon name="circle" [size]="sizeName() === 'default' ? 10 : 12" [color]="circle()" /> }
    <span class="ats-link-text__label">{{ text() }}</span>
  `,
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-link-text', '[attr.data-size]': 'sizeName()' },
})
export class LinkText {
  readonly text = input.required<string>();
  /** Color of the leading circle; omit to hide it (Figma `showEntity`). */
  readonly circle = input<string>();
  readonly size = input<'large' | 'default' | undefined>('large');
  protected readonly sizeName = computed(() => this.size() ?? 'large');
}

/**
 * ItemField (Figma: "item-content", 157:2960, `type=…`). The single field: a 12px
 * icon + input/value/sm label in `color/text/body`. Two special types:
 * - `caption`: 10px info icon + meta/sm label in `list-item/color/content/disabled`.
 * - `date-time`: stacked meta/default date (`content/body`) over time (`content/subtle`).
 *
 *   <ats-item-field type="email" text="name@email.com" />
 *   <ats-item-field type="date-time" date="May 23, 2024" time="12:00 PM" />
 */
@Component({
  selector: 'ats-item-field',
  imports: [Icon],
  template: `
    @if (kind() === 'date-time') {
      <span class="ats-item-field__date">{{ date() }}</span>
      <span class="ats-item-field__time">{{ time() }}</span>
    } @else {
      <ats-icon [name]="glyph()" [size]="kind() === 'caption' ? 10 : 12" [color]="tint()" />
      <span class="ats-item-field__text">{{ text() }}</span>
    }
  `,
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-item-field', '[attr.data-type]': 'kind()' },
})
export class ItemField {
  readonly type = input<ItemFieldType | undefined>('status');
  readonly text = input<string>();
  /** Glyph override; defaults to the Figma icon for the type. */
  readonly icon = input<string>();
  readonly date = input<string>();
  readonly time = input<string>();
  protected readonly kind = computed(() => this.type() ?? 'status');
  protected readonly glyph = computed(() => {
    const k = this.kind();
    return this.icon() ?? (k === 'date-time' ? 'calendar' : FIELD_ICON[k]);
  });
  // An explicit `icon` without a `type` keeps the illustration color.
  protected readonly tint = computed(() => (this.type() ? FIELD_COLOR[this.kind()] : undefined));
}

/**
 * ItemData (Figma: "item-data", 182:18804). A wrapping row of ItemFields
 * (row gap 8 / column gap 16). Extra projected content (e.g. a button) sits at the end.
 *
 *   <ats-item-data [fields]="[{ type: 'company', text: 'Nexus Dynamics' }]" />
 */
@Component({
  selector: 'ats-item-data',
  imports: [ItemField],
  template: `
    @for (f of fieldList(); track $index) { <ats-item-field [type]="f.type" [icon]="f.icon" [text]="f.text" /> }
    <ng-content />
  `,
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-item-data' },
})
export class ItemData {
  readonly fields = input<NovoListField[] | undefined>([]);
  protected readonly fieldList = computed(() => this.fields() ?? []);
}

/**
 * ItemComment (Figma: "comment", 574:2866). ItemData over an optional body/default
 * paragraph in `list-item/color/content/body`. Content projected with the
 * `itemData` attribute goes at the end of the data row.
 */
@Component({
  selector: 'ats-item-comment',
  imports: [ItemData],
  template: `
    <ats-item-data [fields]="fields()"><ng-content select="[itemData]" /></ats-item-data>
    @if (body()) { <p class="ats-item-comment__body">{{ body() }}</p> }
  `,
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-item-comment' },
})
export class ItemComment {
  readonly fields = input<NovoListField[] | undefined>([]);
  readonly body = input<string>();
}

/**
 * ItemContent (Figma: "item-content", 573:1676). Two types:
 * - `vertical-list` (574:3106): an ItemComment, then any projected content (Figma "Slot").
 * - `horizontal-list` (573:2004): content avatar (16px preview) + date-time + ItemComment,
 *   gap 16. Used by the note preset.
 *
 *   <ats-item-content [fields]="fields" body="Tyler is Pre-Registered…" />
 *   <ats-item-content type="horizontal-list" date="May 23, 2024" time="12:00 PM" [fields]="fields" body="…" />
 */
@Component({
  selector: 'ats-item-content',
  imports: [ItemAvatar, ItemField, ItemComment],
  template: `
    @if (kind() === 'horizontal-list') {
      <ats-item-avatar option="content" [icon]="avatarIcon()" />
      <ats-item-field type="date-time" [date]="date()" [time]="time()" />
    }
    <ats-item-comment [fields]="fields()" [body]="body()"><ng-container ngProjectAs="[itemData]"><ng-content select="[itemData]" /></ng-container></ats-item-comment>
    <ng-content />
  `,
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-item-content', '[attr.data-type]': 'kind()' },
})
export class ItemContent {
  readonly type = input<'vertical-list' | 'horizontal-list' | undefined>('vertical-list');
  readonly fields = input<NovoListField[] | undefined>([]);
  readonly body = input<string>();
  /** horizontal-list only. */
  readonly date = input<string>();
  readonly time = input<string>();
  readonly avatarIcon = input<string>();
  protected readonly kind = computed(() => this.type() ?? 'vertical-list');
}

/**
 * RelevancyDots (Figma: "relevancy-dots", 709:22231). Five 8px dots, gap 4. The
 * first `value` dots are solid `color/blue/medium-blue`; the rest are
 * `color/utility/blue/100` with a 1px medium-blue ring.
 *
 *   <ats-relevancy-dots [value]="3" />
 */
@Component({
  selector: 'ats-relevancy-dots',
  template: `@for (d of dots(); track $index) { <span class="ats-relevancy-dots__dot" [class.is-on]="d"></span> }`,
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-relevancy-dots', role: 'img', '[attr.aria-label]': '"Relevancy " + level() + " of 5"' },
})
export class RelevancyDots {
  readonly value = input<number | undefined>(3);
  protected readonly level = computed(() => Math.max(0, Math.min(5, Math.round(this.value() ?? 3))));
  protected readonly dots = computed(() => [0, 1, 2, 3, 4].map((i) => i < this.level()));
}

/**
 * ItemHeader (Figma: "item-header", 2200:30194). Two themes:
 * - `standard` (182:18817): [avatar] slot (an <ats-item-avatar>), optional link text,
 *   optional title (body/lg-medium, `list-item/color/content/header`), [indicator] slot
 *   (Figma's caption + indicator chip). Gap 8.
 * - `candidate-list` (6213:169090): [controls] slot (Figma: checkbox + content avatar,
 *   gap 8), then link text + a body/default second title in `content/subtle`
 *   (baseline-aligned), RelevancyDots, [indicator] slot. Gap 16.
 * Both end with Figma's "caption" group (2868:68046, gap 4): an optional caption
 * field (`caption`) and the indicator chip (`indicator`): a NovoChip, positive /
 * medium with the bolt glyph, e.g. "10 New Results". Hidden unless set.
 *
 *   <ats-item-header title="2034 | Tyler Brooks"><ats-item-avatar avatar option="entity" /></ats-item-header>
 *   <ats-item-header link="Call Tyler Brooks"><ats-item-avatar avatar icon="circle-outline" /></ats-item-header>
 *   <ats-item-header title="Saved search" indicator="10 New Results" />
 */
@Component({
  selector: 'ats-item-header',
  imports: [LinkText, RelevancyDots, ItemField, NovoChip],
  template: `
    @if (themeName() === 'candidate-list') {
      <span class="ats-item-header__controls"><ng-content select="[controls]" /></span>
      <span class="ats-item-header__item-title">
        @if (link()) { <ats-link-text [text]="link()!" [circle]="linkCircle()" /> }
        @if (secondTitle()) { <span class="ats-item-header__second-title">{{ secondTitle() }}</span> }
      </span>
      @if (relevancy() != null) { <ats-relevancy-dots [value]="relevancy()" /> }
    } @else {
      <ng-content select="[avatar]" />
      @if (link()) { <ats-link-text [text]="link()!" [circle]="linkCircle()" /> }
      @if (title()) { <p class="ats-item-header__title">{{ title() }}</p> }
    }
    @if (caption() || indicator()) {
      <span class="ats-item-header__caption">
        @if (caption()) { <ats-item-field type="caption" [text]="caption()" /> }
        @if (indicator()) { <ats-novo-chip color="positive" size="medium" icon="bolt" [label]="indicator()" /> }
      </span>
    }
    <ng-content select="[indicator]" />
  `,
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `title` is an input; drop the native attribute so it doesn't show a tooltip.
  host: { class: 'ats-item-header', '[attr.data-theme]': 'themeName()', '[attr.title]': 'null' },
})
export class ItemHeader {
  readonly theme = input<'standard' | 'candidate-list' | undefined>('standard');
  /** Headline-colored title (standard theme). */
  readonly title = input<string>();
  /** Link-colored LinkText label. */
  readonly link = input<string>();
  /** Color of LinkText's leading circle; omit to hide it. */
  readonly linkCircle = input<string>();
  /** candidate-list only. */
  readonly secondTitle = input<string>();
  /** candidate-list only: 0–5; omit to hide the dots. */
  readonly relevancy = input<number>();
  /** Caption field before the indicator chip (Figma caption > item-content). */
  readonly caption = input<string>();
  /** Indicator chip label, e.g. "10 New Results"; omit to hide the chip. */
  readonly indicator = input<string>();
  protected readonly themeName = computed(() => this.theme() ?? 'standard');
}

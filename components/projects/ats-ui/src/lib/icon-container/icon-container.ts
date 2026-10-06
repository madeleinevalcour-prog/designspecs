import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';

/** Figma icon-container `theme` values (component set 164:17910). */
export type IconContainerTheme =
  | 'jobs' | 'candidate' | 'contact' | 'company' | 'neutral'
  | 'opportunity' | 'lead' | 'placement' | 'submission' | 'amplify';

/** Figma icon-container `size`: sm 24 (12px glyph) · md 40 (20px) · lg 48 (24px). */
export type IconContainerSize = 'sm' | 'md' | 'lg';

const GLYPH_SIZE: Record<IconContainerSize, number> = { sm: 12, md: 20, lg: 24 };

// Default glyph per theme. Figma's base variants all show the Candidate glyph as a
// placeholder; the entity's own glyph is what every instance actually uses.
const DEFAULT_GLYPH: Record<IconContainerTheme, string> = {
  jobs: 'job', candidate: 'candidate', contact: 'contact', company: 'company', neutral: 'note',
  opportunity: 'opportunity', lead: 'lead', placement: 'placement', submission: 'submission', amplify: 'amplify',
};

/**
 * IconContainer (Figma: "icon-container", 164:17910). A rounded square filled with
 * an entity color (`color/entity/*`; `neutral` = `color/entity/note`, `amplify` =
 * the Amplify Radial gradient) holding one knockout glyph (`icon-container/icon`).
 *
 *   <ats-icon-container theme="candidate" />                 24px, candidate glyph
 *   <ats-icon-container theme="amplify" size="md" />         40px Amplify gradient
 *   <ats-icon-container theme="neutral" size="md" icon="dashboard" />
 *
 * `background` paints an entity that has no Figma theme (e.g.
 * `var(--color-entity-task)`); it overrides the theme fill.
 * Decorative (the glyph is aria-hidden); label the surrounding control.
 */
@Component({
  selector: 'ats-icon-container',
  imports: [Icon],
  template: `<ats-icon [name]="glyph()" [size]="glyphSize()" color="var(--icon-container-icon)" />`,
  styleUrl: './icon-container.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-icon-container',
    '[attr.data-theme]': 'themeName()',
    '[attr.data-size]': 'sizeName()',
    '[style.background]': 'background() || null',
  },
})
export class IconContainer {
  readonly theme = input<IconContainerTheme | undefined>('jobs');
  readonly size = input<IconContainerSize | undefined>('sm');
  /** Glyph name from the icon set; defaults to the theme's entity glyph. */
  readonly icon = input<string>();
  /** Fill override (any CSS color / var()) for an entity without a Figma theme. */
  readonly background = input<string>();

  protected readonly themeName = computed(() => this.theme() ?? 'jobs');
  protected readonly sizeName = computed(() => this.size() ?? 'sm');
  protected readonly glyph = computed(() => this.icon() ?? DEFAULT_GLYPH[this.themeName()]);
  protected readonly glyphSize = computed(() => GLYPH_SIZE[this.sizeName()]);
}

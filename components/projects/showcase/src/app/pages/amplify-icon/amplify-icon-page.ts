import { Component, computed, input } from '@angular/core';
import { Icon } from 'ats-ui';

type Variant = 'filled' | 'line';
type Treatment = 'radial' | 'knockout';

const GLYPH: Record<Variant, string> = { filled: 'amplify', line: 'amplify-line' };
const SIZES = [12, 14, 16, 24];

/**
 * /amplify-icon — the Amplify icon (`amplify` filled, `amplify-line` line) in the sizes and
 * color treatments ats-ui uses. No new component: it's <ats-icon name="amplify">.
 *
 * Treatments, as the lib applies them:
 *   radial   — the glyph mask filled with the Icon/Amplify Radial gradient (Bowling Alley tab,
 *              reply identity, status line, docked mark, relevance signals, Reveal, source chips)
 *   knockout — the glyph in color/icon/icon-knockout on an Amplify fill (Icon Container
 *              amplify theme, primary amplify button)
 *
 * Embed mode: any of `variant` (filled | line), `size` (px), `treatment` (radial | knockout), e.g.
 *   /examples/amplify-icon?variant=line&size=16&treatment=radial
 * No params → the full matrix (variants × treatments × sizes 12, 14, 16, 24).
 */
@Component({
  imports: [Icon],
  selector: 'app-amplify-icon-page',
  templateUrl: './amplify-icon-page.html',
  styleUrl: './amplify-icon-page.css',
})
export class AmplifyIconPage {
  readonly variant = input<string>();
  readonly size = input<string>();
  readonly treatment = input<string>();

  protected readonly embed = computed(() => this.variant() != null || this.size() != null || this.treatment() != null);
  // Defaults in computeds: unset query params bind as undefined and would override input defaults.
  protected readonly variantName = computed<Variant>(() => (this.variant() === 'line' ? 'line' : 'filled'));
  protected readonly sizePx = computed(() => Number(this.size() ?? 24) || 24);
  protected readonly treatmentName = computed<Treatment>(() => (this.treatment() === 'knockout' ? 'knockout' : 'radial'));
  protected readonly glyph = computed(() => GLYPH[this.variantName()]);

  protected readonly variants: Variant[] = ['filled', 'line'];
  protected readonly treatments: Treatment[] = ['radial', 'knockout'];
  protected readonly sizes = SIZES;
  protected readonly glyphs = GLYPH;
}

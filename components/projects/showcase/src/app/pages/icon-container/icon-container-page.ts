import { Component, computed, input } from '@angular/core';
import { IconContainer, IconContainerSize, IconContainerTheme } from 'ats-ui';

const ALL_THEMES: IconContainerTheme[] = [
  'candidate', 'contact', 'company', 'lead', 'opportunity', 'jobs', 'placement', 'submission', 'neutral', 'amplify',
];
const ALL_SIZES: IconContainerSize[] = ['sm', 'md', 'lg'];

/**
 * /icon-container — IconContainer (Figma 164:17910): theme × size matrix.
 *
 * Embed mode: pass `themes`, `sizes` or `icon` to render a compact row, e.g.
 *   /examples/icon-container?themes=candidate,contact,company&sizes=md
 *   /examples/icon-container?sizes=sm,md,lg&themes=amplify
 *   /examples/icon-container?themes=neutral&sizes=md&icon=dashboard
 * Params: themes (comma list of candidate|contact|company|lead|opportunity|jobs|
 *         placement|submission|neutral|amplify; default all),
 *         sizes (comma list of sm|md|lg; default "sm"),
 *         icon (glyph override for every cell; default each theme's entity glyph),
 *         captions=false hides the labels.
 * The row steps through themes × sizes (themes outer).
 */
@Component({
  imports: [IconContainer],
  selector: 'app-icon-container-page',
  styleUrl: './icon-container-page.css',
  template: `
    @if (embed()) {
      <div class="embed-row">
        @for (c of cells(); track c.caption) {
          <div class="embed-cell">
            <ats-icon-container [theme]="c.theme" [size]="c.size" [icon]="icon()" />
            @if (captions()) { <span class="caption">{{ c.caption }}</span> }
          </div>
        }
      </div>
    } @else {
      <h1>Icon Container</h1>
      <p class="lede">
        Angular build of the Figma <code>icon-container</code> component set (164:17910): an entity-colored
        square (<code>color/entity/*</code>) with one knockout glyph (<code>icon-container/icon</code>).
        Used by the Novo List entity avatar and the bowling alley's Menu and Add chips.
      </p>
      <section>
        <h2>Theme × size</h2>
        <div class="grid">
          <span class="col-head"></span>
          @for (s of allSizes; track s) { <span class="col-head">{{ s }}</span> }
          @for (t of allThemes; track t) {
            <span class="row-head">{{ t }}</span>
            @for (s of allSizes; track s) { <span class="cell"><ats-icon-container [theme]="t" [size]="s" /></span> }
          }
        </div>
      </section>
      <section>
        <h2>Glyph override and fill override</h2>
        <p class="lede">Neutral with app glyphs, as in the bowling alley Menu; <code>background</code> paints an entity without a Figma theme (task).</p>
        <div class="row">
          <ats-icon-container theme="neutral" size="md" icon="dashboard" />
          <ats-icon-container theme="neutral" size="md" icon="automation" />
          <ats-icon-container theme="amplify" size="md" />
          <ats-icon-container size="md" icon="task" background="var(--color-entity-task)" />
        </div>
      </section>
    }
  `,
})
export class IconContainerPage {
  // Absent query params arrive as `undefined`, so defaults live in the computeds.
  readonly themes = input<string>();
  readonly sizes = input<string>();
  readonly icon = input<string>();
  readonly captions = input(true, { transform: (v: unknown) => v !== 'false' });

  protected readonly allThemes = ALL_THEMES;
  protected readonly allSizes = ALL_SIZES;
  protected readonly embed = computed(() => this.themes() !== undefined || this.sizes() !== undefined || this.icon() !== undefined);
  protected readonly cells = computed(() => {
    const themes = pick(this.themes(), ALL_THEMES, ALL_THEMES);
    const sizes = pick(this.sizes(), ALL_SIZES, ['sm']);
    const both = themes.length > 1 && sizes.length > 1;
    return themes.flatMap((theme) =>
      sizes.map((size) => ({ theme, size, caption: both ? `${theme} · ${size}` : sizes.length > 1 ? size : theme })),
    );
  });
}

function pick<T extends string>(param: string | undefined, all: T[], fallback: T[]): T[] {
  const wanted = param?.split(',').map((s) => s.trim()).filter(Boolean);
  const out = wanted?.length ? all.filter((v) => wanted.includes(v)) : [];
  return out.length ? out : fallback;
}

import { Component, computed, input, signal } from '@angular/core';
import { NovoChip, NovoChipColor, NovoChipSize, NovoChipState, NovoChipType } from 'ats-ui';

type StateKey = 'default' | NovoChipState;
const ALL_TYPES: NovoChipType[] = ['default', 'link'];
const ALL_SIZES: NovoChipSize[] = ['small', 'medium', 'large'];
const ALL_COLORS: NovoChipColor[] = ['default', 'negative', 'warning', 'positive', 'success'];
const ALL_STATES: StateKey[] = ['default', 'hover', 'focus'];

/**
 * /novo-chip — NovoChip (Figma novo-chip 157:2949, panel 45:445): for each color,
 * state × (type × size), as laid out in Figma, plus a live removable group.
 *
 * Embed mode: pass any of the params below to render a compact row, e.g.
 *   /examples/novo-chip?colors=default,negative,warning,positive,success
 *   /examples/novo-chip?sizes=small,medium,large&states=default,hover,focus
 *   /examples/novo-chip?types=link&colors=default,negative
 *   /examples/novo-chip?colors=positive&removable=false&label=10%20New%20Results
 *   /examples/novo-chip?demo=group
 * Params: types (comma list of default|link; default "default"),
 *         sizes (comma list of small|medium|large; default "medium"),
 *         colors (comma list of default|negative|warning|positive|success; default "default"),
 *         states (comma list of default|hover|focus; default "default"; hover/focus are forced),
 *         label (default "label"), icon (leading glyph, default "bolt"; "none" hides it),
 *         removable=false hides the remove button, captions=false hides the labels,
 *         demo=group renders the live removable group instead.
 * The row steps through colors × types × sizes × states (colors outermost).
 */
@Component({
  imports: [NovoChip],
  selector: 'app-novo-chip-page',
  styleUrl: './novo-chip-page.css',
  templateUrl: './novo-chip-page.html',
})
export class NovoChipPage {
  // Absent query params arrive as `undefined`, so defaults live in the computeds.
  readonly types = input<string>();
  readonly sizes = input<string>();
  readonly colors = input<string>();
  readonly states = input<string>();
  readonly label = input<string>();
  readonly icon = input<string>();
  readonly removable = input<string>();
  readonly demo = input<string>();
  readonly captions = input(true, { transform: (v: unknown) => v !== 'false' });

  protected readonly allTypes = ALL_TYPES;
  protected readonly allSizes = ALL_SIZES;
  protected readonly allColors = ALL_COLORS;
  protected readonly allStates = ALL_STATES;

  protected readonly embed = computed(() =>
    [this.types(), this.sizes(), this.colors(), this.states(), this.label(), this.icon(), this.removable(), this.demo()].some((v) => v !== undefined),
  );
  protected readonly groupOnly = computed(() => this.demo() === 'group');
  protected readonly embedLabel = computed(() => this.label() ?? 'label');
  protected readonly embedIcon = computed(() => (this.icon() === 'none' ? undefined : this.icon() ?? 'bolt'));
  protected readonly embedRemovable = computed(() => this.removable() !== 'false');
  protected readonly cells = computed(() => {
    const colors = pick(this.colors(), ALL_COLORS, ['default']);
    const types = pick(this.types(), ALL_TYPES, ['default']);
    const sizes = pick(this.sizes(), ALL_SIZES, ['medium']);
    const states = pick(this.states(), ALL_STATES, ['default']);
    const out: { color: NovoChipColor; type: NovoChipType; size: NovoChipSize; state: StateKey; caption: string }[] = [];
    for (const color of colors) for (const type of types) for (const size of sizes) for (const state of states) {
      const parts = [colors.length > 1 && color, types.length > 1 && type, sizes.length > 1 && size, states.length > 1 && state].filter(Boolean);
      out.push({ color, type, size, state, caption: parts.join(' · ') || color });
    }
    return out;
  });

  protected forced(state: StateKey): NovoChipState | undefined {
    return state === 'default' ? undefined : state;
  }

  // ---- live removable group ----
  private readonly initialSkills = ['Java', 'Kubernetes', 'AWS', 'Terraform', 'Python'];
  protected readonly skills = signal(this.initialSkills);
  protected remove(skill: string): void {
    this.skills.update((list) => list.filter((s) => s !== skill));
  }
  protected reset(): void {
    this.skills.set(this.initialSkills);
  }
}

function pick<T extends string>(param: string | undefined, all: T[], fallback: T[]): T[] {
  const wanted = param?.split(',').map((s) => s.trim()).filter(Boolean);
  const out = wanted?.length ? all.filter((v) => wanted.includes(v)) : [];
  return out.length ? out : fallback;
}

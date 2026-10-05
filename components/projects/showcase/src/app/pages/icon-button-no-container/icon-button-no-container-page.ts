import { Component, computed, input } from '@angular/core';
import { IconButtonNoContainer, IconButtonNoContainerState } from 'ats-ui';

type StateKey = 'default' | IconButtonNoContainerState | 'disabled';
const ALL_STATES: StateKey[] = ['default', 'hover', 'focus', 'active', 'disabled'];

/**
 * /icon-button-no-container — every state (mirrors the bottom of the prototype
 * repo's /components/buttons), plus glyph examples.
 *
 * Embed mode: pass `states` and/or `icon` to render one compact row, e.g.
 *   /examples/icon-button-no-container?states=default,hover,focus
 *   /examples/icon-button-no-container?icon=close&label=Remove&states=default,hover
 * Params: states (comma list of default|hover|focus|active|disabled; default all),
 *         icon (icon-set name; default chevron-down), label (aria-label; default "Expand"),
 *         captions=false to hide the state labels.
 */
@Component({
  imports: [IconButtonNoContainer],
  selector: 'app-icon-button-no-container-page',
  styleUrl: './icon-button-no-container-page.css',
  templateUrl: './icon-button-no-container-page.html',
})
export class IconButtonNoContainerPage {
  // Absent query params arrive as `undefined`, so defaults live in the computeds.
  readonly states = input<string>();
  readonly icon = input<string>();
  readonly label = input<string>();
  readonly captions = input(true, { transform: (v: unknown) => v !== 'false' });

  protected readonly embed = computed(() => this.states() !== undefined || this.icon() !== undefined);
  protected readonly embedIcon = computed(() => this.icon() || 'chevron-down');
  protected readonly embedLabel = computed(() => this.label() || 'Expand');
  protected readonly embedStates = computed<StateKey[]>(() => {
    const wanted = this.states()?.split(',').map((s) => s.trim()).filter(Boolean);
    return wanted?.length ? ALL_STATES.filter((s) => wanted.includes(s)) : ALL_STATES;
  });

  protected readonly allStates = ALL_STATES;
  protected readonly glyphs = ['chevron-down', 'chevron-up', 'close', 'kebab-menu', 'edit', 'external-open'];

  protected forced(state: StateKey): IconButtonNoContainerState | undefined {
    return state === 'default' || state === 'disabled' ? undefined : state;
  }
}

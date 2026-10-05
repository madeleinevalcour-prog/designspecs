import { NgTemplateOutlet } from '@angular/common';
import { Component, booleanAttribute, computed, input } from '@angular/core';
import { Button, ButtonColor, ButtonSize, ButtonState, ButtonTheme } from 'ats-ui';

type StateKey = 'default' | ButtonState | 'disabled';
const ALL_STATES: StateKey[] = ['default', 'hover', 'focus', 'active', 'disabled'];

/**
 * /button — full reference matrix (mirrors the prototype repo's /components/buttons).
 *
 * Embed mode: pass `theme` to render one row of states for a docs page, e.g.
 *   /examples/button?theme=primary&label=Save%20changes&states=default,hover,disabled
 * Params: theme, size, color, label, iconLeft, iconRight, pill,
 *         states (comma list of default|hover|focus|active|disabled; default all),
 *         captions=false to hide the state labels.
 */
@Component({
  imports: [Button, NgTemplateOutlet],
  selector: 'app-button-page',
  styleUrl: './button-page.css',
  templateUrl: './button-page.html',
})
export class ButtonPage {
  // Bound from query params. Absent params arrive as `undefined` (overriding any
  // input default), so defaults are applied in the computeds below.
  readonly theme = input<ButtonTheme>();
  readonly size = input<ButtonSize>();
  readonly color = input<ButtonColor>();
  readonly label = input<string>();
  readonly iconLeft = input<string>();
  readonly iconRight = input<string>();
  readonly pill = input(false, { transform: (v: unknown) => v != null && booleanAttribute(v) });
  readonly states = input<string>();
  readonly captions = input(true, { transform: (v: unknown) => v !== 'false' });

  protected readonly embedSize = computed(() => this.size() ?? 'default');
  protected readonly embedColor = computed(() => this.color() ?? 'default');
  protected readonly embedLabel = computed(() => this.label() ?? 'Button');
  protected readonly embed = computed(() => !!this.theme());
  protected readonly embedStates = computed<StateKey[]>(() => {
    const wanted = this.states()?.split(',').map((s) => s.trim());
    return wanted ? ALL_STATES.filter((s) => wanted.includes(s)) : ALL_STATES;
  });

  protected readonly themes: ButtonTheme[] = ['base', 'standard', 'primary', 'secondary', 'dialogue', 'fab', 'icon'];
  protected readonly sizes: ButtonSize[] = ['default', 'small', 'large'];
  protected readonly matrixStates: (ButtonState | undefined)[] = [undefined, 'hover', 'focus', 'active'];

  protected iconOnly(theme: ButtonTheme | undefined): boolean {
    return theme === 'fab' || theme === 'icon';
  }

  protected forced(state: StateKey): ButtonState | undefined {
    return state === 'default' || state === 'disabled' ? undefined : state;
  }
}

import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { Checkbox, CheckboxState } from 'ats-ui';

type ValueKey = 'unchecked' | 'checked' | 'indeterminate';
type StateKey = 'default' | CheckboxState | 'disabled';
const ALL_VALUES: ValueKey[] = ['unchecked', 'checked', 'indeterminate'];
const ALL_STATES: StateKey[] = ['default', 'hover', 'focus', 'disabled'];

/**
 * /checkbox — value × state matrix, plus a live "select all" group.
 *
 * Embed mode: pass `values`, `states` or `demo` to render a compact view, e.g.
 *   /examples/checkbox?values=unchecked,checked,indeterminate
 *   /examples/checkbox?values=checked&states=default,hover,focus,disabled
 *   /examples/checkbox?demo=group
 * Params: values (comma list of unchecked|checked|indeterminate; default all),
 *         states (comma list of default|hover|focus|disabled; default "default"),
 *         demo=group renders the interactive select-all group instead,
 *         captions=false hides the labels under each box.
 * The row steps through values × states (values outer).
 */
@Component({
  imports: [Checkbox, NgTemplateOutlet],
  selector: 'app-checkbox-page',
  styleUrl: './checkbox-page.css',
  templateUrl: './checkbox-page.html',
})
export class CheckboxPage {
  // Absent query params arrive as `undefined`, so defaults live in the computeds.
  readonly values = input<string>();
  readonly states = input<string>();
  readonly demo = input<string>();
  readonly captions = input(true, { transform: (v: unknown) => v !== 'false' });

  protected readonly embed = computed(
    () => this.values() !== undefined || this.states() !== undefined || this.demo() !== undefined,
  );
  protected readonly groupOnly = computed(() => this.demo() === 'group');
  protected readonly cells = computed(() => {
    const values = pick(this.values(), ALL_VALUES, ALL_VALUES);
    const states = pick(this.states(), ALL_STATES, ['default']);
    const both = values.length > 1 && states.length > 1;
    return values.flatMap((value) =>
      states.map((state) => ({
        value,
        state,
        caption: both ? `${value} · ${state}` : states.length > 1 ? state : value,
      })),
    );
  });

  protected readonly allValues = ALL_VALUES;
  protected readonly allStates = ALL_STATES;

  // ---- live select-all group ----
  protected readonly rows = signal([
    { name: 'Avery Chen', selected: true },
    { name: 'Jordan Patel', selected: false },
    { name: 'Sam Okafor', selected: false },
  ]);
  protected readonly allSelected = computed(() => this.rows().every((r) => r.selected));
  protected readonly someSelected = computed(() => !this.allSelected() && this.rows().some((r) => r.selected));

  protected toggleAll(checked: boolean): void {
    this.rows.update((rows) => rows.map((r) => ({ ...r, selected: checked })));
  }
  protected toggleRow(index: number, checked: boolean): void {
    this.rows.update((rows) => rows.map((r, i) => (i === index ? { ...r, selected: checked } : r)));
  }

  protected forced(state: StateKey): CheckboxState | undefined {
    return state === 'hover' || state === 'focus' ? state : undefined;
  }
}

function pick<T extends string>(param: string | undefined, all: T[], fallback: T[]): T[] {
  const wanted = param?.split(',').map((s) => s.trim()).filter(Boolean);
  const out = wanted?.length ? all.filter((v) => wanted.includes(v)) : [];
  return out.length ? out : fallback;
}

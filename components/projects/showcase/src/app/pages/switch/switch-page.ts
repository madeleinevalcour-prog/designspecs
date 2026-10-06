import { Component, booleanAttribute, computed, input, signal } from '@angular/core';
import { Switch } from 'ats-ui';

const flag = (v: unknown) => v != null && booleanAttribute(v);
type Status = 'off' | 'on' | 'disabled-off' | 'disabled-on';

/**
 * /switch — Switch (Figma "switch" 1156:45039): status × has-label, all 8 variants.
 *
 * Embed mode: any param renders one switch (or a row), e.g.
 *   /examples/switch?status=on&label=Grouped
 *   /examples/switch?statuses=off,on,disabled-off,disabled-on&label=Switch%20Label
 * Params:
 *   status = off | on | disabled-off | disabled-on (default off); live, so it still toggles
 *   statuses (comma list: one switch per status, captioned)
 *   label (has-label=Yes when given; omit for has-label=No)
 *   focus = true (forces the focus ring)
 */
@Component({
  imports: [Switch],
  selector: 'app-switch-page',
  template: `
    @if (embed()) {
      <div class="embed row">
        @for (s of embedStatuses(); track $index) {
          <div class="cell">
            <label ats-switch [checked]="isOn(s)" [disabled]="isDisabled(s)" [state]="focus() ? 'focus' : undefined" [aria-label]="label() ? undefined : 'Switch'">{{ label() }}</label>
            @if (statuses()) { <span class="caption">{{ s }}</span> }
          </div>
        }
      </div>
    } @else {
      <h1>Switch</h1>
      <p class="lede">Figma <code>switch</code> (1156:45039, Switch page). Click to toggle; Space toggles the focused switch.</p>
      <h2>has-label = No</h2>
      <div class="row">
        @for (s of all; track s) {
          <div class="cell"><label ats-switch [checked]="isOn(s)" [disabled]="isDisabled(s)" [aria-label]="s"></label><span class="caption">{{ s }}</span></div>
        }
      </div>
      <h2>has-label = Yes</h2>
      <div class="row">
        @for (s of all; track s) {
          <div class="cell"><label ats-switch [checked]="isOn(s)" [disabled]="isDisabled(s)">Switch Label</label><span class="caption">{{ s }}</span></div>
        }
      </div>
      <h2>Focus</h2>
      <div class="row"><label ats-switch state="focus">Grouped</label><label ats-switch [checked]="true" state="focus">Grouped</label></div>
      <h2>Two-way</h2>
      <div class="row"><label ats-switch [(checked)]="demo">Grouped</label><span class="caption">checked = {{ demo() }}</span></div>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    h2 { font-size: 15px; margin: 32px 0 8px; color: #314158; }
    .row { display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start; }
    .cell { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; }
  `,
})
export class SwitchPage {
  readonly status = input<Status>();
  readonly statuses = input<string>();
  readonly label = input<string>();
  readonly focus = input(false, { transform: flag });

  protected readonly all: Status[] = ['off', 'on', 'disabled-off', 'disabled-on'];
  protected readonly demo = signal(true);
  protected readonly embed = computed(() => !!(this.status() || this.statuses() || this.label() || this.focus()));
  protected readonly embedStatuses = computed<Status[]>(() =>
    this.statuses() ? (this.statuses()!.split(',').map((s) => s.trim()) as Status[]) : [this.status() ?? 'off'],
  );
  protected isOn = (s: Status) => s === 'on' || s === 'disabled-on';
  protected isDisabled = (s: Status) => s.startsWith('disabled');
}

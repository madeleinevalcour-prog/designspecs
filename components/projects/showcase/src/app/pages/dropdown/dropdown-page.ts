import { Component, computed, input, signal } from '@angular/core';
import { Button, CheckboxLabel, Dropdown, DropdownTrigger, DropdownOptgroup, DropdownOption, DropdownOptionState } from 'ats-ui';

type Part = 'dropdown' | 'optgroup' | 'option';

/**
 * /dropdown — the Dropdown family (Figma "Appearance" 46:2164): dropdown (338:7828),
 * novo-optgroup (338:7812: default + check-list) and option (364:8124: default / hover / selected),
 * plus a live trigger + dropdown.
 *
 * Embed mode: `component` renders one piece, e.g.
 *   /examples/dropdown?component=option&state=selected&label=Verizon
 *   /examples/dropdown?component=optgroup&type=check-list
 *   /examples/dropdown?component=dropdown&live=true
 * Params:
 *   component = dropdown | optgroup | option
 *   state = default | hover | selected (option; default "default")
 *   label (option label, default "option-label"; optgroup heading)
 *   icon (option: a 16px glyph, Figma `show icon`)
 *   type = default | check-list (optgroup)
 *   live = true (dropdown: a trigger button that opens it)
 */
@Component({
  imports: [Button, CheckboxLabel, Dropdown, DropdownTrigger, DropdownOptgroup, DropdownOption],
  selector: 'app-dropdown-page',
  template: `
    @if (component() === 'option') {
      <div class="embed w320">
        <div ats-option [state]="optionState()" [icon]="icon()">{{ label() ?? 'option-label' }}</div>
      </div>
    } @else if (component() === 'optgroup') {
      <div class="embed w320">
        @if (type() === 'check-list') {
          <ats-optgroup type="check-list" [label]="label()">
            @for (c of checkItems; track c) { <label ats-checkbox-label>{{ c }}</label> }
          </ats-optgroup>
        } @else {
          <ats-optgroup [label]="label()">
            @for (o of companies; track o) { <div ats-option>{{ o }}</div> }
          </ats-optgroup>
        }
      </div>
    } @else if (component() === 'dropdown') {
      <div class="embed" [class.menu-room]="live() === 'true'">
        @if (live() === 'true') {
          <div class="anchor">
            <button ats-button theme="secondary" iconRight="chevron-down" [atsDropdownTrigger]="ddEmbed">{{ picked() }}</button>
            <ats-dropdown #ddEmbed placement="bottom-start" [(open)]="embedOpen" (chosen)="picked.set($any($event))">
              <ats-optgroup>
                @for (o of companies; track o) { <button ats-option [value]="o" [selected]="picked() === o">{{ o }}</button> }
              </ats-optgroup>
            </ats-dropdown>
          </div>
        } @else {
          <ats-dropdown>
            <ats-optgroup>
              @for (o of placeholder; track $index) { <div ats-option>option-label</div> }
            </ats-optgroup>
          </ats-dropdown>
        }
      </div>
    } @else {
      <h1>Dropdown</h1>
      <p class="lede">Figma <code>Appearance</code> (46:2164). A general term for menu items or overflow experiences revealed on
        click: a card of option groups. Pick one action, or several values from a check-list. Hover, focus and selection are live.</p>

      <h2>option</h2>
      <p class="note">364:8124 · default, hover, selected (fill + check). Figma <code>show icon</code> adds a 16px glyph.</p>
      <div class="col w320">
        @for (s of states; track s) {
          <div class="line"><div ats-option [state]="s">option-label</div><span class="caption">{{ s }}</span></div>
        }
        @for (s of states; track s) {
          <div class="line"><div ats-option [state]="s" icon="add">option-label</div><span class="caption">{{ s }} · show icon</span></div>
        }
      </div>

      <h2>novo-optgroup</h2>
      <p class="note">338:7812 · default (338:7813) is a column of options; check-list (1779:42497) is a column of
        checkbox+labels. The heading (<code>label</code>) is optional and not drawn in Figma.
        Not built: check-list-nested, drag-and-drop.</p>
      <div class="row">
        <div class="cell w320">
          <ats-optgroup>
            @for (o of placeholder; track $index) { <div ats-option>option-label</div> }
          </ats-optgroup>
          <span class="caption">default</span>
        </div>
        <div class="cell w320">
          <ats-optgroup label="Companies">
            @for (o of companies; track o) { <div ats-option>{{ o }}</div> }
          </ats-optgroup>
          <span class="caption">default · with a group label</span>
        </div>
        <div class="cell w320">
          <ats-optgroup type="check-list">
            @for (c of checkItems; track c) { <label ats-checkbox-label>{{ c }}</label> }
          </ats-optgroup>
          <span class="caption">check-list</span>
        </div>
      </div>

      <h2>dropdown</h2>
      <p class="note">338:7828 · Property 1=default (1883:1676): the card that holds optgroups, 8px apart.
        Not built: dropdown-header (tabs / search), dropdown-footer, filter-facet-dropdown.</p>
      <div class="row">
        <div class="cell">
          <ats-dropdown>
            <ats-optgroup>
              @for (o of placeholder; track $index) { <div ats-option>option-label</div> }
            </ats-optgroup>
          </ats-dropdown>
          <span class="caption">default (Figma)</span>
        </div>
        <div class="cell">
          <ats-dropdown role="menu">
            <ats-optgroup label="Add to">
              <div ats-option icon="add">Add to list</div>
              <div ats-option icon="add" state="hover">Add to Outreach sequence</div>
            </ats-optgroup>
            <ats-optgroup label="Sort by">
              <div ats-option>Name</div>
              <div ats-option [selected]="true">Last activity</div>
            </ats-optgroup>
          </ats-dropdown>
          <span class="caption">two optgroups with labels</span>
        </div>
      </div>

      <h2>Live</h2>
      <p class="note">A trigger (<code>[atsDropdownTrigger]</code>) and a dropdown placed bottom-start. Click or press Enter /
        Space / ArrowDown to open; arrows, Home / End move; Enter or Space selects; Escape closes and returns focus to the
        button; Tab or a click outside closes.</p>
      <div class="row menu-room">
        <div class="cell">
          <div class="anchor">
            <button ats-button theme="secondary" iconRight="chevron-down" [atsDropdownTrigger]="dd">{{ picked() }}</button>
            <ats-dropdown #dd placement="bottom-start" [(open)]="liveOpen" (chosen)="picked.set($any($event))">
              <ats-optgroup>
                @for (o of companies; track o) { <button ats-option [value]="o" [selected]="picked() === o">{{ o }}</button> }
              </ats-optgroup>
            </ats-dropdown>
          </div>
          <span class="caption">listbox · selected: {{ picked() }}</span>
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 16px 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    h2 { font-size: 18px; margin: 32px 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; max-width: 760px; }
    .note { color: #5d7798; margin: 0 0 16px; font-size: 13px; max-width: 760px; }
    .col { display: flex; flex-direction: column; gap: 8px; }
    .row { display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start; }
    .cell { display: flex; flex-direction: column; gap: 8px; }
    .w320 { width: 320px; }
    .line { display: flex; align-items: center; gap: 16px; }
    .line > [ats-option] { flex: 1; }
    .line > .caption { flex: 0 0 140px; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; }
    .anchor { position: relative; display: inline-block; }
    .menu-room { padding-bottom: 200px; }
  `,
})
export class DropdownPage {
  readonly component = input<Part>();
  readonly state = input<DropdownOptionState>();
  readonly label = input<string>();
  readonly icon = input<string>();
  readonly type = input<'default' | 'check-list'>();
  readonly live = input<string>();

  protected readonly states: DropdownOptionState[] = ['default', 'hover', 'selected'];
  protected readonly placeholder = [1, 2, 3, 4, 5];
  protected readonly companies = ['Verizon', 'Comcast', 'AT&T', 'T-Mobile'];
  protected readonly checkItems = ['Details', 'Amplify', 'Recent Notes', 'Open Internal Submissions', 'Open Tasks', 'CV'];
  protected readonly optionState = computed<DropdownOptionState>(() => this.state() ?? 'default');
  protected readonly picked = signal('Verizon');
  protected readonly liveOpen = signal<boolean | undefined>(false);
  protected readonly embedOpen = signal<boolean | undefined>(false);
}

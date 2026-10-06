import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-home-page',
  template: `
    <h1>ats-ui</h1>
    <p class="lede">Angular components for the ATS redesign. Each page is the living reference for one component.</p>
    <ul>
      @for (c of components; track c.path) {
        <li><a [routerLink]="c.path">{{ c.name }}</a> <span>{{ c.figma }}</span></li>
      }
    </ul>
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
    a { color: #1f57a1; font-weight: 500; text-decoration: none; }
    a:hover { text-decoration: underline; }
    span { color: #8ca1b9; font-size: 12px; margin-left: 8px; }
  `,
})
export class HomePage {
  protected readonly components = [
    { path: 'amplify-chat-blocks', name: 'Amplify Chat — Blocks', figma: 'Amplify Chat Interface Patterns 6300:27081 (draft-block 6149:20803, literal-value-block 6152:117821)' },
    { path: 'amplify-chat-sources', name: 'Amplify Chat — Sources', figma: 'Amplify Chat Interface Patterns 6300:27092 (sources-row 6149:20865)' },
    { path: 'amplify-chat-text', name: 'Amplify Chat — Text', figma: 'Amplify Chat Interface Patterns: doc/text 6299:27096' },
    { path: 'amplify-chat-user-messages', name: 'Amplify Chat — User messages', figma: 'Amplify Chat Interface Patterns 6300:27101 (user-bubble 6213:168866)' },
    { path: 'bowling-alley', name: 'Bowling Alley', figma: 'Component Migration: Bowling Alley 157:2575 · overlays 157:511 · Fast Find 1323:67008' },
    { path: 'button', name: 'Button', figma: 'Component Migration 68:2694' },
    { path: 'card', name: 'Card', figma: 'Component Migration 311:29059 (+ subcomponents)' },
    { path: 'check-list', name: 'Check List', figma: 'Component Migration 331:1435' },
    { path: 'checkbox', name: 'Checkbox', figma: 'Component Migration 250:17814' },
    { path: 'checkbox-label', name: 'Checkbox + label', figma: 'Component Migration 250:17848' },
    { path: 'icon', name: 'Icon', figma: 'Component Migration → Iconography' },
    { path: 'icon-button-no-container', name: 'Icon Button - no container', figma: 'Component Migration 164:17717' },
    { path: 'icon-container', name: 'Icon Container', figma: 'Component Migration 164:17910' },
    { path: 'menu', name: 'Menu', figma: 'Component Migration ✅ Menu - Finalized 46:3526 (+ subcomponents)' },
    { path: 'novo-chip', name: 'Novo Chip', figma: 'Component Migration 45:445 (novo-chip 157:2949)' },
    { path: 'data-table', name: 'Novo Data Table', figma: 'Component Migration 46:1541 / 254:6720' },
    { path: 'novo-list', name: 'Novo List', figma: 'List / novo-list 692:20779' },
    { path: 'record-header', name: 'Record Header', figma: 'Component Migration 222:16011 / 3040:88434' },
    { path: 'search-input', name: 'Search Input', figma: 'Component Migration: search-input (1323:67011)' },
    { path: 'sophia-fab', name: 'Sophia FAB', figma: 'Component Migration 6084:152232' },
    { path: 'switch', name: 'Switch', figma: 'Component Migration 1156:45039' },
    { path: 'workflow-stepper', name: 'Workflow Stepper', figma: 'Component Migration 589:6990' },
  ];
}

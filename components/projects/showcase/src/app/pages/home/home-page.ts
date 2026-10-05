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
    { path: 'button', name: 'Button', figma: 'Component Migration 68:2694' },
    { path: 'card', name: 'Card', figma: 'Component Migration 311:29059 (+ subcomponents)' },
    { path: 'icon', name: 'Icon', figma: 'Component Migration → Iconography' },
    { path: 'icon-button-no-container', name: 'Icon Button - no container', figma: 'Component Migration 164:17717' },
    { path: 'checkbox', name: 'Checkbox', figma: 'Component Migration 250:17814' },
    { path: 'workflow-stepper', name: 'Workflow Stepper', figma: 'Component Migration 589:6990' },
    { path: 'novo-list', name: 'Novo List', figma: 'List / novo-list 692:20779' },
    { path: 'data-table', name: 'Novo Data Table', figma: 'Component Migration 46:1541 / 254:6720' },
    { path: 'record-header', name: 'Record Header', figma: 'Component Migration 222:16011 / 3040:88434' },
    { path: 'list-variations', name: 'List Variations (Toggle, AdvancedSearch, ListHeader, ListDataTable…)', figma: 'List Variations 0LCuwDp7YHGGqK6WiseTRi' },
  ];
}

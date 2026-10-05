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
  ];
}

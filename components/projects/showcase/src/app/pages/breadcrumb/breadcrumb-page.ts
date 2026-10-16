import { Component, computed, input, numberAttribute } from '@angular/core';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbLinkState } from 'ats-ui';

const num = (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v));

/**
 * /breadcrumb — Breadcrumb + BreadcrumbLink (Figma "breadcrumb" 6806:36042,
 * "breadcrumb-link" 6806:28195 — Amplify page navigation and header).
 *
 * Embed mode: any param renders a compact example, e.g.
 *   /examples/breadcrumb?state=default
 *   /examples/breadcrumb?state=home
 *   /examples/breadcrumb?levels=Amplify;Scheduled&hover=0
 *   /examples/breadcrumb?levels=Amplify;Follow-up:%20425%20%7C%20Project%20Manager,%20Nexus%20Dynamics&width=360
 *   /examples/breadcrumb?links=root,hover,current
 * Params:
 *   state = default | home (Figma breadcrumb state; default = Amplify / New scheduled prompt)
 *   levels = semicolon list of labels, top first; the last is the current page
 *   hover = index of a level to show in its hover look
 *   width = px; constrains the breadcrumb to show truncation
 *   links = comma list of breadcrumb-link states (root | hover | current), one per cell, captioned
 */
@Component({
  imports: [Breadcrumb, BreadcrumbLink],
  selector: 'app-breadcrumb-page',
  template: `
    @if (embed()) {
      <div class="embed">
        @if (linkStates().length) {
          <div class="row">
            @for (s of linkStates(); track $index) {
              <div class="cell">
                @if (s === 'current') { <span ats-breadcrumb-link state="current">Amplify</span> }
                @else { <a ats-breadcrumb-link [state]="s" href="#" (click)="$event.preventDefault()">Amplify</a> }
                <span class="caption">state={{ s }}</span>
              </div>
            }
          </div>
        } @else {
          <div class="frame" [style.width.px]="width()">
            <ats-breadcrumb [items]="embedItems()" [forceHover]="hover()" (navigate)="noop()" />
          </div>
        }
      </div>
    } @else {
      <h1>Breadcrumb</h1>
      <p class="lede">Figma <code>breadcrumb</code> (6806:36042) and <code>breadcrumb-link</code> (6806:28195), Amplify page navigation and header.</p>
      <h2>breadcrumb · state</h2>
      <div class="col">
        <div class="cell"><ats-breadcrumb [items]="two" (navigate)="noop()" /><span class="caption">state=Default: two levels</span></div>
        <div class="cell"><ats-breadcrumb [items]="one" /><span class="caption">state=home: the landing page</span></div>
      </div>
      <h2>Truncation</h2>
      <div class="col">
        <div class="cell"><div class="frame" style="width: 360px"><ats-breadcrumb [items]="long" (navigate)="noop()" /></div><span class="caption">360px wide: only the current title truncates</span></div>
      </div>
      <h2>breadcrumb-link · state</h2>
      <div class="row">
        <div class="cell"><a ats-breadcrumb-link href="#" (click)="$event.preventDefault()">Amplify</a><span class="caption">state=root (hover me)</span></div>
        <div class="cell"><a ats-breadcrumb-link state="hover" href="#" (click)="$event.preventDefault()">Amplify</a><span class="caption">state=hover</span></div>
        <div class="cell"><span ats-breadcrumb-link state="current">Amplify</span><span class="caption">state=current</span></div>
      </div>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    h2 { font-size: 15px; margin: 32px 0 8px; color: #314158; }
    .row { display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start; }
    .col { display: flex; flex-direction: column; gap: 24px; align-items: flex-start; }
    .cell { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
    .frame { max-width: 100%; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; }
  `,
})
export class BreadcrumbPage {
  readonly state = input<'default' | 'home' | undefined>();
  readonly levels = input<string>();
  readonly hover = input<number | undefined, unknown>(undefined, { transform: num });
  readonly width = input<number | undefined, unknown>(undefined, { transform: num });
  readonly links = input<string>();

  protected readonly two: BreadcrumbItem[] = [{ label: 'Amplify' }, { label: 'New scheduled prompt' }];
  protected readonly one: BreadcrumbItem[] = [{ label: 'Amplify' }];
  protected readonly long: BreadcrumbItem[] = [{ label: 'Amplify' }, { label: 'Follow-up: 425 | Project Manager, Nexus Dynamics' }];

  protected readonly embed = computed(() => !!(this.state() || this.levels() || this.links() || this.width() != null || this.hover() != null));
  protected readonly linkStates = computed<BreadcrumbLinkState[]>(() =>
    this.links() ? (this.links()!.split(',').map((s) => s.trim()) as BreadcrumbLinkState[]) : [],
  );
  protected readonly embedItems = computed<BreadcrumbItem[]>(() => {
    const lv = this.levels();
    if (lv) {
      const labels = lv.split(';').map((s) => s.trim()).filter(Boolean);
      return labels.map((label) => ({ label }));
    }
    return this.state() === 'home' ? this.one : this.two;
  });
  protected noop(): void {}
}

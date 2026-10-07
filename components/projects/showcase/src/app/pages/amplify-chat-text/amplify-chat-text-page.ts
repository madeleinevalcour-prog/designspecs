import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import {
  AmplifyChatHeader, AmplifyChatHeaderLevel, AmplifyChatLink, AmplifyChatLinkEntity, AmplifyChatLinkState,
  AmplifyChatListItem, AmplifyChatNumberedList, AmplifyChatText, AmplifyChatTextType,
} from 'ats-ui';

type Part = 'header' | 'text' | 'numbered-list' | 'list-item' | 'link';

/**
 * /amplify-chat-text — Amplify chat text building blocks (Figma doc frame "doc/text"
 * 6299:27096): amplify-chat/header, amplify-chat/text (+ the inline entity link),
 * amplify-chat/numbered-list, amplify-chat/list-item.
 *
 * Embed mode: any param renders one component, up to 800px wide (the chat column), e.g.
 *   /examples/amplify-chat-text?component=header&level=label
 *   /examples/amplify-chat-text?component=text&type=paragraph-with-links
 *   /examples/amplify-chat-text?component=link&entity=company&state=hover
 * Params:
 *   component = header | text | numbered-list | list-item | link (default "text")
 *   level = section | label (header; default section)
 *   type = paragraph | status | paragraph-with-links (text; default paragraph)
 *   entity = candidate | job | contact | company | lead | opportunity | placement | submission (link; default job)
 *   state = default | hover | focus (link)
 *   label (optional text override for header / text / list-item / link)
 */
@Component({
  imports: [NgTemplateOutlet, AmplifyChatHeader, AmplifyChatText, AmplifyChatLink, AmplifyChatNumberedList, AmplifyChatListItem],
  selector: 'app-amplify-chat-text-page',
  template: `
    @if (embed()) {
      <div class="embed">
        @switch (part()) {
          @case ('header') {
            <ats-amplify-chat-header [level]="level()">{{ label() ?? 'Needs Attention Today' }}</ats-amplify-chat-header>
          }
          @case ('numbered-list') { <ng-container *ngTemplateOutlet="list" /> }
          @case ('list-item') {
            <ol ats-amplify-chat-numbered-list><li ats-amplify-chat-list-item>{{ label() ?? items[0] }}</li></ol>
          }
          @case ('link') {
            <ats-amplify-chat-text type="paragraph-with-links">
              <a ats-amplify-chat-link [entity]="entity()" [state]="state()" href="#" (click)="$event.preventDefault()">{{ label() ?? entityLabel() }}</a>
            </ats-amplify-chat-text>
          }
          @default {
            @if (type() === 'paragraph-with-links' && !label()) {
              <ng-container *ngTemplateOutlet="withLinks" />
            } @else {
              <ats-amplify-chat-text [type]="type()">{{ label() ?? (type() === 'status' ? status : paragraph) }}</ats-amplify-chat-text>
            }
          }
        }
      </div>
    } @else {
      <h1>Amplify Chat — Text</h1>
      <p class="lede">Figma doc frame <code>doc/text</code> (6299:27096). Prose building blocks for an Amplify chat reply. Each fills its parent's width (the 800px chat column).</p>

      <h2>amplify-chat/header <span>6147:20798</span></h2>
      <div class="col">
        <div class="line"><ats-amplify-chat-header level="section">Needs Attention Today</ats-amplify-chat-header><span class="caption">level=section</span></div>
        <div class="line"><ats-amplify-chat-header level="label">Needs Attention Today</ats-amplify-chat-header><span class="caption">level=label</span></div>
      </div>

      <h2>amplify-chat/text <span>6148:20800</span></h2>
      <div class="col">
        <div class="line"><ats-amplify-chat-text type="paragraph">{{ paragraph }}</ats-amplify-chat-text><span class="caption">type=paragraph</span></div>
        <div class="line"><ats-amplify-chat-text type="status">{{ paragraph }}</ats-amplify-chat-text><span class="caption">type=status</span></div>
        <div class="line"><ng-container *ngTemplateOutlet="withLinks" /><span class="caption">type=paragraph-with-links</span></div>
      </div>

      <h2>Inline entity link <span>a[ats-amplify-chat-link]</span></h2>
      <div class="col">
        @for (e of entities; track e.entity) {
          <div class="line">
            <ats-amplify-chat-text type="paragraph-with-links"><a ats-amplify-chat-link [entity]="e.entity" href="#" (click)="$event.preventDefault()">{{ e.label }}</a></ats-amplify-chat-text>
            <span class="caption">entity={{ e.entity }}</span>
          </div>
        }
        @for (s of linkStates; track s) {
          <div class="line">
            <ats-amplify-chat-text type="paragraph-with-links"><a ats-amplify-chat-link entity="job" [state]="s" href="#" (click)="$event.preventDefault()">Senior Java Developer</a></ats-amplify-chat-text>
            <span class="caption">state={{ s }}</span>
          </div>
        }
      </div>

      <h2>amplify-chat/numbered-list <span>6148:20804</span></h2>
      <div class="col"><div class="line"><ng-container *ngTemplateOutlet="list" /><span class="caption">numbered-list</span></div></div>

      <h2>amplify-chat/list-item <span>6148:20801</span></h2>
      <div class="col"><div class="line"><ol ats-amplify-chat-numbered-list><li ats-amplify-chat-list-item>{{ items[0] }}</li></ol><span class="caption">list-item</span></div></div>
    }

    <ng-template #withLinks>
      <ats-amplify-chat-text type="paragraph-with-links">
        5 of your 14 open jobs need action today. Start with
        <a ats-amplify-chat-link entity="job" href="#" (click)="$event.preventDefault()">Senior Java Developer</a> at
        <a ats-amplify-chat-link entity="company" href="#" (click)="$event.preventDefault()">Verizon</a>. It starts Oct 6 with no submittals.
      </ats-amplify-chat-text>
    </ng-template>
    <ng-template #list>
      <ol ats-amplify-chat-numbered-list>
        @for (item of items; track $index) { <li ats-amplify-chat-list-item>{{ item }}</li> }
      </ol>
    </ng-template>
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 16px 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    h2 { font-size: 15px; margin: 32px 0 12px; }
    h2 span { font-weight: 400; color: #5d7798; font-size: 13px; margin-left: 6px; }
    .lede { color: #5d7798; margin: 0 0 8px; font-size: 14px; }
    .embed { max-width: 800px; }
    .col { display: flex; flex-direction: column; gap: 16px; }
    .line { display: flex; align-items: flex-start; gap: 24px; }
    .line > :first-child { flex: 0 0 560px; width: 560px; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; width: 200px; padding-top: 2px; }
  `,
})
export class AmplifyChatTextPage {
  readonly component = input<Part>();
  readonly level = input<AmplifyChatHeaderLevel>();
  readonly type = input<AmplifyChatTextType>();
  readonly entity = input<AmplifyChatLinkEntity>();
  readonly state = input<AmplifyChatLinkState>();
  readonly label = input<string>();

  protected readonly paragraph = '5 of your 14 open jobs need action today, ranked by start date and open submittals.';
  protected readonly status = 'Ranking 14 job orders…';
  protected readonly items = [
    'Senior Java Developer at Verizon starts Oct 6 with no submittals.',
    'Data Engineer at PepsiCo has 1 submittal and client priority High.',
    'Project Manager at Acme has an interview pending feedback.',
  ];
  protected readonly entities: { entity: AmplifyChatLinkEntity; label: string }[] = [
    { entity: 'job', label: 'Senior Java Developer' },
    { entity: 'company', label: 'Verizon' },
    { entity: 'contact', label: 'Dana Whitfield' },
    { entity: 'candidate', label: 'Marcus Lee' },
    { entity: 'lead', label: 'Priya Natarajan' },
    { entity: 'opportunity', label: 'Comcast Q4 Java Hiring' },
    { entity: 'placement', label: 'Marcus Lee — Verizon' },
    { entity: 'submission', label: 'Marcus Lee → Senior Java Developer' },
  ];
  protected readonly linkStates: AmplifyChatLinkState[] = ['default', 'hover', 'focus'];

  protected readonly embed = computed(() => !!(this.component() || this.level() || this.type() || this.entity() || this.state() || this.label()));
  protected readonly part = computed<Part>(() => this.component() ?? (this.level() ? 'header' : this.entity() || this.state() ? 'link' : 'text'));
  protected readonly entityLabel = computed(() => this.entities.find((e) => e.entity === (this.entity() ?? 'job'))?.label ?? 'Senior Java Developer');
}

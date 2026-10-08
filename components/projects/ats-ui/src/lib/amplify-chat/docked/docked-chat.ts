import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, computed, effect, inject, input, model,
  output, signal, untracked,
} from '@angular/core';
import { Button } from '../../button/button';
import { Icon } from '../../icon/icon';

/** Figma docked-chat `state`: `Default` = docked right panel, `pop-over` = floating window. */
export type AmplifyChatDockedMode = 'docked' | 'pop-over';

/** Pop-over window gap to the viewport edges (spacing/margin = 24). */
const EDGE = 24;
/** Figma pop-over size (726 × 994); the height is capped by the viewport. */
const POP_W = 726;
const POP_H = 994;
/** Smallest pop-over the resize handle allows (the docked width × a usable height). */
const MIN_W = 420;
const MIN_H = 360;

/**
 * AmplifyChatDocked (Figma: "docked-chat", set 4608:182872). Amplify chat beside or
 * over the current page (patterns doc "Surfaces and behavior"). One assistant, two
 * presentations of the same conversation, switched in the header:
 *  - `docked` (state=Default 4608:182871): the default. A 420px right-hand panel that
 *    persists across pages. Put it last in a flex row with the page content: the page
 *    contracts beside it, and it slides in from the right when opened.
 *    general/level 3 - right, modal border on its left edge.
 *  - `pop-over` (state=pop-over 4608:182873): the same chat as a floating window
 *    (726px wide by default) over the page, with no scrim, so the page stays usable.
 *    Drag it by its header; resize it from the bottom-right corner. It is kept inside
 *    the viewport. Modal border and radius, general/level 4.
 *
 * Header (novo-header, slideout-title): the Amplify mark + "Amplify" (title/medium),
 * then the actions (Button theme Icon, Small):
 *  - docked: External Open (pop out to the pop over) and Close;
 *  - pop over: Columns (dock it back) and Close.
 *
 * Body: project an `ats-amplify-chat-conversation size="docked"` (turns + input).
 *
 *   <div class="page-row">            <!-- display: flex; height: 100% -->
 *     <main class="page">…</main>     <!-- flex: 1; min-width: 0 -->
 *     <ats-amplify-chat-docked [(open)]="chatOpen" [(mode)]="chatMode">
 *       <ats-amplify-chat-conversation size="docked">
 *         …turns…
 *         <ats-amplify-chat-container slot="input" size="docked" (send)="ask($event)" />
 *       </ats-amplify-chat-conversation>
 *     </ats-amplify-chat-docked>
 *   </div>
 *
 * Output: `closed` (Close was activated; `open` also becomes false).
 * Escape closes the pop-over (the docked panel stays; it is persistent).
 * Empty state: start the turns with an Amplify greeting, a chat-block with no actions —
 *   `<ats-amplify-chat-chat-block [showActions]="false"><ats-amplify-chat-text>Hi Chloe, how can I
 *   help you today?</ats-amplify-chat-text></ats-amplify-chat-chat-block>` — with the input as normal.
 * The host is a `role="complementary"` landmark named "Amplify chat"; while closed it
 * is `inert` and hidden from assistive tech.
 */
@Component({
  selector: 'ats-amplify-chat-docked',
  imports: [Button, Icon],
  template: `
    <div class="ats-amplify-chat-docked__panel">
      <header class="ats-amplify-chat-docked__header" (pointerdown)="startDrag($event)">
        <div class="ats-amplify-chat-docked__title">
          <span class="ats-amplify-chat-docked__mark"><ats-icon class="ats-amplify-chat-docked__mark-icon" name="amplify" [size]="28" /></span>
          <h2 class="ats-amplify-chat-docked__label">{{ title() ?? 'Amplify' }}</h2>
        </div>
        <div class="ats-amplify-chat-docked__actions">
          <button ats-button theme="icon" size="small" [icon]="isPopOver() ? 'columns' : 'external-open'"
            [attr.aria-label]="isPopOver() ? 'Dock to side' : 'Pop out'" (click)="toggleMode()"></button>
          <button ats-button theme="icon" size="small" icon="close" aria-label="Close Amplify" (click)="close()"></button>
        </div>
      </header>
      <div class="ats-amplify-chat-docked__main"><ng-content /></div>
    </div>
  `,
  styleUrl: './docked-chat.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-docked',
    role: 'complementary',
    'aria-label': 'Amplify chat',
    '[attr.data-mode]': 'modeName()',
    '(keydown.escape)': 'onEscape($event)',
    '[class.is-open]': 'isOpen()',
    '[class.is-dragging]': 'dragging()',
    '[attr.inert]': 'isOpen() ? null : ""',
    '[attr.aria-hidden]': 'isOpen() ? null : "true"',
    '[style.left.px]': 'isPopOver() ? pos().x : null',
    '[style.top.px]': 'isPopOver() ? pos().y : null',
    '[style.max-width]': 'isPopOver() ? "calc(100vw - " + (pos().x + edge) + "px)" : null',
    '[style.max-height]': 'isPopOver() ? "calc(100vh - " + (pos().y + edge) + "px)" : null',
    '(window:resize)': 'onWindowResize()',
  },
})
export class AmplifyChatDocked {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Shown (two-way: `[(open)]`). Default true. */
  readonly open = model<boolean | undefined>(true);
  /** `docked` (default) or `pop-over` (two-way: `[(mode)]`). */
  readonly mode = model<AmplifyChatDockedMode | undefined>('docked');
  /** Header title. Default "Amplify". */
  readonly title = input<string>();

  /** Close was activated (`open` is set to false too). */
  readonly closed = output<void>();

  protected readonly edge = EDGE;
  protected readonly isOpen = computed(() => this.open() ?? true);
  protected readonly modeName = computed<AmplifyChatDockedMode>(() => this.mode() ?? 'docked');
  protected readonly isPopOver = computed(() => this.modeName() === 'pop-over');
  /** Pop-over top-left corner, in viewport px. */
  protected readonly pos = signal({ x: EDGE, y: EDGE });
  protected readonly dragging = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Entering pop over: start bottom-right at the Figma size (capped by the viewport).
    // Back to docked: drop the window size so the panel width comes from CSS again.
    effect(() => {
      const pop = this.isPopOver();
      untracked(() => {
        if (pop) this.place();
        else { this.el.style.width = ''; this.el.style.height = ''; }
      });
    });
    destroyRef.onDestroy(() => this.endDrag?.());
  }

  protected toggleMode(): void {
    this.mode.set(this.isPopOver() ? 'docked' : 'pop-over');
  }

  /** Escape closes the pop-over (not the docked panel), unless something inside handled it
   *  first (an open menu or dropdown marks the key as handled). */
  protected onEscape(e: Event): void {
    if (!this.isPopOver() || e.defaultPrevented) return;
    e.preventDefault();
    this.close();
  }

  protected close(): void {
    this.open.set(false);
    this.closed.emit();
  }

  /** Initial pop-over size and position: Figma size, bottom-right, inside the viewport. */
  private place(): void {
    const w = Math.max(MIN_W, Math.min(POP_W, window.innerWidth - EDGE * 2));
    const h = Math.max(MIN_H, Math.min(POP_H, window.innerHeight - EDGE * 2));
    this.el.style.width = `${w}px`;
    this.el.style.height = `${h}px`;
    this.pos.set({ x: Math.max(0, window.innerWidth - w - EDGE), y: Math.max(0, window.innerHeight - h - EDGE) });
  }

  /** Window resized: re-place the pop over until the user has moved it, then just keep it inside the viewport. */
  protected onWindowResize(): void {
    if (!this.isPopOver()) return;
    if (!this.moved) { this.place(); return; }
    const { x, y } = this.pos();
    this.pos.set(this.bounded(x, y));
  }

  private bounded(x: number, y: number): { x: number; y: number } {
    const w = this.el.offsetWidth;
    const h = this.el.offsetHeight;
    return {
      x: Math.min(Math.max(0, x), Math.max(0, window.innerWidth - w)),
      y: Math.min(Math.max(0, y), Math.max(0, window.innerHeight - h)),
    };
  }

  private endDrag?: () => void;
  /** The user has dragged the pop over (stop auto-placing it). */
  private moved = false;

  /** Pop over: drag by the header (not from its buttons). */
  protected startDrag(event: PointerEvent): void {
    if (!this.isPopOver() || event.button !== 0 || (event.target as HTMLElement).closest('button')) return;
    event.preventDefault();
    const start = this.pos();
    const ox = event.clientX;
    const oy = event.clientY;
    this.dragging.set(true);
    this.moved = true;
    const move = (e: PointerEvent) => this.pos.set(this.bounded(start.x + e.clientX - ox, start.y + e.clientY - oy));
    const up = () => this.endDrag?.();
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    this.endDrag = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      this.dragging.set(false);
      this.endDrag = undefined;
    };
  }
}

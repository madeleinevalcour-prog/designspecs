import { Component, computed, input, signal } from '@angular/core';
import { Icon } from 'ats-ui';
import { ICON_NAMES } from './icon-names';

/**
 * /icon — the full icon set, searchable.
 *
 * Embed mode: pass `names` (comma list) to render just those, e.g.
 *   /examples/icon?names=search,add,close&size=24&color=var(--color-icon-subtle)
 * Params: names, size (default 24), color (any CSS color / var()), labels=false.
 */
@Component({
  imports: [Icon],
  selector: 'app-icon-page',
  templateUrl: './icon-page.html',
  styleUrl: './icon-page.css',
})
export class IconPage {
  readonly names = input<string>();
  readonly size = input<string>();
  readonly color = input<string>();
  readonly labels = input(true, { transform: (v: unknown) => v !== 'false' });

  protected readonly query = signal('');
  protected readonly embed = computed(() => !!this.names());
  protected readonly embedNames = computed(() => this.names()?.split(',').map((n) => n.trim()).filter(Boolean) ?? []);
  protected readonly embedSize = computed(() => Number(this.size() ?? 24));
  protected readonly all = ICON_NAMES;
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? ICON_NAMES.filter((n) => n.includes(q)) : ICON_NAMES;
  });
}

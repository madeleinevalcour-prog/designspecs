import { Component, DestroyRef, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: '<router-outlet />',
})
export class App {
  constructor() {
    // When embedded by the docs site (<doc-example>), report content height so
    // the iframe can size itself to fit. ResizeObserver covers live changes; the
    // load / navigation posts cover the first render.
    if (window.parent === window) return;
    document.documentElement.classList.add('is-embedded');
    const post = () =>
      window.parent.postMessage({ type: 'ats-example-height', height: document.body.getBoundingClientRect().height }, '*');
    const ro = new ResizeObserver(post);
    ro.observe(document.body);
    window.addEventListener('load', post);
    const nav = inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => setTimeout(post));
    inject(DestroyRef).onDestroy(() => {
      ro.disconnect();
      nav.unsubscribe();
      window.removeEventListener('load', post);
    });
  }
}

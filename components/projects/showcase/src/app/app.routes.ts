import { Routes } from '@angular/router';
import { ButtonPage } from './pages/button/button-page';
import { HomePage } from './pages/home/home-page';
import { IconPage } from './pages/icon/icon-page';
import { ListVariationsPage } from './pages/list-variations/list-variations-page';

// One route per component. Each page renders the full reference matrix, or a
// compact embed when query params are given (see each page for its params).
// Served at /examples/<route> on the docs site and embedded with <doc-example>.
export const routes: Routes = [
  { path: '', component: HomePage, title: 'ats-ui — components' },
  { path: 'button', component: ButtonPage, title: 'Button — ats-ui' },
  { path: 'icon', component: IconPage, title: 'Icon — ats-ui' },
  { path: 'list-variations', component: ListVariationsPage, title: 'List Variations — ats-ui' },
  { path: '**', redirectTo: '' },
];

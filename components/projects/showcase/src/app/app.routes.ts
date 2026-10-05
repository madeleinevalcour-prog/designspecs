import { Routes } from '@angular/router';
import { ButtonPage } from './pages/button/button-page';
import { HomePage } from './pages/home/home-page';

// One route per component. Each page renders the full reference matrix, or a
// compact embed when query params are given (see each page for its params).
// Served at /examples/<route> on the docs site and embedded with <doc-example>.
export const routes: Routes = [
  { path: '', component: HomePage, title: 'ats-ui — components' },
  { path: 'button', component: ButtonPage, title: 'Button — ats-ui' },
  { path: '**', redirectTo: '' },
];

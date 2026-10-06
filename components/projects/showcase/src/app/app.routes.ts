import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home-page';

// One route per component, lazy-loaded so each docs embed only downloads its own page.
// Each page renders the full reference view, or a compact embed when query params
// are given (see each page for its params). Served at /examples/<route> on the docs
// site and embedded with <doc-example>. Keep this list in the same order as the home list.
export const routes: Routes = [
  { path: '', component: HomePage, title: 'ats-ui — components' },
  { path: 'bowling-alley', loadComponent: () => import('./pages/bowling-alley/bowling-alley-page').then((m) => m.BowlingAlleyPage), title: 'Bowling Alley — ats-ui' },
  { path: 'button', loadComponent: () => import('./pages/button/button-page').then((m) => m.ButtonPage), title: 'Button — ats-ui' },
  { path: 'icon', loadComponent: () => import('./pages/icon/icon-page').then((m) => m.IconPage), title: 'Icon — ats-ui' },
  { path: 'icon-button-no-container', loadComponent: () => import('./pages/icon-button-no-container/icon-button-no-container-page').then((m) => m.IconButtonNoContainerPage), title: 'Icon Button - no container — ats-ui' },
  { path: 'icon-container', loadComponent: () => import('./pages/icon-container/icon-container-page').then((m) => m.IconContainerPage), title: 'Icon Container — ats-ui' },
  { path: 'check-list', loadComponent: () => import('./pages/check-list/check-list-page').then((m) => m.CheckListPage), title: 'Check List — ats-ui' },
  { path: 'checkbox', loadComponent: () => import('./pages/checkbox/checkbox-page').then((m) => m.CheckboxPage), title: 'Checkbox — ats-ui' },
  { path: 'checkbox-label', loadComponent: () => import('./pages/checkbox-label/checkbox-label-page').then((m) => m.CheckboxLabelPage), title: 'Checkbox + label — ats-ui' },
  { path: 'card', loadComponent: () => import('./pages/card/card-page').then((m) => m.CardPage), title: 'Card — ats-ui' },
  { path: 'menu-edit', loadComponent: () => import('./pages/menu-edit/menu-edit-page').then((m) => m.MenuEditPage), title: 'Menu Edit — ats-ui' },
  { path: 'menu-header', loadComponent: () => import('./pages/menu-header/menu-header-page').then((m) => m.MenuHeaderPage), title: 'Menu Header — ats-ui' },
  { path: 'menu-item', loadComponent: () => import('./pages/menu-item/menu-item-page').then((m) => m.MenuItemPage), title: 'Menu Item — ats-ui' },
  { path: 'menu-option', loadComponent: () => import('./pages/menu-option/menu-option-page').then((m) => m.MenuOptionPage), title: 'Menu Option — ats-ui' },
  { path: 'novo-chip', loadComponent: () => import('./pages/novo-chip/novo-chip-page').then((m) => m.NovoChipPage), title: 'Novo Chip — ats-ui' },
  { path: 'data-table', loadComponent: () => import('./pages/data-table/data-table-page').then((m) => m.DataTablePage), title: 'Novo Data Table — ats-ui' },
  { path: 'novo-list', loadComponent: () => import('./pages/novo-list/novo-list-page').then((m) => m.NovoListPage), title: 'Novo List — ats-ui' },
  { path: 'record-header', loadComponent: () => import('./pages/record-header/record-header-page').then((m) => m.RecordHeaderPage), title: 'Record Header — ats-ui' },
  { path: 'search-input', loadComponent: () => import('./pages/search-input/search-input-page').then((m) => m.SearchInputPage), title: 'Search Input — ats-ui' },
  { path: 'sophia-fab', loadComponent: () => import('./pages/sophia-fab/sophia-fab-page').then((m) => m.SophiaFabPage), title: 'Sophia FAB — ats-ui' },
  { path: 'switch', loadComponent: () => import('./pages/switch/switch-page').then((m) => m.SwitchPage), title: 'Switch — ats-ui' },
  { path: 'workflow-stepper', loadComponent: () => import('./pages/workflow-stepper/workflow-stepper-page').then((m) => m.WorkflowStepperPage), title: 'Workflow Stepper — ats-ui' },
  { path: '**', redirectTo: '' },
];

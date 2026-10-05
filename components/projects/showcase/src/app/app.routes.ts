import { Routes } from '@angular/router';
import { ButtonPage } from './pages/button/button-page';
import { CheckboxPage } from './pages/checkbox/checkbox-page';
import { HomePage } from './pages/home/home-page';
import { IconButtonNoContainerPage } from './pages/icon-button-no-container/icon-button-no-container-page';
import { IconPage } from './pages/icon/icon-page';
import { WorkflowStepperPage } from './pages/workflow-stepper/workflow-stepper-page';

// One route per component. Each page renders the full reference matrix, or a
// compact embed when query params are given (see each page for its params).
// Served at /examples/<route> on the docs site and embedded with <doc-example>.
export const routes: Routes = [
  { path: '', component: HomePage, title: 'ats-ui — components' },
  { path: 'button', component: ButtonPage, title: 'Button — ats-ui' },
  { path: 'icon', component: IconPage, title: 'Icon — ats-ui' },
  { path: 'icon-button-no-container', component: IconButtonNoContainerPage, title: 'Icon Button - no container — ats-ui' },
  { path: 'checkbox', component: CheckboxPage, title: 'Checkbox — ats-ui' },
  { path: 'workflow-stepper', component: WorkflowStepperPage, title: 'Workflow Stepper — ats-ui' },
  { path: '**', redirectTo: '' },
];

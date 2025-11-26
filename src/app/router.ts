import { Route } from '@angular/router';
import { Home } from './home';
import { Other } from './other';
import { Inline } from './inline';

export const ROUTERS: Route[] = [
  { path: '', component: Home },
  { path: 'other', component: Other },
  { path: 'inline', component: Inline },
];

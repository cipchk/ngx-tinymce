import { Route } from '@angular/router';

import { Home } from './home';
import { Inline } from './inline';
import { Other } from './other';

export const ROUTERS: Route[] = [
  { path: '', component: Home },
  { path: 'other', component: Other },
  { path: 'inline', component: Inline }
];

import { Route } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OtherComponent } from './other/other.component';
import { InlineComponent } from './inline/inline.component';

export const ROUTERS: Route[] = [
  { path: '', component: HomeComponent },
  { path: 'other', component: OtherComponent },
  { path: 'inline', component: InlineComponent },
];

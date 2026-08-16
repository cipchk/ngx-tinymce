import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';

import { provideTinymce } from 'ngx-tinymce';

import { App } from './app/app';
import { ROUTERS } from './app/router';

bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(ROUTERS, withHashLocation()),
    provideTinymce({ baseURL: '//cdn.tiny.cloud/1/no-api-key/tinymce/8/' })
  ]
}).catch(err => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';
import { ROUTERS } from './app/router';
import { provideTinymce } from 'ngx-tinymce';
import { provideZonelessChangeDetection } from '@angular/core';

bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(ROUTERS, withHashLocation()),
    provideTinymce({ baseURL: '//cdn.tiny.cloud/1/no-api-key/tinymce/8/' }),
  ],
}).catch((err) => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';
import { ROUTERS } from './app/router';
import { provideTinymce } from 'lib';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(ROUTERS, withHashLocation()),
    provideTinymce({ baseURL: '//cdn.tiny.cloud/1/no-api-key/tinymce/7/' }),
  ],
}).catch((err) => console.error(err));

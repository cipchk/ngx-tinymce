import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HighlightJsModule } from 'ngx-highlight-js';
import { NgxTinymceModule } from 'ngx-tinymce';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { OtherComponent } from './other/other.component';
import { InlineComponent } from './inline/inline.component';
import { StandaloneDemoComponent } from './standalone.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, OtherComponent, InlineComponent],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    HighlightJsModule,
    RouterModule.forRoot(
      [
        { path: '', component: HomeComponent },
        { path: 'other', component: OtherComponent },
        { path: 'inline', component: InlineComponent },
        { path: 'standalone', component: StandaloneDemoComponent },
      ],
      { useHash: true },
    ),
    NgxTinymceModule.forRoot({
      // baseURL: '//cdnjs.cloudflare.com/ajax/libs/tinymce/5.7.1/',
      baseURL: '//cdn.tiny.cloud/1/no-api-key/tinymce/6/',
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

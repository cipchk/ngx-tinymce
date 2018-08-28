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

@NgModule({
  declarations: [AppComponent, HomeComponent, OtherComponent],
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
      ],
      { useHash: true },
    ),
    NgxTinymceModule.forRoot({
      baseURL: '//cdn.bootcss.com/tinymce/4.7.13/',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

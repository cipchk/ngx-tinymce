import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxTinymceModule } from 'ngx-tinymce';

@Component({
  selector: 'standalone-demo',
  template: ` <tinymce [(ngModel)]="html" [config]="config"></tinymce> `,
  standalone: true,
  imports: [FormsModule, NgxTinymceModule],
})
export class StandaloneDemoComponent {
  html = `HTML<strong>S</strong>`;
  config = {
    height: 350,
  };
}

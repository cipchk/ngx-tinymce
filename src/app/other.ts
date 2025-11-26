import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightJsDirective } from 'ngx-highlight-js';
import { TinymceComponent } from 'ngx-tinymce';

@Component({
  selector: 'app-other',
  template: `
    <div class="card mb-3">
      <div class="card-header">Loading</div>
      <div class="card-body">
        <textarea highlight-js>&lt;tinymce [config]="config" [(ngModel)]="html"></tinymce></textarea>
        <tinymce [(ngModel)]="html" [config]="config" loading="加载中……" (ready)="ready($event)"></tinymce>
      </div>
    </div>
  `,
  imports: [FormsModule, HighlightJsDirective, TinymceComponent],
})
export class Other {
  protected html = `now: ${+new Date()}`;

  protected config = {
    height: 500,
    menubar: false,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount',
    ],
    toolbar:
      'undo redo | formatselect | ' +
      'bold italic backcolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_css: '//www.tiny.cloud/css/codepen.min.css',
  };

  protected ready(instance: any): void {
    console.log('ready', instance);
  }
}

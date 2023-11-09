import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightJsDirective } from 'ngx-highlight-js';
import { TinymceComponent } from 'lib';

@Component({
  selector: 'app-other',
  templateUrl: './other.component.html',
  styleUrls: ['./other.component.less'],
  standalone: true,
  imports: [FormsModule, HighlightJsDirective, TinymceComponent],
})
export class OtherComponent {
  html = `now: ${+new Date()}`;

  config = {
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

  ready(instance: any): void {
    console.log('ready', instance);
  }
}

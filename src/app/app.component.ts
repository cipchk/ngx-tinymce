import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" routerLink="/">ngx-tinymce</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" routerLink="/">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/other">Other</a>
        </li>
      </ul>
    </div>
  </nav>
  <p style="line-height: 30px;">Angular for tinymce</p>
  <div style="margin-top: 16px;"><router-outlet></router-outlet></div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
}

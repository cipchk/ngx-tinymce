import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { HighlightJsDirective } from 'ngx-highlight-js';
import { TinymceComponent } from 'lib';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [FormsModule, HighlightJsDirective, TinymceComponent],
})
export class HomeComponent {
  readonly san = inject(DomSanitizer);

  html = `
  <p style="text-align: center; font-size: 15px;"><img title="TinyMCE Logo" src="//www.tinymce.com/images/glyph-tinymce@2x.png" alt="TinyMCE Logo" width="110" height="97" />
  </p>
  <h1 style="text-align: center;">Welcome to the TinyMCE Cloud demo!</h1>
  <h5 style="text-align: center;">Note, this includes some "enterprise/premium" features.<br>Visit the <a href="https://www.tinymce.com/pricing/#demo-enterprise">pricing page</a> to learn more about our premium plugins.</h5>
  <p>Please try out the features provided in this full featured example.</p>

  <h2>Got questions or need help?</h2>
  <ul>
    <li>Our <a href="//www.tinymce.com/docs/">documentation</a> is a great resource for learning how to configure TinyMCE.</li>
    <li>Have a specific question? Visit the <a href="https://community.tinymce.com/forum/">Community Forum</a>.</li>
    <li>We also offer enterprise grade support as part of <a href="https://tinymce.com/pricing">TinyMCE premium subscriptions</a>.</li>
  </ul>

  <h2>A simple table to play with</h2>
  <table style="text-align: center;">
    <thead>
      <tr>
        <th>Product</th>
        <th>Cost</th>
        <th>Really?</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>TinyMCE Cloud</td>
        <td>Get started for free</td>
        <td>YES!</td>
      </tr>
      <tr>
        <td>Plupload</td>
        <td>Free</td>
        <td>YES!</td>
      </tr>
    </tbody>
  </table>

  <h2>Found a bug?</h2>
  <p>If you think you have found a bug please create an issue on the <a href="https://github.com/tinymce/tinymce/issues">GitHub repo</a> to report it to the developers.</p>

  <h2>Finally ...</h2>
  <p>Don't forget to check out our other product <a href="http://www.plupload.com" target="_blank">Plupload</a>, your ultimate upload solution featuring HTML5 upload support.</p>
  <p>Thanks for supporting TinyMCE! We hope it helps you and your users create great content.<br>All the best from the TinyMCE team.</p>
    `;

  config = {
    height: 350,
  };
}

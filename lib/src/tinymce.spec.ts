import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { RawEditorOptions } from 'tinymce';
import { TinymceComponent } from './tinymce.component';

const delay = (ms?: number) => new Promise((res) => setTimeout(res, ms ?? 1000));

describe('Component: ngx-tinymce', () => {
  let fixture: ComponentFixture<any>;
  let context: TestComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
    });
    fixture = TestBed.createComponent(TestComponent);
    context = fixture.componentInstance;
  });

  it('fixture should not be null', async () => {
    context.config = { setup: jasmine.createSpy() };
    fixture.detectChanges();
    await delay(1);
    expect(context.config.setup).toHaveBeenCalled();
  });
});

@Component({
  selector: 'app-tinymce-test',
  template: '<tinymce [(ngModel)]="value" [config]="config" (ready)="onReady()" />',
  imports: [FormsModule, TinymceComponent],
})
class TestComponent {
  value = `<h1>a</h1>`;
  config?: RawEditorOptions | null;
  onReady(): void { }
}

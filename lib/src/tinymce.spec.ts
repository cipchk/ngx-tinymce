import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxTinymceModule } from './tinymce.module';

const html = ``;

describe('Component: ngx-tinymce', () => {
  let fixture: ComponentFixture<any>;
  let context: TestComponent;
  let element: any;
  let clean: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [NgxTinymceModule],
    });
    TestBed.overrideComponent(TestComponent, { set: { template: html } });
    fixture = TestBed.createComponent(TestComponent);
    context = fixture.componentInstance;
    element = fixture.nativeElement.querySelector('#c1');
    clean = fixture.nativeElement.querySelector('#c2');
    fixture.detectChanges();
  });

  it('fixture should not be null', () => {
    expect(fixture).not.toBeNull();
  });
});

@Component({
  selector: 'app-tinymce-test',
  template: '',
})
class TestComponent {}

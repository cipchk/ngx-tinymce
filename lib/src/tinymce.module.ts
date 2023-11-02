import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TinymceOptions } from './tinymce.options';
import { TinymceComponent } from './tinymce.component';

@NgModule({
  imports: [CommonModule, TinymceComponent],
  exports: [TinymceComponent],
})
export class NgxTinymceModule {
  static forRoot(options: TinymceOptions): ModuleWithProviders<NgxTinymceModule> {
    return {
      ngModule: NgxTinymceModule,
      providers: [{ provide: TinymceOptions, useValue: options }],
    };
  }
}

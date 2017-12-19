import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TinymceOptions } from './src/tinymce.options';
import { TinymceComponent } from './src/tinymce.component';
import { ScriptService } from './src/script.service';

// region: export

export * from './src/tinymce.options';
export { TinymceComponent } from './src/tinymce.component';

// endregion

@NgModule({
    imports: [CommonModule],
    declarations: [TinymceComponent],
    exports: [TinymceComponent]
})
export class NgxTinymceModule {
    public static forRoot(options: TinymceOptions): ModuleWithProviders {
        return {
            ngModule: NgxTinymceModule,
            providers: [
                ScriptService,
                { provide: TinymceOptions, useValue: options }
            ]
        };
    }
}

import {
  Component,
  forwardRef,
  OnChanges,
  OnDestroy,
  Input,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  TemplateRef,
  SimpleChanges,
  ViewEncapsulation,
  Output,
  EventEmitter,
  NgZone,
  SimpleChange,
  booleanAttribute,
  numberAttribute,
  inject,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NuLazyService } from '@ng-util/lazy';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import type { Editor as TinyMCEEditor, RawEditorOptions } from 'tinymce';
import { TinymceOptions } from './tinymce.options';

const isSSR = !(typeof document === 'object' && !!document);

/**
 * Angular for tinymce, You can modify the global configuration via `provideTinymce`
 */
@Component({
  selector: 'tinymce',
  exportAs: 'tinymce',
  template: `
    @if (inline) {
    <div [attr.id]="id"><ng-content /></div>
    } @else {
    <textarea [attr.id]="id" [attr.placeholder]="placeholder" class="tinymce-selector"></textarea>
    } @if (load) {
    <div class="loading">
      @if (_loading) {
      {{ _loading }}
      } @else {
      <ng-template [ngTemplateOutlet]="_loadingTpl" />
      }
    </div>
    }
  `,
  imports: [NgTemplateOutlet],
  styles: [
    `
      tinymce .tinymce-selector {
        display: none;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TinymceComponent),
      multi: true,
    },
  ],
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TinymceComponent implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  private defConfig = inject(TinymceOptions, { optional: true });
  private lazySrv = inject(NuLazyService);
  private ngZone = inject(NgZone);
  private doc = inject(DOCUMENT);
  private cd = inject(ChangeDetectorRef);

  private _instance?: TinyMCEEditor | null;
  private value = '';
  load = true;
  id = `_tinymce-${Math.random().toString(36).substring(2)}`;

  private onChange!: (value: string) => void;
  private onTouched!: () => void;

  @Input() config?: RawEditorOptions | null;
  @Input() placeholder = '';
  @Input({ transform: booleanAttribute }) inline = false;
  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this._disabled = value;
    this.setDisabled();
  }
  private _disabled = false;

  _loading: string | null = null;
  _loadingTpl: TemplateRef<any> | null = null;
  @Input()
  set loading(value: string | TemplateRef<any>) {
    if (value instanceof TemplateRef) {
      this._loading = null;
      this._loadingTpl = value;
    } else {
      this._loading = value;
    }
  }
  /** 延迟初始化 */
  @Input({ transform: numberAttribute }) delay = 0;
  @Output() readonly ready = new EventEmitter<TinyMCEEditor>();

  get instance(): TinyMCEEditor | undefined | null {
    return this._instance;
  }

  private _getWin(): any {
    return this.doc.defaultView || window;
  }

  private initDelay(): void {
    if (isSSR) {
      return;
    }
    setTimeout(() => this.init(), Math.max(0, this.delay));
  }

  private init(): void {
    const win = this._getWin();
    if (!win.tinymce) {
      throw new Error('tinymce js文件加载失败');
    }

    const { defConfig, config, id, inline } = this;
    if (this._instance) {
      return;
    }

    if (defConfig?.baseURL) {
      let url = '' + defConfig.baseURL;
      if (url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
      }
      win.tinymce.baseURL = url;
    }
    const userOptions = { ...defConfig?.config, ...config };
    const options: RawEditorOptions = {
      selector: `#` + id,
      inline,
      ...defConfig?.config,
      ...config,

      setup: (editor) => {
        this._instance = editor;
        if (this.onChange) {
          editor.on('change keyup', () => {
            this.value = editor.getContent();
            this.ngZone.run(() => this.onChange(this.value));
          });
        }
        if (typeof userOptions.setup === 'function') {
          userOptions.setup(editor);
        }
      },
      init_instance_callback: (editor) => {
        if (editor && this.value) {
          editor.setContent(this.value);
        }
        this.setDisabled();
        if (typeof userOptions.init_instance_callback === 'function') {
          userOptions.init_instance_callback(editor);
        }
        this.ready.emit(editor);
      },
    };
    if (userOptions.auto_focus) {
      options.auto_focus = id;
    }

    this.ngZone.runOutsideAngular(() => win.tinymce.init(options));

    this.load = false;
    this.cd.detectChanges();
  }

  private destroy(): void {
    if (this._instance == null) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this._instance!.off();
      this._instance!.remove();
    });
    this._instance = null;
  }

  private setDisabled(): void {
    if (!this._instance) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      const mode = this._disabled ? 'readonly' : 'design';
      // Compatible with 5
      const setMode5 = (this._instance as any).setMode;
      if (typeof setMode5 === 'function') {
        setMode5(mode);
      } else {
        this._instance!.mode.set(mode);
      }
    });
  }

  ngAfterViewInit(): void {
    if (isSSR) {
      return;
    }
    // 已经存在对象无须进入懒加载模式
    if (this._getWin().tinymce) {
      this.initDelay();
      return;
    }

    const { defConfig } = this;
    const baseURL = defConfig && defConfig.baseURL;
    const fileName = defConfig && defConfig.fileName;
    const url = (baseURL || './assets/tinymce/') + (fileName || 'tinymce.min.js');
    this.lazySrv.monitor(url).subscribe(() => this.initDelay());
    this.lazySrv.load(url);
  }

  ngOnChanges(changes: { [P in keyof this]?: SimpleChange } & SimpleChanges): void {
    if (this._instance && changes.config) {
      this.destroy();
      this.initDelay();
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  writeValue(value: string): void {
    // value should be NOT NULL
    this.value = value || '';
    if (this._instance) {
      this.ngZone.runOutsideAngular(() => this._instance!.setContent(this.value));
    }
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.setDisabled();
  }
}

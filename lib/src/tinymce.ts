import {
  Component,
  forwardRef,
  OnDestroy,
  ChangeDetectionStrategy,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  numberAttribute,
  inject,
  signal,
  input,
  output,
  afterNextRender,
  effect,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NuLazyService } from '@ng-util/lazy';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import type { Editor as TinyMCEEditor, RawEditorOptions } from 'tinymce';
import { TinymceOptions } from './options';

const isSSR = !(typeof document === 'object' && !!document);

/**
 * Angular for tinymce, You can modify the global configuration via `provideTinymce`
 */
@Component({
  selector: 'tinymce',
  exportAs: 'tinymce',
  template: `
    @if (inline()) {
      <div [attr.id]="id"><ng-content /></div>
    } @else {
      <textarea [attr.id]="id" [attr.placeholder]="placeholder()" class="tinymce-selector"></textarea>
    } @if (load()) {
      <div class="loading">
        @if (_loading()) {
          {{ _loading() }}
        } @else {
          <ng-template [ngTemplateOutlet]="_loadingTpl()" />
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
export class TinymceComponent implements OnDestroy, ControlValueAccessor {
  private readonly defConfig = inject(TinymceOptions, { optional: true });
  private readonly lazySrv = inject(NuLazyService);
  private readonly doc = inject(DOCUMENT);

  private _instance?: TinyMCEEditor | null;
  private value = '';
  protected readonly load = signal(true);
  protected readonly id = `_tinymce-${Math.random().toString(36).substring(2)}`;

  private onChange?: (value: string) => void;
  private onTouched?: () => void;

  readonly config = input<RawEditorOptions | null>(null);
  readonly placeholder = input('');
  readonly inline = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  private _disabled = signal(false);

  protected _loading = signal<string | null>(null);
  protected _loadingTpl = signal<TemplateRef<any> | null>(null);
  readonly loading = input(null, {
    transform: (value: string | TemplateRef<any> | null) => {
      if (value instanceof TemplateRef) {
        this._loading.set(null);
        this._loadingTpl.set(value);
      } else {
        this._loading.set(value);
      }
      return value;
    },
  });
  /** 延迟初始化 */
  readonly delay = input(0, { transform: numberAttribute });
  readonly ready = output<TinyMCEEditor>();

  get instance(): TinyMCEEditor | undefined | null {
    return this._instance;
  }

  constructor() {
    afterNextRender(() => {
      if (isSSR) {
        return;
      }
      // 已经存在对象无须进入懒加载模式
      if (this.win.tinymce) {
        this.initDelay();
        return;
      }

      const { defConfig } = this;
      const baseURL = defConfig && defConfig.baseURL;
      const fileName = defConfig && defConfig.fileName;
      const url = (baseURL ?? './assets/tinymce/') + (fileName ?? 'tinymce.min.js');
      this.lazySrv.monitor(url).subscribe(() => this.initDelay());
      this.lazySrv.load(url);
    });

    effect(() => {
      const cfg = this.config();
      if (!this._instance) return;
      this.destroy();
      if (cfg)
        this.initDelay();
    })
  }

  private get win(): any {
    return this.doc.defaultView ?? window;
  }

  private initDelay(): void {
    if (isSSR) {
      return;
    }
    setTimeout(() => this.init(), Math.max(0, this.delay()));
  }

  private init(): void {
    const win = this.win;
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
    const userOptions = { ...defConfig?.config, ...config() };
    const options: RawEditorOptions = {
      selector: `#` + id,
      inline: inline(),
      ...defConfig?.config,
      ...config(),

      setup: (editor) => {
        this._instance = editor;
        if (this.onChange) {
          editor.on('change keyup', () => {
            this.value = editor.getContent();
            this.onChange!(this.value);
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

    win.tinymce.init(options);

    this.load.set(false);
  }

  private destroy(): void {
    if (this._instance == null) {
      return;
    }
    this._instance.off();
    this._instance.remove();
    this._instance = null;
  }

  private setDisabled(): void {
    if (!this._instance) {
      return;
    }
    const mode = this.disabled() || this._disabled() ? 'readonly' : 'design';
    // Compatible with 5
    const setMode5 = (this._instance as any).setMode;
    if (typeof setMode5 === 'function') {
      setMode5(mode);
    } else {
      this._instance!.mode.set(mode);
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  writeValue(value: string): void {
    // value should be NOT NULL
    this.value = value ?? '';
    this._instance?.setContent(this.value);
  }

  registerOnChange(fn: (_: any) => object): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => object): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
    this.setDisabled();
  }
}

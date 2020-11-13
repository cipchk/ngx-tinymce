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
  Inject,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { InputBoolean, InputNumber } from '@ng-util/util';
import { NuLazyService } from '@ng-util/lazy';
import { TinymceOptions } from './tinymce.options';
import { DOCUMENT } from '@angular/common';

const isSSR = !(typeof document === 'object' && !!document);

@Component({
  selector: 'tinymce',
  exportAs: 'tinymce',
  template: `
    <textarea
      *ngIf="!inline"
      [attr.id]="id"
      [attr.placeholder]="placeholder"
      class="tinymce-selector"
    ></textarea>
    <div *ngIf="inline" [attr.id]="id"><ng-content></ng-content></div>
    <div class="loading" *ngIf="load">
      <ng-container *ngIf="_loading; else _loadingTpl">{{
        _loading
      }}</ng-container>
    </div>
  `,
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
export class TinymceComponent
  implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  private _instance: any;
  private value: string;
  load = true;
  id = `_tinymce-${Math.random().toString(36).substring(2)}`;

  private onChange: (value: string) => void;
  private onTouched: () => void;

  @Input() config: any;
  @Input() placeholder: string;
  @Input() @InputBoolean() inline = false;
  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
    this.setDisabled();
  }
  private _disabled = false;

  _loading: string;
  _loadingTpl: TemplateRef<any>;
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
  @Input() @InputNumber() delay = 0;
  @Output() ready = new EventEmitter<any>();

  get instance(): any {
    return this._instance;
  }

  private _getWin(): any {
    return this.doc.defaultView || window;
  }

  constructor(
    private defConfig: TinymceOptions,
    private lazySrv: NuLazyService,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private doc: any,
    private cd: ChangeDetectorRef,
  ) {}

  private initDelay(): void {
    if (isSSR) {
      return;
    }
    setTimeout(() => this.init(), Math.min(0, this.delay));
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

    if (defConfig.baseURL) {
      let url = '' + defConfig.baseURL;
      if (url.endsWith('/')) {
        url = url.substr(0, url.length - 1);
      }
      win.tinymce.baseURL = url;
    }
    const userOptions = { ...defConfig.config, ...config };
    const options = {
      selector: `#` + id,
      inline,
      ...defConfig.config,
      ...config,

      setup: (editor: any) => {
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
      init_instance_callback: (editor: any) => {
        if (editor && this.value) {
          editor.setContent(this.value);
        }
        this.setDisabled();
        if (typeof userOptions.init_instance_callback === 'function') {
          userOptions.init_instance_callback(editor);
        }
        this.ready.emit(this._instance);
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
    if (!this._instance) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this._instance.off();
      this._instance.remove('#' + this.id);
    });
    this._instance = null;
  }

  private setDisabled(): void {
    if (!this._instance) {
      return;
    }
    this.ngZone.runOutsideAngular(() =>
      this._instance.setMode(this._disabled ? 'readonly' : 'design'),
    );
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
    const url =
      (baseURL || './assets/tinymce/') + (fileName || 'tinymce.min.js');
    this.lazySrv.monitor(url).subscribe(() => this.initDelay());
    this.lazySrv.load(url);
  }

  ngOnChanges(changes: SimpleChanges): void {
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
      this.ngZone.runOutsideAngular(() =>
        this._instance.setContent(this.value),
      );
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

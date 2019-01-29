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
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ScriptService } from './tinymce.script.service';
import { TinymceOptions } from './tinymce.options';

declare const window: any;
declare const tinymce: any;

@Component({
  selector: 'tinymce',
  templateUrl: './tinymce.component.html',
  styles: [
    `
      tinymce .tinymce-selector {
        display: none;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TinymceComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TinymceComponent
  implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  private _instance: any;
  private value: string;
  load = true;
  id = `_tinymce-${Math.random()
    .toString(36)
    .substring(2)}`;

  private onChange: (value: string) => void;
  private onTouched: () => void;

  @Input() config: any;
  @Input() placeholder: string;
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
  @Input() delay = 0;
  @Output() ready = new EventEmitter<any>();

  get instance() {
    return this._instance;
  }

  constructor(
    private defConfig: TinymceOptions,
    private ss: ScriptService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  private initDelay() {
    this.ngZone.runOutsideAngular(() => {
      if (this.delay > 0) {
        setTimeout(() => this.init(), this.delay);
      } else {
        this.init();
      }
    });
  }

  private init() {
    if (!window.tinymce) throw new Error('tinymce js文件加载失败');

    const { defConfig, config, id } = this;
    if (this._instance) return;

    if (defConfig.baseURL) {
      let url = '' + defConfig.baseURL;
      if (url.endsWith('/')) url = url.substr(0, url.length - 1);
      tinymce.baseURL = url;
    }

    const userOptions = Object.assign({}, defConfig.config, config);

    const options = Object.assign(
      {
        selector: `#` + id,
      },
      defConfig.config,
      config,
      {
        setup: (editor: any) => {
          this._instance = editor;
          editor.on('change keyup', () =>
            this.ngZone.run(() => {
              this.value = editor.getContent();
              this.onChange(this.value);
              this.cdr.detectChanges();
            }),
          );
          if (typeof userOptions.setup === 'function') {
            userOptions.setup(editor);
          }
        },
        init_instance_callback: (editor: any) => {
          if (editor && this.value) editor.setContent(this.value);
          this.setDisabled();
          if (typeof userOptions.init_instance_callback === 'function') {
            userOptions.init_instance_callback(editor);
          }
          this.ready.emit(this._instance);
        },
      },
    );
    if (userOptions.auto_focus) {
      options.auto_focus = id;
    }

    tinymce.init(options);

    this.ngZone.run(() => {
      this.load = false;
      this.cdr.detectChanges();
    });
  }

  private destroy() {
    if (!this._instance) {
      return;
    }
    this._instance.off();
    this._instance.remove('#' + this.id);
    this._instance = null;
  }

  private setDisabled() {
    if (!this._instance) return;
    this._instance.setMode(this._disabled ? 'readonly' : 'design');
  }

  ngAfterViewInit(): void {
    // 已经存在对象无须进入懒加载模式
    if (window.tinymce) {
      this.initDelay();
      return;
    }

    const { defConfig } = this;
    const baseURL = defConfig && defConfig.baseURL;
    const fileName = defConfig && defConfig.fileName;
    this.ss
      .load((baseURL || './assets/tinymce/') + (fileName || 'tinymce.min.js'))
      .change
      .subscribe(() => this.initDelay());
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

  // reuse-tab: http://ng-alain.com/components/reuse-tab#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F
  _onReuseInit() {
    this.destroy();
    this.initDelay();
  }

  writeValue(value: string): void {
    // value should be NOT NULL
    this.value = value || '';
    if (this._instance) {
      this._instance.setContent(this.value);
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

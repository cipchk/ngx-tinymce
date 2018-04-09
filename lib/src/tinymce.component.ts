import { Component, forwardRef, OnChanges, OnDestroy, Input, OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, TemplateRef, Output, EventEmitter, SimpleChanges, Optional } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ScriptService } from './script.service';
import { TinymceOptions } from './tinymce.options';

declare const window: any;
declare const tinymce: any;

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'tinymce',
    template: `
    <textarea id="{{id}}" class="tinymce-selector"></textarea>
    <div class="loading" *ngIf="load">
        <ng-container *ngIf="_loading; else _loadingTpl">{{_loading}}</ng-container>
    </div>
    `,
    styles: [ `:host .tinymce-selector{display:none}` ],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TinymceComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false
})
export class TinymceComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
    private instance: any;
    private value: string;
    private inited = false;
    load = true;
    id = `_tinymce-${Math.random().toString(36).substring(2)}`;
    onChange: any = Function.prototype;
    onTouched: any = Function.prototype;

    @Input() config: any;

    _loading: string;
    _loadingTpl: TemplateRef<any>;
    @Input()
    set loading(value: string | TemplateRef<any>) {
        if (value instanceof TemplateRef)
            this._loadingTpl = value;
        else
            this._loading = value;
    }

    constructor(
        private defConfig: TinymceOptions,
        private ss: ScriptService,
        private cd: ChangeDetectorRef
    ) {}

    private init() {
        if (!window.tinymce)
            throw new Error('tinymce js文件加载失败');

        if (this.instance) return;

        if (this.defConfig.baseURL) tinymce.baseURL = this.defConfig.baseURL;

        const userOptions = Object.assign({ }, this.defConfig.config, this.config);

        const options = Object.assign({
            selector: `#` + this.id
        }, this.defConfig.config, this.config, {
            setup: (editor: any) => {
                this.instance = editor;
                editor.on('change keyup', () => {
                    this.value = editor.getContent();
                    this.onChange(this.value);
                    this.onTouched(this.value);
                });
                if (typeof userOptions.setup === 'function') {
                    userOptions.setup(editor);
                }
            },
            init_instance_callback: (editor: any) => {
                if (editor && this.value)
                    editor.setContent(this.value);
                if (typeof userOptions.init_instance_callback === 'function') {
                    userOptions.init_instance_callback(editor);
                }

                this.load = false;
                this.cd.markForCheck();
            }
        });
        if (userOptions.auto_focus) options.auto_focus = this.id;
        tinymce.init(options);
    }

    private destroy() {
        if (!this.instance) {
            return ;
        }
        this.instance.off();
        this.instance.remove('#' + this.id);
        this.instance = null;
    }

    ngOnInit() {
        this.inited = true;
    }

    ngAfterViewInit(): void {
        // 已经存在对象无须进入懒加载模式
        if (window.tinymce) {
            this.init();
            return;
        }

        const baseURL = this.defConfig && this.defConfig.baseURL;
        const fileName = this.defConfig && this.defConfig.fileName;
        this.ss.load((baseURL || './assets/tinymce/') + (fileName || 'tinymce.min.js')).getChangeEmitter().subscribe(res => {
            this.init();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.inited && changes.config) {
            this.destroy();
            this.init();
        }
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    // reuse-tab: http://ng-alain.com/components/reuse-tab#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F
    _onReuseInit() {
        this.destroy();
        this.init();
    }

    writeValue(value: string): void {
        // value should be NOT NULL
        this.value = value || '';
        if (this.instance) {
            this.instance.setContent(this.value);
        }
    }

    registerOnChange(fn: (_: any) => {}): void { this.onChange = fn; }
    registerOnTouched(fn: () => {}): void { this.onTouched = fn; }

    setDisabledState(isDisabled: boolean): void {
        if (!this.instance) return;
        if (isDisabled) {
            this.instance.disabled();
        } else {
            this.instance.setEnabled();
        }
    }
}

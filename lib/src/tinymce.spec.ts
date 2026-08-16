import { Component, provideZonelessChangeDetection, signal, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import type { RawEditorOptions } from 'tinymce';

import { NuLazyService } from '@ng-util/lazy';

import { TinymceOptions } from './options';
import { TinymceComponent } from './tinymce';

const delay = (ms?: number): Promise<void> => new Promise(res => setTimeout(res, ms ?? 1000));

interface FakeEditor {
  content: string;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  setContent: ReturnType<typeof vi.fn>;
  getContent: ReturnType<typeof vi.fn>;
  mode: { set: ReturnType<typeof vi.fn> };
  setMode?: ReturnType<typeof vi.fn>;
  emit: (event: string) => void;
}

function createFakeEditor(hasSetMode = true): FakeEditor {
  const listeners = new Map<string, Array<() => void>>();
  const editor: FakeEditor = {
    content: '',
    on: vi.fn((event: string, cb: () => void) => {
      const arr = listeners.get(event) ?? [];
      arr.push(cb);
      listeners.set(event, arr);
    }),
    off: vi.fn(),
    remove: vi.fn(),
    setContent: vi.fn((content: string) => {
      editor.content = content;
    }),
    getContent: vi.fn(() => editor.content),
    mode: { set: vi.fn() },
    emit: (event: string) => {
      (listeners.get(event) ?? []).forEach(cb => cb());
    }
  };
  if (hasSetMode) {
    editor.setMode = vi.fn();
  }
  return editor;
}

function createInitSpy(editor: FakeEditor, onOptions?: (options: RawEditorOptions) => void): ReturnType<typeof vi.fn> {
  return vi.spyOn((window as any).tinymce, 'init').mockImplementation((options: any) => {
    const opt = options as RawEditorOptions;
    onOptions?.(opt);
    if (typeof opt.setup === 'function') {
      opt.setup(editor as any);
    }
    if (typeof opt.init_instance_callback === 'function') {
      opt.init_instance_callback(editor as any);
    }
    return editor as any;
  });
}

describe('Component: ngx-tinymce', () => {
  let fixture: ComponentFixture<TestComponent>;
  let context: TestComponent;
  let editor: FakeEditor;
  let lastOptions: RawEditorOptions | null;
  let initSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    editor = createFakeEditor();
    lastOptions = null;
    initSpy = createInitSpy(editor, options => {
      lastOptions = options;
    });
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [TestComponent]
    });
    fixture = TestBed.createComponent(TestComponent);
    context = fixture.componentInstance;
  });

  afterEach(() => {
    initSpy.mockRestore();
  });

  it('should render textarea and loading by default', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('div[id^="_tinymce-"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.loading')).toBeTruthy();
  });

  it('should render inline div when inline', () => {
    context.inline = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
    expect(fixture.nativeElement.querySelector('div[id^="_tinymce-"]')).toBeTruthy();
  });

  it('should bind placeholder', () => {
    context.placeholder = 'hello';
    fixture.detectChanges();
    const ta = fixture.nativeElement.querySelector('textarea');
    expect(ta.getAttribute('placeholder')).toBe('hello');
  });

  it('should render loading text when loading is string', () => {
    context.loading = '加载中……';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.loading');
    expect(el.textContent).toContain('加载中……');
  });

  it('should hide loading after initialized', async () => {
    fixture.detectChanges();
    await delay(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.loading')).toBeNull();
    expect(initSpy).toHaveBeenCalled();
  });

  it('should call setup and emit ready', async () => {
    const setup = vi.fn();
    context.config.set({ setup });
    fixture.detectChanges();
    await delay(1);
    const tce = fixture.debugElement.children[0].componentInstance as TinymceComponent;
    expect(setup).toHaveBeenCalledWith(editor);
    expect(context.readySpy).toHaveBeenCalledWith(editor);
    expect(tce.instance).toBe(editor);
  });

  it('should call user init_instance_callback and set content', async () => {
    const cb = vi.fn();
    context.config.set({ init_instance_callback: cb });
    fixture.detectChanges();
    await delay(1);
    expect(cb).toHaveBeenCalledWith(editor);
    expect(editor.setContent).toHaveBeenCalledWith('<h1>a</h1>');
  });

  it('should set auto_focus to element id', async () => {
    context.config.set({ auto_focus: true });
    fixture.detectChanges();
    await delay(1);
    expect(lastOptions?.auto_focus).toContain('_tinymce-');
  });

  it('should set content via writeValue', async () => {
    fixture.detectChanges();
    await delay(1);
    const tce = fixture.debugElement.children[0].componentInstance as TinymceComponent;
    tce.writeValue('<p>new</p>');
    expect(editor.setContent).toHaveBeenCalledWith('<p>new</p>');
  });

  it('should not set content before init', () => {
    const tce = fixture.debugElement.children[0].componentInstance as TinymceComponent;
    tce.writeValue('<p>new</p>');
    expect(editor.setContent).not.toHaveBeenCalled();
  });

  it('should notify model when editor changes', async () => {
    fixture.detectChanges();
    await delay(1);
    editor.content = '<p>updated</p>';
    editor.emit('change keyup');
    expect(context.value()).toBe('<p>updated</p>');
  });

  it('should set readonly mode when disabled input', async () => {
    context.disabled = true;
    fixture.detectChanges();
    await delay(1);
    expect(editor.setMode).toHaveBeenCalledWith('readonly');
  });

  it('should set readonly mode via setDisabledState', async () => {
    fixture.detectChanges();
    await delay(1);
    const tce = fixture.debugElement.children[0].componentInstance as TinymceComponent;
    tce.setDisabledState(true);
    expect(editor.setMode).toHaveBeenCalledWith('readonly');
  });

  it('should fallback to mode.set when editor has no setMode', async () => {
    delete editor.setMode;
    fixture.detectChanges();
    await delay(1);
    expect(editor.mode.set).toHaveBeenCalledWith('design');
  });

  it('should destroy editor on ngOnDestroy', async () => {
    fixture.detectChanges();
    await delay(1);
    fixture.destroy();
    expect(editor.off).toHaveBeenCalled();
    expect(editor.remove).toHaveBeenCalled();
  });

  it('should ignore init when instance already exists', async () => {
    fixture.detectChanges();
    await delay(1);
    const tce = fixture.debugElement.children[0].componentInstance as any;
    const callsBefore = initSpy.mock.calls.length;
    tce.init();
    expect(initSpy.mock.calls.length).toBe(callsBefore);
  });

  it('should re-init when config changes', async () => {
    fixture.detectChanges();
    await delay(1);
    expect(initSpy).toHaveBeenCalledTimes(1);
    context.config.set({ height: 200 });
    fixture.detectChanges();
    await delay(1);
    expect(initSpy).toHaveBeenCalledTimes(2);
    expect(editor.off).toHaveBeenCalled();
    expect(editor.remove).toHaveBeenCalled();
  });

  it('TinymceOptions defaults', () => {
    const opts = new TinymceOptions();
    expect(opts.baseURL).toBe('./assets/tinymce/');
    expect(opts.fileName).toBe('tinymce.min.js');
  });
});

describe('Component with global config', () => {
  let fixture: ComponentFixture<TestComponent>;
  let initSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    initSpy = createInitSpy(createFakeEditor());
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: TinymceOptions,
          useValue: { baseURL: 'https://cdn.example.com/tinymce/', config: { plugins: ['lists'] } }
        }
      ],
      imports: [TestComponent]
    });
    fixture = TestBed.createComponent(TestComponent);
  });

  afterEach(() => {
    initSpy.mockRestore();
  });

  it('should strip trailing slash of baseURL', async () => {
    fixture.detectChanges();
    await delay(1);
    expect((window as any).tinymce.baseURL).toBe('https://cdn.example.com/tinymce');
  });
});

describe('Component with loading template', () => {
  let fixture: ComponentFixture<LoadingTplComponent>;
  let initSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    initSpy = createInitSpy(createFakeEditor());
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [LoadingTplComponent]
    });
    fixture = TestBed.createComponent(LoadingTplComponent);
  });

  afterEach(() => {
    initSpy.mockRestore();
  });

  it('should render custom loading template', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.loading')?.textContent).toContain('custom loading');
  });
});

describe('lazy load when tinymce is absent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let loadSpy: ReturnType<typeof vi.fn>;
  let origTinymce: any;

  beforeEach(() => {
    loadSpy = vi.fn();
    origTinymce = (window as any).tinymce;
    delete (window as any).tinymce;
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: NuLazyService, useValue: { load: loadSpy, monitor: () => new Observable() } }
      ],
      imports: [TestComponent]
    });
    fixture = TestBed.createComponent(TestComponent);
  });

  afterEach(() => {
    (window as any).tinymce = origTinymce;
  });

  it('should lazy load default tinymce url', () => {
    fixture.detectChanges();
    expect(loadSpy).toHaveBeenCalledWith('./assets/tinymce/tinymce.min.js');
  });
});

@Component({
  selector: 'app-tinymce-test',
  template: `<tinymce
    [(ngModel)]="value"
    [config]="config()"
    [inline]="inline"
    [disabled]="disabled"
    [placeholder]="placeholder"
    [loading]="loading"
    (ready)="onReady($event)"
  />`,
  imports: [FormsModule, TinymceComponent]
})
class TestComponent {
  value = signal(`<h1>a</h1>`);
  config = signal<RawEditorOptions | null>(null);
  inline = false;
  disabled = false;
  placeholder = '';
  loading: string | TemplateRef<any> | null = null;
  readonly readySpy = vi.fn();

  onReady(editor: any): void {
    this.readySpy(editor);
  }
}

@Component({
  selector: 'app-loading-tpl',
  template: `<tinymce [loading]="tpl" /><ng-template #tpl>custom loading</ng-template>`,
  imports: [TinymceComponent]
})
class LoadingTplComponent {
  @ViewChild('tpl') tpl!: TemplateRef<any>;
}

import { vi } from 'vitest';

/**
 * 测试全局 setup（由 @angular/build:unit-test 的 setupFiles 加载）。
 *
 * tinymce.min.js 在加载时依赖 `window.matchMedia`，而 jsdom 环境未提供，
 * 这里为其提供 mock 实现。
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

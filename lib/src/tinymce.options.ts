export class TinymceOptions {
  /** 指定tinymce目录路径，默认：`./assets/tinymce/` */
  baseURL ? = './assets/tinymce/';
  /** 指定tinymce文件名，默认：`tinymce.min.js` */
  fileName ? = 'tinymce.min.js';
  /** 默认配置项，对全局 Tinymce 有效 */
  config?: any;
  /** 延迟加载（单位：毫秒），默认：`0` */
  delay?: number;
}

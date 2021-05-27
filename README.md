# ngx-tinymce

[![NPM version](https://img.shields.io/npm/v/ngx-tinymce.svg)](https://www.npmjs.com/package/ngx-tinymce)
[![Ci](https://github.com/cipchk/ngx-tinymce/workflows/Ci/badge.svg)](https://github.com/cipchk/ngx-tinymce/actions)

[Tinymce](https://www.tinymce.com/) Components build with [Angular](https://angular.io/).

## DEMO

- [Github](https://cipchk.github.io/ngx-tinymce/)
- [Stackblitz](https://stackblitz.com/edit/ngx-tinymce)

## Installation instructions

Install `ngx-tinymce` from `npm`

```bash
npm install ngx-tinymce --save
```

**Recommend:** You will need `tinymce.min.js` file via [Build Customizer](https://www.tiny.cloud/get-tiny/custom-builds/) generate.

Import the `ngx-tinymce` in to your root `AppModule`.

```typescript
import { NgxTinymceModule } from 'ngx-tinymce';

@NgModule({
  imports: [
    NgxTinymceModule.forRoot({
      baseURL: './assets/tinymce/',
      // or cdn
      baseURL: '//cdnjs.cloudflare.com/ajax/libs/tinymce/5.7.1/'
    })
  ]
})
export class AppModule { }
```

### Usage

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `<tinymce [(ngModel)]="html"></tinymce>`
})
export class AppComponent  {
  html = ``;
}
```

### How to use it with:

+ `angular-cli` please refer to **Installation instructions**.
+ `stackblitz` sample available [here](https://stackblitz.com/edit/ngx-tinymce?file=app%2Fapp.component.ts).

## API

| Name | Type | Default | Summary |
|------|------|---------|---------|
| config | `any` |  | see [configure](https://www.tinymce.com/docs/configure/integration-and-setup/) |
| loading | `string,TemplateRef` | - | Loading status of tinymce |
| disabled | `boolean` | `false` | Set tinymce mode is `readonly` if `true` |
| inline | `boolean` | `false` | Inline editor |
| delay | `number` | 0 | Delayed rendering, unit is 'millisecond' |
| placeholder | `string` | - | Placeholder for tinymce, **NOTE:** dependent on [tinymce-placeholder](https://github.com/mohan/tinymce-placeholder) |
| ready | `EventEmitter<any>` | - | Tinymce ready callback |

## Troubleshooting

Please follow this guidelines when reporting bugs and feature requests:

1. Use [GitHub Issues](https://github.com/cipchk/ngx-tinymce/issues) board to report bugs and feature requests (not our email address)
2. Please **always** write steps to reproduce the error. That way we can focus on fixing the bug, not scratching our heads trying to reproduce it.

Thanks for understanding!

### License

The MIT License (see the [LICENSE](https://github.com/cipchk/ngx-tinymce/blob/master/LICENSE) file for the full text)

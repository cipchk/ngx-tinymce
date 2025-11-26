import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { TinymceOptions } from './options';

/**
 * Sets up providers necessary to config for the Tinymce.
 * @example
 * bootstrapApplication(AppComponent, {
 *   providers: [provideTinymce({baseURL: '//cdn.tiny.cloud/1/no-api-key/tinymce/6/'})]
 * });
 */
export function provideTinymce(options: TinymceOptions): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: TinymceOptions, useValue: options }]);
}

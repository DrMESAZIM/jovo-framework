import { OutputTemplate } from '@jovotech/output';
import { DeepPartial } from './index';
import { Jovo } from './Jovo';
import _merge from 'lodash.merge';

export type OutputConstructor<OUTPUT extends BaseOutput = BaseOutput> = new (
  jovo: Jovo,
  options?: DeepPartial<OUTPUT['options']>,
  ...args: unknown[]
) => OUTPUT;

export interface OutputOptions {
  [key: string]: unknown;
}

export abstract class BaseOutput<OPTIONS extends OutputOptions = OutputOptions> extends Jovo {
  readonly options: OPTIONS;

  constructor(jovo: Jovo, options?: DeepPartial<OPTIONS>) {
    super(jovo.$app, jovo.$handleRequest, jovo.$platform);
    // TODO: check if this causes any issues
    Object.assign(this, jovo);
    const defaultOptions = this.getDefaultOptions();
    this.options = options ? _merge(defaultOptions, options) : defaultOptions;
  }

  getDefaultOptions(): OPTIONS {
    return {} as OPTIONS;
  }

  abstract build(): OutputTemplate | Promise<OutputTemplate>;
}
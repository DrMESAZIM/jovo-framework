import { registerPlatformSpecificJovoReference } from '@jovotech/framework';
import { GoogleBusiness, GoogleBusinessConfig } from './GoogleBusiness';
import { GoogleBusinessBot } from './GoogleBusinessBot';

declare module '@jovotech/framework/dist/types/Extensible' {
  interface ExtensiblePluginConfig {
    GoogleBusiness?: GoogleBusinessConfig;
  }

  interface ExtensiblePlugins {
    GoogleBusiness?: GoogleBusiness;
  }
}

declare module '@jovotech/framework/dist/types/Jovo' {
  interface Jovo {
    $googleBusinessBot?: GoogleBusinessBot;
  }
}
registerPlatformSpecificJovoReference('$googleBusinessBot', GoogleBusinessBot);

export * from './GoogleBusiness';
export * from './GoogleBusinessRequest';
export * from './GoogleBusinessUser';
export * from './GoogleBusinessBot';
export type { GoogleBusinessResponse } from '@jovotech/output-googlebusiness';
export * from './interfaces';
export * from './constants';
import { BuiltInHandler } from '../enums';
import { HandlerMetadata } from '../metadata/HandlerMetadata';

export class RouteMatch {
  skip?: boolean;

  constructor(readonly metadata: HandlerMetadata, readonly path: string[]) {}

  get component(): string {
    return this.path.join('.');
  }

  get handler(): string {
    return this.metadata.propertyKey;
  }

  get score(): number {
    let score = 0;
    // make if higher ranked than any other condition option
    if (this.metadata.options?.if) {
      score += 1.5;
    }
    if (this.metadata.options?.platforms) {
      score++;
    }
    return score;
  }

  get subState(): string | undefined {
    return this.metadata.options?.subState;
  }

  get global(): boolean | undefined {
    return this.metadata.options?.global;
  }

  get prioritizedOverUnhandled(): boolean | undefined {
    return this.metadata.options?.prioritizedOverUnhandled;
  }

  get type(): string | undefined {
    return this.metadata.intentNames.includes(BuiltInHandler.Unhandled)
      ? BuiltInHandler.Unhandled
      : undefined;
  }

  toJSON(): Omit<RouteMatch, 'metadata' | 'path' | 'score' | 'toJSON'> {
    return {
      component: this.component,
      handler: this.handler,
      type: this.type,
      subState: this.subState,
      global: this.global,
      skip: this.skip,
      prioritizedOverUnhandled: this.prioritizedOverUnhandled,
    };
  }
}

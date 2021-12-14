import { JovoError } from '@jovotech/common';

// TODO improve => add context @m-ripper
export class DuplicateChildComponentsError extends JovoError {
  constructor(componentName: string, parentName: string) {
    super({
      message: `Duplicate component-name ${componentName} found in child-components of ${parentName}.`,
    });
  }
}

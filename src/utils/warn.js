// @flow

/**
 * This code is copied from: https://github.com/ReactTraining/react-router/blob/master/modules/routerWarning.js
 */

import warning from 'warning';

let warned = {};

export default function warn(
  falseToWarn: boolean,
  message: string,
  ...args: any[]
): void {
  // Only issue deprecation warnings once.
  if (!falseToWarn && message.indexOf('deprecated') !== -1) {
    if (warned[message]) {
      return;
    }
    warned[message] = true;
  }

  warning(falseToWarn, `[react-bootstrap-typeahead] ${message}`, ...args);
}

export function resetWarned() {
  warned = {};
}

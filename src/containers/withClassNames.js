// @flow

import cx from 'classnames';
import React, { type ComponentType } from 'react';

import { getDisplayName, isSizeLarge, isSizeSmall } from '../utils';
import type { Size } from '../types';

type Props = {
  bsSize: Size,
  className?: string,
  isInvalid?: boolean,
  isValid?: boolean,
};

function withClassNames(Component: ComponentType<*>) {
  // Use a class instead of function component to support refs.
  /* eslint-disable-next-line react/prefer-stateless-function */
  class WrappedComponent extends React.Component<* & Props> {
    static displayName = `withClassNames(${getDisplayName(Component)})`;

    render() {
      const { bsSize, className, isInvalid, isValid, ...props } = this.props;

      return (
        <Component
          {...props}
          className={cx('form-control', 'rbt-input', {
            'input-lg form-control-lg': isSizeLarge(bsSize),
            'input-sm form-control-sm': isSizeSmall(bsSize),
            'is-invalid': isInvalid,
            'is-valid': isValid,
          }, className)}
        />
      );
    }
  }

  return WrappedComponent;
}

export default withClassNames;

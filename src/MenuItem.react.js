import cx from 'classnames';
import {noop} from 'lodash';
import React from 'react';

import menuItemContainer from './containers/menuItemContainer';

class BaseMenuItem extends React.Component {
  render() {
    const {
      active,
      children,
      className,
      disabled,
      onClick,
      onMouseDown,
      ...props
    } = this.props;

    const conditionalClassNames = {
      'active': active,
      'disabled': disabled,
    };

    return (
      /* eslint-disable jsx-a11y/anchor-is-valid */
      <li
        {...props}
        className={cx(conditionalClassNames, className)}>
        <a
          className={cx('dropdown-item', conditionalClassNames)}
          href="#"
          onClick={this._handleClick}
          onMouseDown={onMouseDown}>
          {children}
        </a>
      </li>
      /* eslint-enable jsx-a11y/anchor-is-valid */
    );
  }

  _handleClick = (e) => {
    const {disabled, onClick} = this.props;

    e.preventDefault();
    !disabled && onClick(e);
  }
}

BaseMenuItem.defaultProps = {
  onClick: noop,
};

export {BaseMenuItem};
export default menuItemContainer(BaseMenuItem);

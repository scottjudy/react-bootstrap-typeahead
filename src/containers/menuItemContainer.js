// @flow

import React, { type ComponentType } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

import { type MenuContextType, withContext } from '../core/Context';
import { getDisplayName, getMenuItemId, preventInputBlur, scrollIntoViewIfNeeded } from '../utils';

import type { Option } from '../types';

const propTypes = {
  option: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ]).isRequired,
  position: PropTypes.number,
};

type Props = MenuContextType & {
  option: Option,
  position: number,
};

const menuItemContainer = (Component: ComponentType<*>) => {
  class WrappedMenuItem extends React.Component<* & Props> {
    static displayName = `menuItemContainer(${getDisplayName(Component)})`;

    componentDidMount() {
      this._maybeUpdateItem();
    }

    componentDidUpdate(prevProps, prevState) {
      this._maybeUpdateItem();
    }

    render() {
      const {
        activeIndex,
        id,
        isOnlyResult,
        label,
        onActiveItemChange,
        onInitialItemChange,
        onMenuItemClick,
        option,
        position,
        ...props
      } = this.props;

      const active = isOnlyResult || activeIndex === position;

      return (
        <Component
          {...props}
          active={active}
          aria-label={label}
          aria-selected={active}
          id={getMenuItemId(id, position)}
          onClick={this._handleClick}
          onMouseDown={preventInputBlur}
          role="option"
        />
      );
    }

    _handleClick = (e) => {
      const { onMenuItemClick, option, onClick } = this.props;

      onMenuItemClick(option, e);
      onClick && onClick(e);
    }

    _maybeUpdateItem = () => {
      const {
        activeIndex,
        onActiveItemChange,
        onInitialItemChange,
        option,
        position,
      } = this.props;

      if (position === 0) {
        onInitialItemChange(option);
      }

      if (position === activeIndex) {
        // Ensures that if the menu items exceed the bounds of the menu, the
        // menu will scroll up or down as the user hits the arrow keys.
        /* eslint-disable-next-line react/no-find-dom-node */
        scrollIntoViewIfNeeded(findDOMNode(this));
        onActiveItemChange(option);
      }
    }
  }

  WrappedMenuItem.propTypes = propTypes;

  return withContext(WrappedMenuItem, [
    'activeIndex',
    'id',
    'isOnlyResult',
    'menuId',
    'onActiveItemChange',
    'onInitialItemChange',
    'onMenuItemClick',
  ]);
};

export default menuItemContainer;

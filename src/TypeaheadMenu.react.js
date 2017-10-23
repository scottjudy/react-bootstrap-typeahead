import {pick} from 'lodash';
import Highlight from 'react-highlighter';
import React from 'react';
import PropTypes from 'prop-types';

import Menu from './Menu.react';
import MenuItem from './MenuItem.react';

import {getOptionLabel} from './utils/';

const Highlighter = (props) => (
  <Highlight
    {...props}
    className="rbt-highlight"
    matchClass="rbt-highlight-text"
  />
);

class TypeaheadMenu extends React.Component {
  render() {
    const menuProps = pick(this.props, [
      'align',
      'className',
      'dropup',
      'emptyLabel',
      'maxHeight',
      'onPaginate',
      'paginate',
      'paginationText',
      'style',
    ]);

    return (
      <Menu {...menuProps}>
        {this.props.options.map(this._renderMenuItem)}
      </Menu>
    );
  }

  _renderMenuItem = (option, idx) => {
    const {
      labelKey,
      newSelectionPrefix,
      renderMenuItemChildren,
      text,
    } = this.props;

    const menuItemProps = {
      disabled: option.disabled,
      key: idx,
      option,
      position: idx,
    };

    if (option.customOption) {
      return (
        <MenuItem {...menuItemProps}>
          {newSelectionPrefix}
          <Highlighter search={text}>
            {option[labelKey]}
          </Highlighter>
        </MenuItem>
      );
    }

    return renderMenuItemChildren ?
      <MenuItem {...menuItemProps}>
        {renderMenuItemChildren(option, this.props, idx)}
      </MenuItem> :
      <MenuItem {...menuItemProps}>
        <Highlighter search={text}>
          {getOptionLabel(option, labelKey)}
        </Highlighter>
      </MenuItem>;
  }
}

/**
 * In addition to the propTypes below, the following props are automatically
 * passed down by `Typeahead`:
 *
 *  - labelKey
 *  - onPaginate
 *  - options
 *  - paginate
 *  - text
 */
TypeaheadMenu.propTypes = {
  /**
   * Provides the ability to specify a prefix before the user-entered text to
   * indicate that the selection will be new. No-op unless `allowNew={true}`.
   */
  newSelectionPrefix: PropTypes.string,
  /**
   * Provides a hook for customized rendering of menu item contents.
   */
  renderMenuItemChildren: PropTypes.func,
};

TypeaheadMenu.defaultProps = {
  newSelectionPrefix: 'New selection: ',
};


export default TypeaheadMenu;

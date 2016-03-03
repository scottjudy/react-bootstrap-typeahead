'use strict';

import React from 'react';
import {findDOMNode} from 'react-dom';

import cx from 'classnames';
import keyCode from './keyCode';
import onClickOutside from 'react-onclickoutside';

require('../css/Token.css');

/**
 * Token
 *
 * Individual token component, generally displayed within the TokenizerInput
 * component, but can also be rendered on its own.
 */
const Token = React.createClass({
  displayName: 'Token',

  mixins: [onClickOutside],

  propTypes: {
    /**
     * Handler for removing/deleting the token. If not defined, the token will
     * be rendered in a read-only state.
     */
    onRemove: React.PropTypes.func,
  },

  getInitialState() {
    return {
      selected: false,
    };
  },

  render() {
    return this.props.onRemove ?
      this._renderRemoveableToken() :
      this._renderToken();
  },

  _renderRemoveableToken() {
    return (
      <button
        className={cx('token', 'token-removeable', {
          'token-selected': this.state.selected,
        }, this.props.className)}
        onBlur={this._handleBlur}
        onClick={this._handleSelect}
        onFocus={this._handleSelect}
        onKeyDown={this._handleKeyDown}
        tabIndex={0}>
        {this.props.children}
        <span className="token-close-button" onClick={this._handleRemove}>
          &times;
        </span>
      </button>
    );
  },

  _renderToken() {
    let classnames = cx('token', this.props.className);

    if (this.props.href) {
      return (
        <a className={classnames} href={this.props.href}>
          {this.props.children}
        </a>
      );
    }

    return (
      <div className={classnames}>
        {this.props.children}
      </div>
    );
  },

  _handleBlur(e) {
    findDOMNode(this).blur();
    this.setState({selected: false});
  },

  _handleKeyDown(e) {
    switch (e.keyCode) {
      case keyCode.BACKSPACE:
        if (this.state.selected) {
          // Prevent backspace keypress from triggering the browser "back"
          // action.
          e.preventDefault();
          this._handleRemove();
        }
        break;
    }
  },

  /**
   * From `onClickOutside` mixin.
   */
  handleClickOutside(e) {
    this._handleBlur();
  },

  _handleRemove(e) {
    this.props.onRemove && this.props.onRemove();
  },

  _handleSelect(e) {
    e.stopPropagation();
    this.setState({selected: true});
  },
});

export default Token;

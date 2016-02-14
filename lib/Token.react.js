'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _keyCode = require('./keyCode');

var _keyCode2 = _interopRequireDefault(_keyCode);

var _reactOnclickoutside = require('react-onclickoutside');

var _reactOnclickoutside2 = _interopRequireDefault(_reactOnclickoutside);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('../css/Token.css');

/**
 * Token
 *
 * Individual token component, generally displayed within the TokenizerInput
 * component, but can also be rendered on its own.
 */
var Token = _react2.default.createClass({
  displayName: 'Token',

  mixins: [_reactOnclickoutside2.default],

  propTypes: {
    /**
     * Handler for removing/deleting the token. If not defined, the token will
     * be rendered in a read-only state.
     */
    onRemove: _react2.default.PropTypes.func
  },

  getInitialState: function getInitialState() {
    return {
      selected: false
    };
  },

  render: function render() {
    return this.props.onRemove ? this._renderRemoveableToken() : this._renderToken();
  },

  _renderRemoveableToken: function _renderRemoveableToken() {
    return _react2.default.createElement(
      'button',
      {
        className: (0, _classnames2.default)('token', 'token-removeable', {
          'token-selected': this.state.selected
        }, this.props.className),
        onBlur: this._handleBlur,
        onClick: this._handleSelect,
        onFocus: this._handleSelect,
        onKeyDown: this._handleKeyDown,
        tabIndex: 0 },
      this.props.children,
      _react2.default.createElement(
        'span',
        { className: 'token-close-button', onClick: this._handleRemove },
        '×'
      )
    );
  },

  _renderToken: function _renderToken() {
    var classnames = (0, _classnames2.default)('token', this.props.className);

    if (this.props.href) {
      return _react2.default.createElement(
        'a',
        { className: classnames, href: this.props.href },
        this.props.children
      );
    }

    return _react2.default.createElement(
      'div',
      { className: classnames },
      this.props.children
    );
  },

  _handleBlur: function _handleBlur(e) {
    (0, _reactDom.findDOMNode)(this).blur();
    this.setState({ selected: false });
  },

  _handleKeyDown: function _handleKeyDown(e) {
    switch (e.keyCode) {
      case _keyCode2.default.BACKSPACE:
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
  handleClickOutside: function handleClickOutside(e) {
    this._handleBlur();
  },

  _handleRemove: function _handleRemove(e) {
    this.props.onRemove && this.props.onRemove();
  },

  _handleSelect: function _handleSelect(e) {
    e.stopPropagation();
    this.setState({ selected: true });
  }
});

module.exports = Token;
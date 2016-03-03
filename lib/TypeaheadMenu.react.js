'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PropTypes = _react2.default.PropTypes;

var Menu = _react2.default.createClass({
  displayName: 'Menu',

  render: function render() {
    return _react2.default.createElement(
      'ul',
      _extends({}, this.props, {
        className: (0, _classnames2.default)('dropdown-menu', this.props.className) }),
      this.props.children
    );
  }
});

var MenuItem = _react2.default.createClass({
  displayName: 'MenuItem',

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (nextProps.active) {
      (0, _reactDom.findDOMNode)(this).firstChild.focus();
    }
  },
  render: function render() {
    return _react2.default.createElement(
      'li',
      {
        className: (0, _classnames2.default)({
          'active': this.props.active,
          'disabled': this.props.disabled
        }) },
      _react2.default.createElement(
        'a',
        { href: '#', onClick: this._handleClick },
        this.props.children
      )
    );
  },
  _handleClick: function _handleClick(e) {
    e.preventDefault();
    this.props.onClick && this.props.onClick();
  }
});

var TypeaheadMenu = _react2.default.createClass({
  displayName: 'TypeaheadMenu',

  propTypes: {
    activeIndex: PropTypes.number,
    emptyLabel: PropTypes.string,
    labelKey: PropTypes.string.isRequired,
    maxHeight: PropTypes.number,
    options: PropTypes.array
  },

  getDefaultProps: function getDefaultProps() {
    return {
      emptyLabel: 'No matches found.',
      maxHeight: 300
    };
  },
  render: function render() {
    var _props = this.props;
    var maxHeight = _props.maxHeight;
    var options = _props.options;

    var items = options.length ? options.map(this._renderDropdownItem) : _react2.default.createElement(
      MenuItem,
      { disabled: true },
      this.props.emptyLabel
    );

    return _react2.default.createElement(
      Menu,
      {
        style: {
          maxHeight: maxHeight + 'px',
          right: 0
        } },
      items
    );
  },
  _renderDropdownItem: function _renderDropdownItem(option, idx) {
    var _props2 = this.props;
    var activeIndex = _props2.activeIndex;
    var onClick = _props2.onClick;

    return _react2.default.createElement(
      MenuItem,
      {
        active: idx === activeIndex,
        key: idx,
        onClick: onClick.bind(null, option) },
      option[this.props.labelKey]
    );
  }
});

exports.default = TypeaheadMenu;
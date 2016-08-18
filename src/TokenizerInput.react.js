'use strict';

import AutosizeInput from 'react-input-autosize';
import React, {PropTypes} from 'react';
import Token from './Token.react';

import cx from 'classnames';
import getOptionLabel from './getOptionLabel';
import {findDOMNode} from 'react-dom';

import {BACKSPACE} from './keyCode';

/**
 * TokenizerInput
 *
 * Accepts multiple selections from a Typeahead component and renders them as
 * tokens within an input.
 */
const TokenizerInput = React.createClass({
  displayName: 'TokenizerInput',

  propTypes: {
    disabled: PropTypes.bool,
    labelKey: PropTypes.string,
    placeholder: PropTypes.string,
    selected: PropTypes.array,
  },

  getInitialState() {
    return {
      isFocused: false,
    };
  },

  render() {
    const {disabled, placeholder, selected, text} = this.props;

    return (
      <div
        className={cx(
          'bootstrap-tokenizer',
          'clearfix',
          'form-control',
          {'focus': this.state.isFocused}
        )}
        disabled={disabled}
        onClick={this._handleInputFocus}
        onFocus={this._handleInputFocus}
        style={{
          cursor: 'text',
          height: 'auto',
        }}
        tabIndex={-1}>
        {selected.map(this._renderToken)}
        <AutosizeInput
          className="bootstrap-tokenizer-input"
          disabled={disabled}
          inputStyle={{
            backgroundColor: 'inherit',
            border: 0,
            boxShadow: 'none',
            cursor: 'inherit',
            outline: 'none',
            padding: 0,
          }}
          onBlur={this._handleBlur}
          onChange={this._handleChange}
          onFocus={this.props.onFocus}
          onKeyDown={this._handleKeydown}
          placeholder={selected.length ? null : placeholder}
          ref="input"
          type="text"
          value={text}
        />
      </div>
    );
  },

  blur() {
    this.refs.input.blur();
  },

  focus() {
    this._handleInputFocus();
  },

  _renderToken(option, idx) {
    const {disabled, labelKey, onRemove} = this.props;

    return (
      <Token
        disabled={disabled}
        key={idx}
        onRemove={() => onRemove(option)}>
        {getOptionLabel(option, labelKey)}
      </Token>
    );
  },

  _handleBlur(e) {
    this.setState({isFocused: false});
    this.props.onBlur(e);
  },

  _handleChange(e) {
    this.props.onChange(e.target.value);
  },

  _handleKeydown(e) {
    switch (e.keyCode) {
      case BACKSPACE:
        let inputNode = findDOMNode(this.refs.input);
        if (
          inputNode &&
          inputNode.contains(document.activeElement) &&
          !this.props.text
        ) {
          // If the input is selected and there is no text, select the last
          // token when the user hits backspace.
          let sibling = inputNode.previousSibling;
          sibling && sibling.focus();
        }
        break;
    }

    this.props.onKeyDown(e);
  },

  _handleInputFocus(e) {
    if (this.props.disabled) {
      e.target.blur();
      return;
    }

    // If the user clicks anywhere inside the tokenizer besides a token,
    // focus the input.
    this.refs.input.focus();
    this.setState({isFocused: true});
  },
});

export default TokenizerInput;

'use strict';

import React, {PropTypes} from 'react';

import cx from 'classnames';
import getHintText from './getHintText';
import getInputText from './getInputText';
import {head} from 'lodash';
import {RIGHT, TAB} from './keyCode';

/**
 * TypeaheadInput
 *
 * Handles a single selection from the Typeahead component.
 */
const TypeaheadInput = React.createClass({
  displayName: 'TypeaheadInput',

  propTypes: {
    disabled: PropTypes.bool,
    labelKey: PropTypes.string,
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    options: PropTypes.array,
    placeholder: PropTypes.string,
    selected: PropTypes.array,
    text: PropTypes.string,
  },

  getInitialState() {
    return {
      isFocused: false,
    };
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.props.activeIndex !== prevProps.activeIndex) {
      const inputText = getInputText(this.props);
      this.refs.input.selectionStart = inputText.length;
    }
  },

  render() {
    const {
      className,
      disabled,
      name,
      onFocus,
      placeholder,
      selected,
    } = this.props;

    const inputProps = {disabled, name, onFocus, placeholder};

    return (
      <div
        className={cx('bootstrap-typeahead-input', className)}
        onClick={this._handleInputFocus}
        onFocus={this._handleInputFocus}
        style={{outline: 'none'}}
        tabIndex={-1}>
        <input
          {...inputProps}
          className={cx('bootstrap-typeahead-input-main', 'form-control', {
            'has-selection': !!selected.length,
          })}
          onBlur={this._handleBlur}
          onChange={this._handleChange}
          onKeyDown={this._handleKeydown}
          ref="input"
          style={{
            backgroundColor: !disabled && 'transparent',
            display: 'block',
            position: 'relative',
            zIndex: 1,
          }}
          type="text"
          value={getInputText(this.props)}
        />
        <input
          className="bootstrap-typeahead-input-hint form-control"
          style={{
            borderColor: 'transparent',
            bottom: 0,
            boxShadow: 'none',
            display: 'block',
            opacity: 0.6,
            position: 'absolute',
            top: 0,
            width: '100%',
            zIndex: 0,
          }}
          tabIndex={-1}
          type="text"
          value={getHintText(this.props, this.state.isFocused)}
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

  _handleBlur(e) {
    this.setState({isFocused: false});
    this.props.onBlur(e);
  },

  _handleChange(e) {
    // Clear any selections when text is entered.
    const {onRemove, selected} = this.props;
    !!selected.length && onRemove(head(selected));

    this.props.onChange(e.target.value);
  },

  /**
   * If the containing parent div is focused or clicked, focus the input.
   */
  _handleInputFocus(e) {
    this.setState({isFocused: true});
    this.refs.input.focus();
  },

  _handleKeydown(e) {
    const {activeIndex, options, onAdd, selected, text} = this.props;

    switch (e.keyCode) {
      case RIGHT:
      case TAB:
        const cursorPos = this.refs.input.selectionStart;
        const hasHintText = !!getHintText(this.props, this.state.isFocused);

        // Autocomplete the selection if all of the following are true:
        if (
          // There's a hint or a menu item is highlighted.
          (hasHintText || activeIndex !== -1) &&
          // There's no current selection.
          !selected.length &&
          // The input cursor is at the end of the text string when the user
          // hits the right arrow key.
          !(e.keyCode === RIGHT && cursorPos !== text.length)
        ) {
          e.preventDefault();

          const selectedOption = hasHintText ?
            head(options) :
            options[activeIndex];

          onAdd && onAdd(selectedOption);
        }
        break;
    }

    this.props.onKeyDown(e);
  },
});

export default TypeaheadInput;

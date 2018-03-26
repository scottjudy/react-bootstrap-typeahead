import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import AutosizeInput from './AutosizeInput.react';

const STYLES = {
  backgroundColor: 'transparent',
  border: 0,
  boxShadow: 'none',
  cursor: 'inherit',
  outline: 'none',
  padding: 0,
};

// Shim around a standard input to normalize how props are applied.
class StandardInput extends React.Component {
  render() {
    const {inputClassName, inputStyle, ...otherProps} = this.props;

    return (
      <input
        {...otherProps}
        className={inputClassName}
        ref={(input) => this._input = input}
        style={{
          ...STYLES,
          ...inputStyle,
          width: '100%',
        }}
      />
    );
  }

  // Mirror the AutosizeInput API for consistency.
  getInput = () => {
    return this._input;
  }
}

class HintedInput extends React.Component {
  render() {
    return (
      <div
        style={{
          display: this.props.multiple ? 'inline-block' : 'block',
          position: 'relative',
        }}>
        {this._renderInput()}
        {this._renderHint()}
      </div>
    );
  }

  _renderInput = () => {
    const {className, inputRef, multiple, ...props} = this.props;

    // Render a standard input in the single-select case to address #278.
    const InputComponent = multiple ? AutosizeInput : StandardInput;

    return (
      <InputComponent
        {...props}
        inputClassName={cx('rbt-input-main', className)}
        inputStyle={STYLES}
        ref={inputRef}
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      />
    );
  }

  _renderHint = () => {
    // TODO: Support hinting for multi-selection.
    return this.props.multiple ?
      null :
      <div
        aria-hidden
        className="rbt-input-hint"
        style={{
          ...STYLES,
          bottom: 0,
          color: 'rgba(0, 0, 0, 0.35)',
          display: 'block',
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          zIndex: 0,
        }}
        tabIndex={-1}>
        {this.context.hintText}
      </div>;
  }
}

HintedInput.contextTypes = {
  hintText: PropTypes.string.isRequired,
};

HintedInput.defaultProps = {
  type: 'text',
};

HintedInput.propTypes = {
  type: PropTypes.string,
};

export default HintedInput;

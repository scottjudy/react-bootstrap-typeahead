import getInputProps from './getInputProps';
import { noop } from '../tests/helpers';

const baseProps = {
  activeIndex: -1,
  id: 'id',
  isFocused: false,
  isMenuShown: false,
  multiple: false,
};

const baseMultiProps = {
  ...baseProps,
  multiple: true,
  onRemove: noop,
};

const baseReceivedProps = {
  'aria-activedescendant': undefined,
  'aria-autocomplete': 'both',
  'aria-expanded': false,
  'aria-haspopup': 'listbox',
  'aria-owns': undefined,
  autoComplete: 'off',
  className: '',
  onClick: undefined,
  onFocus: undefined,
  placeholder: undefined,
  role: 'combobox',
  type: 'text',
};

const baseReceivedMultiProps = {
  ...baseReceivedProps,
  'aria-autocomplete': 'list',
  'aria-expanded': undefined,
  inputClassName: undefined,
  onRemove: noop,
  role: undefined,
};

describe('getInputProps', () => {
  it('receives single-select input props', () => {
    let inputProps = getInputProps(baseProps)();

    expect(inputProps).toEqual(baseReceivedProps);

    inputProps = getInputProps({
      ...baseProps,
      activeIndex: 0,
      isFocused: true,
      isMenuShown: true,
    })({
      className: 'foo',
    });

    expect(inputProps).toEqual({
      ...baseReceivedProps,
      'aria-activedescendant': 'id-item-0',
      'aria-expanded': true,
      'aria-owns': 'id',
      className: 'foo focus',
    });
  });

  it('receives multi-select input props', () => {
    let inputProps = getInputProps(baseMultiProps)();

    expect(inputProps).toEqual(baseReceivedMultiProps);

    inputProps = getInputProps({
      ...baseMultiProps,
      isFocused: true,
    })({
      className: 'foo',
    });

    expect(inputProps).toEqual({
      ...baseReceivedMultiProps,
      className: 'focus',
      inputClassName: 'foo',
    });
  });
});

import { mount } from 'enzyme';
import { head, noop } from 'lodash';
import React from 'react';

import Token from '../../components/Token';
import TypeaheadInputMulti from '../../components/TypeaheadInputMulti';

import options from '../data';

import {
  focus,
  getFormControl,
  getHint,
  getInput,
  getTokens,
  isFocused,
  keyDown,
  simulateKeyDown,
  TestProvider,
} from '../helpers';

import { BACKSPACE, RETURN, TAB } from '../../constants';

describe('<TypeaheadInputMulti>', () => {
  let selected, shouldSelectHint, wrapper;

  beforeEach(() => {
    selected = options.slice(1, 4);
    shouldSelectHint = jest.fn();
    wrapper = mount(
      <TestProvider multiple onKeyDown={noop} selected={selected}>
        {({ getInputProps, state }) => (
          <TypeaheadInputMulti
            {...getInputProps()}
            selected={selected}
            shouldSelectHint={shouldSelectHint}>
            {selected.map((option, idx) => (
              <Token key={option.name} option={option} onRemove={noop}>
                {option.name}
              </Token>
            ))}
          </TypeaheadInputMulti>
        )}
      </TestProvider>
    );
  });

  it('renders a multi-select input', () => {
    const input = getFormControl(wrapper);

    expect(input.length).toBe(1);
    expect(input.hasClass('rbt-input')).toBe(true);
    expect(input.hasClass('rbt-input-multi')).toBe(true);
  });

  it('displays the selected text', () => {
    const text = 'foo';
    wrapper.setProps({ text });
    expect(getInput(wrapper).prop('value')).toBe(text);
  });

  it('renders a multi-select input with tokens', () => {
    expect(getTokens(wrapper).length).toBe(3);
  });

  it('displays a hint and calls `shouldSelectHint`', () => {
    const initialItem = head(options);

    wrapper.setProps({
      initialItem,
      isFocused: true,
      isMenuShown: true,
      text: 'Al',
    });

    expect(getHint(wrapper)).toBe(initialItem.name);

    // No need to test the logic for `shouldSelectHint` here; just make sure
    // it's passed through to the `Hint` component and called.
    keyDown(wrapper, TAB);
    expect(shouldSelectHint).toHaveBeenCalledTimes(1);
  });

  // Disable tests that check focus since jsdom no longer supports
  // `document.activeElement`.
  xit('does not focus a disabled input', () => {
    expect(isFocused(getInput(wrapper))).toBe(false);

    wrapper.setProps({ disabled: true });
    wrapper.simulate('click');

    expect(isFocused(getInput(wrapper))).toBe(false);

    wrapper.setProps({ disabled: false });
    wrapper.simulate('click');

    expect(isFocused(getInput(wrapper))).toBe(true);
  });

  describe('keydown handler', () => {
    let onKeyDown;

    beforeEach(() => {
      onKeyDown = jest.fn();
      wrapper.setProps({
        onKeyDown,
      });
    });

    it('calls the keydown handler', () => {
      simulateKeyDown(wrapper, RETURN);
      expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    // Disable tests that check focus since jsdom no longer supports
    // `document.activeElement`.
    xit('focuses the last token', () => {
      const input = getInput(wrapper);

      focus(wrapper);
      expect(isFocused(input)).toBe(true);

      simulateKeyDown(wrapper, BACKSPACE);

      expect(isFocused(getTokens(wrapper).last())).toBe(true);
      expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    // Disable tests that check focus since jsdom no longer supports
    // `document.activeElement`.
    xit('does not focus the last token when the input has a value', () => {
      wrapper.setProps({
        text: 'foo',
      });

      focus(wrapper);
      simulateKeyDown(wrapper, BACKSPACE);

      expect(isFocused(getInput(wrapper))).toBe(true);
      expect(onKeyDown).toHaveBeenCalledTimes(1);
    });
  });
});

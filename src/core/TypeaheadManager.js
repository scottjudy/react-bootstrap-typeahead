// @flow

import React, { useCallback, useEffect, useRef } from 'react';

import { TypeaheadContext } from './Context';
import { getHintText, getInputProps, getInputText, getIsOnlyResult, pick } from '../utils';
import { RETURN } from '../constants';

import type { TypeaheadContextType } from './Context';
import type { TypeaheadManagerProps } from '../types';

const inputPropKeys = [
  'activeIndex',
  'disabled',
  'id',
  'inputRef',
  'isFocused',
  'isMenuShown',
  'multiple',
  'onBlur',
  'onChange',
  'onFocus',
  'onKeyDown',
  'placeholder',
];

const propKeys = [
  'activeIndex',
  'hideMenu',
  'isMenuShown',
  'labelKey',
  'onClear',
  'onHide',
  'onRemove',
  'results',
  'selected',
  'text',
  'toggleMenu',
];

const contextKeys = [
  'activeIndex',
  'id',
  'initialItem',
  'inputNode',
  'onActiveItemChange',
  'onAdd',
  'onInitialItemChange',
  'onMenuItemClick',
  'selectHintOnEnter',
  'setItem',
];

function usePrevious(value) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const TypeaheadManager = (props: TypeaheadManagerProps) => {
  const {
    allowNew,
    children,
    initialItem,
    isMenuShown,
    onAdd,
    onInitialItemChange,
    onKeyDown,
    onMenuToggle,
    results,
  } = props;

  const prevProps = usePrevious(props);

  useEffect(() => {
    // Clear the initial item when there are no results.
    if (!(allowNew || results.length)) {
      onInitialItemChange(null);
    }
  });

  useEffect(() => {
    if (prevProps && prevProps.isMenuShown !== isMenuShown) {
      onMenuToggle(isMenuShown);
    }
  });

  const handleKeyDown = useCallback(
    (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
      switch (e.keyCode) {
        case RETURN:
          if (initialItem && getIsOnlyResult(props)) {
            onAdd(initialItem);
          }
          break;
        default:
          break;
      }
      onKeyDown(e);
    }
  );

  const value = getInputText(props);

  const childProps = {
    ...pick(props, propKeys),
    getInputProps: getInputProps({
      ...pick(props, inputPropKeys),
      onKeyDown: handleKeyDown,
      value,
    }),
  };

  const contextValue: TypeaheadContextType = {
    ...pick(props, contextKeys),
    hintText: getHintText(props),
    isOnlyResult: getIsOnlyResult(props),
    value,
  };

  return (
    <TypeaheadContext.Provider value={contextValue}>
      {children(childProps)}
    </TypeaheadContext.Provider>
  );
};

export default TypeaheadManager;

import PropTypes from 'prop-types';
import React, {
  ComponentType,
  FocusEvent,
  FocusEventHandler,
  HTMLProps,
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
  useState,
} from 'react';
import { useRootClose } from 'react-overlays';

import { getDisplayName, isFunction } from '../utils';

import { optionType } from '../propTypes';
import { Option, OptionHandler, RefElement } from '../types';

export interface UseTokenProps<T> extends Omit<HTMLProps<T>, 'onBlur'> {
  // `onBlur` is typed more generically because it's passed to `useRootClose`,
  // which passes a generic event to the callback.
  onBlur?: (event: Event) => void;
  onClick?: MouseEventHandler<T>;
  onFocus?: FocusEventHandler<T>;
  onRemove?: OptionHandler;
  option: Option;
}

const propTypes = {
  onBlur: PropTypes.func,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  onRemove: PropTypes.func,
  option: optionType.isRequired,
};

export function useToken<T extends HTMLElement>({
  onBlur,
  onClick,
  onFocus,
  onRemove,
  option,
  ...props
}: UseTokenProps<T>) {
  const [active, setActive] = useState<boolean>(false);
  const [rootElement, attachRef] = useState<RefElement<T>>(null);

  const handleBlur = (e: Event) => {
    e.stopPropagation();
    setActive(false);
    onBlur && onBlur(e);
  };

  const handleClick = (e: MouseEvent<T>) => {
    e.stopPropagation();
    setActive(true);
    onClick && onClick(e);
  };

  const handleFocus = (e: FocusEvent<T>) => {
    e.stopPropagation();
    setActive(true);
    onFocus && onFocus(e);
  };

  const handleRemove = () => {
    onRemove && onRemove(option);
  };

  const handleKeyDown = (e: KeyboardEvent<T>) => {
    switch (e.key) {
      case 'Backspace':
        if (active) {
          // Prevent backspace keypress from triggering the browser "back"
          // action.
          e.preventDefault();
          handleRemove();
        }
        break;
      default:
        break;
    }
  };

  useRootClose(rootElement, handleBlur, {
    ...props,
    disabled: !active,
  });

  return {
    active,
    onBlur: handleBlur,
    onClick: handleClick,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
    onRemove: isFunction(onRemove) ? handleRemove : undefined,
    ref: attachRef,
  };
}

/* istanbul ignore next */
export function withToken<T extends UseTokenProps<HTMLElement>>(
  Component: ComponentType<T>
) {
  const displayName = `withToken(${getDisplayName(Component)})`;

  const WrappedToken = (props: T) => (
    <Component {...props} {...useToken(props)} />
  );

  WrappedToken.displayName = displayName;
  WrappedToken.propTypes = propTypes;

  return WrappedToken;
}

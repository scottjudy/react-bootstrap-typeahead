// @flow

/* eslint-disable no-use-before-define */

import type { Node } from 'react';

import { ALIGN, SIZE } from './constants';

export type EventHandler<T> = (SyntheticEvent<T>) => void;
export type Id = number | string;
export type KeyboardEventHandler<T> = (SyntheticKeyboardEvent<T>) => void;
export type Option = string | { [string]: any };
export type OptionHandler = (Option) => void;
export type LabelKey = string | (Option) => string;
export type Size = $Values<typeof SIZE>;
export type Style = { [string]: any };
export type ReferenceElement = HTMLElement;

export type Ref<T> = null | T;
export type CreateRef<T> = { current: Ref<T> };
export type RefHandler<T> = (Ref<T>) => mixed;
export type InputRefHandler = RefHandler<HTMLInputElement>;

export type InputProps = {
  autoComplete: string,
  className?: string,
  disabled?: boolean,
  inputClassName?: string,
  inputRef: InputRefHandler,
  onBlur: EventHandler<HTMLInputElement>,
  onChange: EventHandler<HTMLInputElement>,
  onClick: EventHandler<HTMLInputElement>,
  onFocus: EventHandler<HTMLInputElement>,
  onKeyDown: KeyboardEventHandler<HTMLInputElement>,
  placeholder?: string,
  tabIndex: ?number,
  type: string,
  value: string,
};

export type OverlayProps = {
  align: $Values<typeof ALIGN>,
  children: (MenuProps) => Node,
  dropup: boolean,
  flip: boolean,
  isMenuShown: boolean,
  positionFixed: boolean,
  referenceElement: ?ReferenceElement,
};

export type MenuProps = {
  innerRef: RefHandler<HTMLElement>,
  inputHeight: number,
  scheduleUpdate: () => void,
  style: Style,
};

export type TypeaheadProps = {
  allowNew: boolean | (Option[], TypeaheadPropsAndState) => boolean,
  autoFocus: boolean,
  caseSensitive: boolean,
  children: Function,
  defaultInputValue: string,
  defaultOpen: boolean,
  defaultSelected: Option[],
  filterBy: string[] | (Option, TypeaheadPropsAndState) => void,
  highlightOnlyResult: boolean,
  id?: Id,
  ignoreDiacritics: boolean,
  labelKey: LabelKey,
  maxResults: number,
  minLength: number,
  multiple: boolean,
  onBlur: EventHandler<HTMLInputElement>,
  onFocus: EventHandler<HTMLInputElement>,
  onInputChange: (string, SyntheticEvent<HTMLInputElement>) => void,
  onKeyDown: KeyboardEventHandler<HTMLInputElement>,
  onMenuToggle: (boolean) => void,
  onPaginate: (SyntheticEvent<HTMLElement>, number) => void,
  open?: boolean,
  options: Option[],
  paginate: boolean,
  selectHintOnEnter: boolean,
};

export type TypeaheadState = {|
  activeIndex: number,
  activeItem: ?Option,
  initialItem: ?Option,
  isFocused: boolean,
  selected: Option[],
  showMenu: boolean,
  shownResults: number,
  text: string,
|};

export type TypeaheadPropsAndState = {
  ...TypeaheadProps,
  ...TypeaheadState,
};

export type TypeaheadManagerChildrenProps = {
  getInputProps: (TypeaheadProps) => InputProps,
  getOverlayProps: (TypeaheadProps) => OverlayProps,
  state: TypeaheadManagerProps,
};

export type TypeaheadManagerProps = TypeaheadPropsAndState & {
  children: (TypeaheadManagerChildrenProps) => Node,
  getReferenceElement: RefHandler<ReferenceElement>,
  inputRef: InputRefHandler,
  isMenuShown: boolean,
  onActiveItemChange: OptionHandler,
  onAdd: OptionHandler,
  onChange: EventHandler<HTMLInputElement>,
  onClear: () => void,
  onInitialItemChange: (?Option) => void,
  onMenuItemClick: (Option, SyntheticEvent<HTMLElement>) => void,
  onRemove: OptionHandler,
  placeholder?: string,
  referenceElement: ?ReferenceElement,
  results: Option[],
};

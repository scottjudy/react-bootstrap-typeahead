import { createContext, useContext } from 'react';

import { noop } from '../utils';
import { Id, Option, OptionHandler, SelectEvent } from '../types';

export interface TypeaheadContextType {
  activeIndex: number;
  hintText: string;
  id: Id;
  initialItem: Option | null;
  inputNode: HTMLInputElement | null;
  isOnlyResult: boolean;
  onActiveItemChange: OptionHandler;
  onAdd: OptionHandler;
  onInitialItemChange: (option?: Option) => void;
  onMenuItemClick: (option: Option, event: SelectEvent<HTMLElement>) => void;
  selectHintOnEnter?: boolean;
  setItem: (option: Option, position: number) => void;
}

export const TypeaheadContext = createContext<TypeaheadContextType>({
  activeIndex: -1,
  hintText: '',
  id: '',
  initialItem: null,
  inputNode: null,
  isOnlyResult: false,
  onActiveItemChange: noop,
  onAdd: noop,
  onInitialItemChange: noop,
  onMenuItemClick: noop,
  selectHintOnEnter: undefined,
  setItem: noop,
});

export const useTypeaheadContext = () => useContext(TypeaheadContext);

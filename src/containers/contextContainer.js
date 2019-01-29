import {pick} from 'lodash';
import React from 'react';
import {polyfill} from 'react-lifecycles-compat';

import TypeaheadContext from '../TypeaheadContext';
import {getHintText, getIsOnlyResult} from '../utils';
import {RETURN} from '../constants';

function contextContainer(Typeahead) {
  class WrappedTypeahead extends React.Component {
    componentDidUpdate(prevProps, prevState) {
      const {allowNew, onInitialItemChange, results} = this.props;

      // Clear the initial item when there are no results.
      if (!(allowNew || results.length)) {
        onInitialItemChange(null);
      }
    }

    render() {
      const contextValues = pick(this.props, [
        'activeIndex',
        'initialItem',
        'onActiveItemChange',
        'onAdd',
        'onInitialItemChange',
        'onMenuItemClick',
        'selectHintOnEnter',
      ]);

      return (
        <TypeaheadContext.Provider
          value={{
            ...contextValues,
            hintText: getHintText(this.props),
            isOnlyResult: getIsOnlyResult(this.props),
          }}>
          <Typeahead
            {...this.props}
            onKeyDown={this._handleKeyDown}
          />
        </TypeaheadContext.Provider>
      );
    }

    _handleKeyDown = (e) => {
      const {initialItem, onKeyDown, onAdd} = this.props;

      switch (e.keyCode) {
        case RETURN:
          if (getIsOnlyResult(this.props)) {
            onAdd(initialItem);
          }
          break;
        default:
          break;
      }

      onKeyDown(e);
    }
  }

  polyfill(WrappedTypeahead);

  return WrappedTypeahead;
}

export default contextContainer;

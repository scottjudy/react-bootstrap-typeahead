import React from 'react';

import {DOWN, ESC, RETURN, TAB, UP} from '../constants/keyCode';

/**
 * Thin layer between top-level container and rendering layer. Needed for
 * updates due to actions that are neither prop nor state changes.
 */
function typeaheadInnerContainer(Typeahead) {
  class WrappedTypeahead extends React.Component {
    componentWillReceiveProps(nextProps) {
      const {
        allowNew,
        onInitialItemChange,
        onResultsChange,
        results,
      } = nextProps;

      // Clear the initial item when there are no results.
      if (!(allowNew || results.length)) {
        onInitialItemChange(null);
      }

      if (results.length !== this.props.results.length) {
        onResultsChange(results);
      }
    }

    render() {
      return (
        <Typeahead
          {...this.props}
          onKeyDown={this._handleKeyDown}
        />
      );
    }

    _handleKeyDown = (e) => {
      const {
        activeItem,
        initialItem,
        isMenuShown,
        isOnlyResult,
        onActiveIndexChange,
        onActiveItemChange,
        onHide,
        onKeyDown,
        onSelectionAdd,
        results,
        submitFormOnEnter,
      } = this.props;

      switch (e.keyCode) {
        case UP:
        case DOWN:
          // Don't cycle through the options if the menu is hidden.
          if (!isMenuShown) {
            break;
          }

          let {activeIndex} = this.props;

          // Prevents input cursor from going to the beginning when pressing up.
          e.preventDefault();

          // Increment or decrement index based on user keystroke.
          activeIndex += e.keyCode === UP ? -1 : 1;

          // Skip over any disabled options.
          while (results[activeIndex] && results[activeIndex].disabled) {
            activeIndex += e.keyCode === UP ? -1 : 1;
          }

          // If we've reached the end, go back to the beginning or vice-versa.
          if (activeIndex === results.length) {
            activeIndex = -1;
          } else if (activeIndex === -2) {
            activeIndex = results.length - 1;
          }

          onActiveIndexChange(activeIndex);

          if (activeIndex === -1) {
            // Reset the active item if there is no active index.
            onActiveItemChange(null);
          }
          break;
        case ESC:
        case TAB:
          // Prevent closing dialogs.
          e.keyCode === ESC && e.preventDefault();

          onHide();
          break;
        case RETURN:
          if (!isMenuShown) {
            break;
          }

          // Don't submit form if menu is shown and an item is active.
          if (!submitFormOnEnter || activeItem) {
            // Prevent submitting forms.
            e.preventDefault();
          }

          if (activeItem) {
            onSelectionAdd(activeItem);
            break;
          }

          if (isOnlyResult) {
            onSelectionAdd(initialItem);
            break;
          }
          break;
      }

      onKeyDown(e);
    }
  }

  return WrappedTypeahead;
}

export default typeaheadInnerContainer;

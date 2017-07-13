import {find, head, isEqual, noop} from 'lodash';
import onClickOutside from 'react-onclickoutside';
import React from 'react';
import PropTypes from 'prop-types';

import defaultFilterBy from '../utils/defaultFilterBy';
import getOptionLabel from '../utils/getOptionLabel';
import warn from '../utils/warn';

import {DOWN, ESC, RETURN, TAB, UP} from '../utils/keyCode';

function getInitialState(props) {
  const {defaultSelected, maxResults} = props;

  let selected = props.selected.slice();
  if (defaultSelected && defaultSelected.length) {
    selected = defaultSelected;
  }

  return {
    activeIndex: -1,
    activeItem: null,
    initialItem: null,
    selected,
    showMenu: false,
    shownResults: maxResults,
    text: '',
  };
}

function typeaheadContainer(Typeahead) {
  class WrappedTypeahead extends React.Component {
    constructor(props) {
      super(props);
      this.state = getInitialState(props);
    }

    getChildContext() {
      return {
        activeIndex: this.state.activeIndex,
        onActiveItemChange: this._handleActiveItemChange,
        onInitialItemChange: this._handleInitialItemChange,
        onMenuItemClick: this._handleSelectionAdd,
      };
    }

    componentWillMount() {
      const {
        allowNew,
        caseSensitive,
        filterBy,
        ignoreDiacritics,
        labelKey,
      } = this.props;

      warn(
        !(
          typeof filterBy === 'function' &&
          (caseSensitive || !ignoreDiacritics)
        ),
        'Your `filterBy` function will override the `caseSensitive` and ' +
        '`ignoreDiacritics` props.'
      );

      warn(
        !(typeof labelKey === 'function' && allowNew),
        '`labelKey` must be a string if creating new options is allowed.'
      );
    }

    componentDidMount() {
      this.props.autoFocus && this.focus();
    }

    componentWillReceiveProps(nextProps) {
      const {labelKey, multiple, selected} = nextProps;

      // If new selections are passed via props, treat as a controlled input.
      if (!isEqual(selected, this.props.selected)) {
        this._updateSelected(selected);

        if (!multiple) {
          const text = selected.length ?
            getOptionLabel(head(selected), labelKey) : '';

          this._updateText(text);
        }
      }

      // If component changes from multi-select to single-select, keep only the
      // first selection, if any.
      if (this.props.multiple && !multiple && this.state.selected.length) {
        const stateSelected = this.state.selected.slice(0, 1);
        this._updateSelected(stateSelected);
        this._updateText(getOptionLabel(head(stateSelected), labelKey));
        return;
      }

      if (multiple !== this.props.multiple) {
        this._updateText('');
      }
    }

    render() {
      return (
        <Typeahead
          {...this.props}
          {...this.state}
          onBlur={this._handleBlur}
          onClear={this.clear}
          onFocus={this._handleFocus}
          onInitialItemChange={this._handleInitialItemChange}
          onInputChange={this._handleInputChange}
          onKeyDown={this._handleKeyDown}
          onPaginate={this._handlePaginate}
          onSelectionAdd={this._handleSelectionAdd}
          onSelectionRemove={this._handleSelectionRemove}
          ref={instance => this._instance = instance}
          results={this._getFilteredResults()}
        />
      );
    }

    _getFilteredResults = () => {
      const {
        caseSensitive,
        filterBy,
        ignoreDiacritics,
        labelKey,
        minLength,
        multiple,
        options,
      } = this.props;

      const {selected, text} = this.state;

      if (text.length < minLength) {
        return [];
      }

      const callback = Array.isArray(filterBy) ?
        option => defaultFilterBy(
          option,
          text,
          labelKey,
          multiple && !!find(selected, o => isEqual(o, option)),
          {caseSensitive, ignoreDiacritics, fields: filterBy}
        ) :
        option => filterBy(option, text);

      return options.filter(callback);
    }

    blur = () => {
      this._instance.blur();
      this._hideDropdown();
    }

    /**
     * Public method to allow external clearing of the input. Clears both text
     * and selection(s).
     */
    clear = () => {
      this.setState(getInitialState(this.props));

      this._updateSelected([]);
      this._updateText('');
    }

    focus = () => {
      this._instance.focus();
    }

    _handleActiveItemChange = activeItem => {
      this.setState({activeItem});
    }

    _handleBlur = e => {
      // Note: Don't hide the menu here, since that interferes with other
      // actions like making a selection by clicking on a menu item.
      this.props.onBlur(e);
    }

    _handleFocus = e => {
      this.props.onFocus(e);
      this.setState({showMenu: true});
    }

    _handleInitialItemChange = initialItem => {
      const {labelKey} = this.props;
      const currentItem = this.state.initialItem;

      // Don't update the initial item if it hasn't changed. For custom items,
      // compare the `labelKey` values since a unique id is generated each time,
      // causing the comparison to always return false otherwise.
      if (
        isEqual(initialItem, currentItem) ||
        (
          currentItem &&
          initialItem &&
          initialItem.customOption &&
          initialItem[labelKey] === currentItem[labelKey]
        )
      ) {
        return;
      }

      this.setState({initialItem});
    }

    _handleInputChange = text => {
      const {activeIndex, activeItem} = getInitialState(this.props);
      this.setState({
        activeIndex,
        activeItem,
        showMenu: true,
      }, () => {
        // State isn't set until after `componentWillReceiveProps` in the React
        // lifecycle. For the typeahead to behave correctly as a controlled
        // component, we therefore have to update user-input text after the rest
        // of the component has updated.
        this._updateText(text);
      });
    }

    _handleKeyDown = (options, e) => {
      const {activeItem, showMenu} = this.state;

      switch (e.keyCode) {
        case UP:
        case DOWN:
          // Don't cycle through the options if the menu is hidden.
          if (!showMenu) {
            return;
          }

          let {activeIndex} = this.state;

          // Prevents input cursor from going to the beginning when pressing up.
          e.preventDefault();

          // Increment or decrement index based on user keystroke.
          activeIndex += e.keyCode === UP ? -1 : 1;

          // If we've reached the end, go back to the beginning or vice-versa.
          if (activeIndex === options.length) {
            activeIndex = -1;
          } else if (activeIndex === -2) {
            activeIndex = options.length - 1;
          }

          const newState = {activeIndex};
          if (activeIndex === -1) {
            // Reset the active item if there is no active index.
            newState.activeItem = null;
          }

          this.setState(newState);
          break;
        case ESC:
        case TAB:
          // Prevent closing dialogs.
          e.keyCode === ESC && e.preventDefault();

          this._hideDropdown();
          break;
        case RETURN:
          // if menu is shown and we have active item
          // there is no any sense to submit form on <RETURN>
          if (!this.props.submitFormOnEnter || showMenu && activeItem) {
            // Prevent submitting forms.
            e.preventDefault();
          }

          if (showMenu && activeItem) {
            this._handleSelectionAdd(activeItem);
          }
          break;
      }
    }

    _handleSelectionAdd = selection => {
      const {multiple, labelKey} = this.props;

      let selected;
      let text;

      if (multiple) {
        // If multiple selections are allowed, add the new selection to the
        // existing selections.
        selected = this.state.selected.concat(selection);
        text = '';
      } else {
        // If only a single selection is allowed, replace the existing selection
        // with the new one.
        selected = [selection];
        text = getOptionLabel(selection, labelKey);
      }

      this._hideDropdown();
      this._updateSelected(selected);
      this._updateText(text);

      this.setState({initialItem: selection});
    }

    _handlePaginate = e => {
      const {maxResults, onPaginate} = this.props;

      onPaginate(e);
      this.setState({shownResults: this.state.shownResults + maxResults});
    }

    _handleSelectionRemove = selection => {
      const selected = this.state.selected.filter(option => (
        !isEqual(option, selection)
      ));

      // Make sure the input stays focused after the item is removed.
      this.focus();
      this._hideDropdown();
      this._updateSelected(selected);
    }

    /**
     * From `onClickOutside` HOC.
     */
    handleClickOutside = e => {
      this.state.showMenu && this._hideDropdown();
    }

    _hideDropdown = () => {
      const {
        activeIndex,
        activeItem,
        showMenu,
        shownResults,
      } = getInitialState(this.props);

      this.setState({
        activeIndex,
        activeItem,
        showMenu,
        shownResults,
      });
    }

    _updateSelected = selected => {
      this.setState({selected});
      this.props.onChange(selected);
    }

    _updateText = text => {
      this.setState({text});
      this.props.onInputChange(text);
    }
  }

  WrappedTypeahead.propTypes = {
    /**
     * Allows the creation of new selections on the fly. Note that any new items
     * will be added to the list of selections, but not the list of original
     * options unless handled as such by `Typeahead`'s parent.
     */
    allowNew: PropTypes.bool,
    /**
     * Autofocus the input when the component initially mounts.
     */
    autoFocus: PropTypes.bool,
    /**
     * Whether to render the menu inline or attach to `document.body`.
     */
    bodyContainer: PropTypes.bool,
    /**
     * Whether or not filtering should be case-sensitive.
     */
    caseSensitive: PropTypes.bool,
    /**
     * Displays a button to clear the input when there are selections.
     */
    clearButton: PropTypes.bool,
    /**
     * Specify any pre-selected options. Use only if you want the component to
     * be uncontrolled.
     */
    defaultSelected: PropTypes.array,
    /**
     * Specify whether the menu should appear above the input.
     */
    dropup: PropTypes.bool,
    /**
     * Either an array of fields in `option` to search, or a custom filtering
     * callback.
     */
    filterBy: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string.isRequired),
      PropTypes.func,
    ]),
    /**
     * Whether the filter should ignore accents and other diacritical marks.
     */
    ignoreDiacritics: PropTypes.bool,
    /**
     * Indicate whether an asynchromous data fetch is happening.
     */
    isLoading: PropTypes.bool,
    /**
     * Specify the option key to use for display or a function returning the
     * display string. By default, the selector will use the `label` key.
     */
    labelKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    /**
     * Maximum number of results to display by default. Mostly done for
     * performance reasons so as not to render too many DOM nodes in the case of
     * large data sets.
     */
    maxResults: PropTypes.number,
    /**
     * Number of input characters that must be entered before showing results.
     */
    minLength: PropTypes.number,
    /**
     * Whether or not multiple selections are allowed.
     */
    multiple: PropTypes.bool,
    /**
     * Invoked when the input is blurred. Receives an event.
     */
    onBlur: PropTypes.func,
    /**
     * Invoked whenever items are added or removed. Receives an array of the
     * selected options.
     */
    onChange: PropTypes.func,
    /**
     * Invoked when the input is focused. Receives an event.
     */
    onFocus: PropTypes.func,
    /**
     * Invoked when the input value changes. Receives the string value of the
     * input.
     */
    onInputChange: PropTypes.func,
    /**
     * Invoked when the pagination menu item is clicked. Receives an event.
     */
    onPaginate: PropTypes.func,
    /**
     * Full set of options, including pre-selected options. Must either be an
     * array of objects (recommended) or strings.
     */
    options: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.object.isRequired),
      PropTypes.arrayOf(PropTypes.string.isRequired),
    ]).isRequired,
    /**
     * Give user the ability to display additional results if the number of
     * results exceeds `maxResults`.
     */
    paginate: PropTypes.bool,
    /**
     * Callback for custom menu rendering.
     */
    renderMenu: PropTypes.func,
    /**
     * The selected option(s) displayed in the input. Use this prop if you want
     * to control the component via its parent.
     */
    selected: PropTypes.array,
    /**
     * Allows selecting the hinted result by pressing enter.
     */
    selectHintOnEnter: PropTypes.bool,
    /**
     * Propagate <RETURN> event to parent form.
     */
    submitFormOnEnter: PropTypes.bool,
  };

  WrappedTypeahead.defaultProps = {
    allowNew: false,
    autoFocus: false,
    bodyContainer: false,
    caseSensitive: false,
    clearButton: false,
    defaultSelected: [],
    dropup: false,
    filterBy: [],
    ignoreDiacritics: true,
    isLoading: false,
    labelKey: 'label',
    maxResults: 100,
    minLength: 0,
    multiple: false,
    onBlur: noop,
    onChange: noop,
    onFocus: noop,
    onInputChange: noop,
    onPaginate: noop,
    paginate: true,
    selected: [],
    selectHintOnEnter: false,
    submitFormOnEnter: false,
  };

  WrappedTypeahead.childContextTypes = {
    activeIndex: PropTypes.number.isRequired,
    onActiveItemChange: PropTypes.func.isRequired,
    onInitialItemChange: PropTypes.func.isRequired,
    onMenuItemClick: PropTypes.func.isRequired,
  };

  return onClickOutside(WrappedTypeahead);
}

export default typeaheadContainer;
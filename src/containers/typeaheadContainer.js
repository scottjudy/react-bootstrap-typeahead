import {flowRight, head, isEqual, noop} from 'lodash';
import PropTypes from 'prop-types';
import onClickOutside from 'react-onclickoutside';
import React from 'react';

import highlightOnlyResultContainer from './highlightOnlyResultContainer';
import typeaheadInnerContainer from './typeaheadInnerContainer';
import {caseSensitiveType, checkPropType, defaultInputValueType, highlightOnlyResultType, ignoreDiacriticsType, inputPropsType, labelKeyType, optionType} from '../propTypes/';
import {addCustomOption, defaultFilterBy, getOptionLabel, getTruncatedOptions, pluralize} from '../utils/';

function genId(prefix='') {
  return prefix + Math.random().toString(36).substr(2, 12);
}

function getInitialState(props) {
  const {defaultInputValue, defaultSelected, maxResults, multiple} = props;

  let selected = props.selected ?
    props.selected.slice() :
    defaultSelected.slice();

  let text = defaultInputValue;

  if (!multiple && selected.length) {
    // Set the text if an initial selection is passed in.
    text = getOptionLabel(head(selected), props.labelKey);

    if (selected.length > 1) {
      // Limit to 1 selection in single-select mode.
      selected = selected.slice(0, 1);
    }
  }

  return {
    activeIndex: -1,
    activeItem: null,
    initialItem: null,
    selected,
    showMenu: false,
    shownResults: maxResults,
    text,
  };
}

function typeaheadContainer(Typeahead) {
  // Nested HOCs to encapsulate behaviors. In order from outer to inner.
  Typeahead = flowRight(
    highlightOnlyResultContainer,
    typeaheadInnerContainer,
  )(Typeahead);

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
        onMenuItemClick: this._handleMenuItemSelect,
      };
    }

    componentWillMount() {
      // Generate random id here since doing it in defaultProps will generate
      // the same id for every instance.
      this._menuId = genId('rbt-menu-');
    }

    componentDidMount() {
      this.props.autoFocus && this.focus();
    }

    componentWillReceiveProps(nextProps) {
      const inputValue = this._getInputNode().value;
      const {labelKey, multiple, selected} = nextProps;

      // If new selections are passed via props, treat as a controlled input.
      if (selected && !isEqual(selected, this.props.selected)) {
        this.setState({selected});

        if (multiple) {
          return;
        }

        // Update the input text.
        let text;
        if (selected.length) {
          // If a new selection has been passed in, display the label.
          text = getOptionLabel(head(selected), labelKey);
        } else if (this.state.text !== inputValue) {
          // The input value was modified by the user, removing the selection.
          // Set the input value as the new text.
          text = inputValue;
        } else {
          // An empty array was passed.
          text = '';
        }

        this.setState({text});
      }

      // Truncate selections when in single-select mode.
      let newSelected = selected || this.state.selected;
      if (!multiple && newSelected.length > 1) {
        newSelected = newSelected.slice(0, 1);
        this.setState({
          selected: newSelected,
          text: getOptionLabel(head(newSelected), labelKey),
        });
        return;
      }

      if (multiple !== this.props.multiple) {
        this.setState({text: ''});
      }
    }

    render() {
      const {
        allowNew,
        emptyLabel,
        filterBy,
        labelKey,
        minLength,
        options,
        paginate,
        paginationText,
      } = this.props;

      const {shownResults, showMenu, text} = this.state;

      let results = [];
      if (text.length >= minLength) {
        const cb = Array.isArray(filterBy) ? defaultFilterBy : filterBy;
        results = options.filter((option) => (
          cb(option, {...this.props, ...this.state})
        ));
      }

      // This must come before results are truncated.
      const shouldPaginate = paginate && results.length > shownResults;

      // Truncate results if necessary.
      results = getTruncatedOptions(results, shownResults);

      // Add the custom option.
      if (allowNew) {
        results = addCustomOption(results, text, labelKey);
      }

      // Add the pagination item.
      if (shouldPaginate) {
        results = results.concat({
          [labelKey]: paginationText,
          paginationOption: true,
        });
      }

      // This must come after the custom option is added, if applicable.
      const isMenuShown = !!(
        text.length >= minLength &&
        showMenu &&
        (results.length || emptyLabel)
      );

      return (
        <Typeahead
          {...this.props}
          {...this.state}
          inputRef={(input) => this._input = input}
          isMenuShown={isMenuShown}
          menuId={this.props.menuId || this._menuId}
          onActiveIndexChange={this._handleActiveIndexChange}
          onClear={this._handleClear}
          onFocus={this._handleFocus}
          onHide={this._hideMenu}
          onInitialItemChange={this._handleInitialItemChange}
          onInputChange={this._handleInputChange}
          onMenuItemSelect={this._handleMenuItemSelect}
          onSelectionAdd={this._handleSelectionAdd}
          onSelectionRemove={this._handleSelectionRemove}
          onShow={this._showMenu}
          results={results}
        />
      );
    }

    blur = () => {
      this._getInputNode().blur();
      this._hideMenu();
    }

    clear = () => {
      this.setState({
        ...getInitialState(this.props),
        selected: [],
        text: '',
      });
    }

    focus = () => {
      this._getInputNode().focus();
    }

    _getInputNode = () => {
      return this._input.getInputNode();
    }

    _handleActiveIndexChange = (activeIndex) => {
      const newState = {activeIndex};

      if (activeIndex === -1) {
        // Reset the active item if there is no active index.
        newState.activeItem = null;
      }

      this.setState(newState);
    }

    _handleActiveItemChange = (activeItem) => {
      this.setState({activeItem});
    }

    _handleClear = () => {
      this.clear();
      this.props.onChange([]);
    }

    _handleFocus = (e) => {
      this.props.onFocus(e);
      this.setState({showMenu: true});
    }

    _handleInitialItemChange = (initialItem) => {
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

    _handleInputChange = (e) => {
      const text = e.target.value;
      const {activeIndex, activeItem} = getInitialState(this.props);
      this.setState({
        activeIndex,
        activeItem,
        showMenu: true,
        text,
      });
      this.props.onInputChange(text);
    }

    _handleMenuItemSelect = (option, e) => {
      if (option.paginationOption) {
        this._handlePaginate(e);
      } else {
        this._handleSelectionAdd(option);
      }
    }

    _handlePaginate = (e) => {
      const {maxResults, onPaginate} = this.props;

      onPaginate(e);
      this.setState({shownResults: this.state.shownResults + maxResults});
    }

    _handleSelectionAdd = (selection) => {
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

      this._hideMenu();
      this.setState({
        initialItem: selection,
        text,
      });

      // Text must be updated before the selection to fix #211.
      // TODO: Find a more robust way of solving the issue.
      this._updateSelected(selected);
    }

    _handleSelectionRemove = (selection) => {
      const selected = this.state.selected.filter((option) => (
        !isEqual(option, selection)
      ));

      // Make sure the input stays focused after the item is removed.
      this.focus();
      this._hideMenu();
      this._updateSelected(selected);
    }

    /**
     * From `onClickOutside` HOC.
     */
    handleClickOutside = (e) => {
      this.state.showMenu && this._hideMenu();
    }

    _hideMenu = () => {
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

    _showMenu = () => {
      this.setState({showMenu: true});
    }

    _updateSelected = (selected) => {
      this.setState({selected});
      this.props.onChange(selected);
    }
  }

  WrappedTypeahead.displayName = 'Typeahead';

  WrappedTypeahead.propTypes = {
    /**
     * For localized accessibility: Should return a string indicating the number
     * of results for screen readers. Receives the current results.
     */
    a11yNumResults: PropTypes.func,
    /**
     * For localized accessibility: Should return a string indicating the number
     * of selections for screen readers. Receives the current selections.
     */
    a11yNumSelected: PropTypes.func,
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
    caseSensitive: checkPropType(PropTypes.bool, caseSensitiveType),
    /**
     * Displays a button to clear the input when there are selections.
     */
    clearButton: PropTypes.bool,
    /**
     * The initial value displayed in the text input.
     */
    defaultInputValue: checkPropType(PropTypes.string, defaultInputValueType),
    /**
     * Specify any pre-selected options. Use only if you want the component to
     * be uncontrolled.
     */
    defaultSelected: optionType,
    /**
     * Whether to disable the component.
     */
    disabled: PropTypes.bool,
    /**
     * Specify whether the menu should appear above the input.
     */
    dropup: PropTypes.bool,
    /**
     * Message to display in the menu if there are no valid results.
     */
    emptyLabel: PropTypes.node,
    /**
     * Either an array of fields in `option` to search, or a custom filtering
     * callback.
     */
    filterBy: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string.isRequired),
      PropTypes.func,
    ]),
    /**
     * Highlights the menu item if there is only one result and allows selecting
     * that item by hitting enter. Does not work with `allowNew`.
     */
    highlightOnlyResult: checkPropType(PropTypes.bool, highlightOnlyResultType),
    /**
     * Whether the filter should ignore accents and other diacritical marks.
     */
    ignoreDiacritics: checkPropType(PropTypes.bool, ignoreDiacriticsType),
    /**
     * Props to be applied directly to the input. `onBlur`, `onChange`,
     * `onFocus`, and `onKeyDown` are ignored.
     */
    inputProps: checkPropType(PropTypes.object, inputPropsType),
    /**
     * Indicate whether an asynchronous data fetch is happening.
     */
    isLoading: PropTypes.bool,
    /**
     * Specify the option key to use for display or a function returning the
     * display string. By default, the selector will use the `label` key.
     */
    labelKey: checkPropType(
      PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
      labelKeyType,
    ),
    /**
     * Maximum number of results to display by default. Mostly done for
     * performance reasons so as not to render too many DOM nodes in the case of
     * large data sets.
     */
    maxResults: PropTypes.number,
    /**
     * Id applied to the top-level menu element. Required for accessibility.
     */
    menuId: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
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
     * Invoked when a key is pressed. Receives an event.
     */
    onKeyDown: PropTypes.func,
    /**
     * Invoked when the menu is hidden.
     */
    onMenuHide: PropTypes.func,
    /**
     * Invoked when the menu is shown.
     */
    onMenuShow: PropTypes.func,
    /**
     * Invoked when the pagination menu item is clicked. Receives an event.
     */
    onPaginate: PropTypes.func,
    /**
     * Full set of options, including pre-selected options. Must either be an
     * array of objects (recommended) or strings.
     */
    options: optionType.isRequired,
    /**
     * Give user the ability to display additional results if the number of
     * results exceeds `maxResults`.
     */
    paginate: PropTypes.bool,
    /**
     * Prompt displayed when large data sets are paginated.
     */
    paginationText: PropTypes.string,
    /**
     * Placeholder text for the input.
     */
    placeholder: PropTypes.string,
    /**
     * Callback for custom menu rendering.
     */
    renderMenu: PropTypes.func,
    /**
     * The selected option(s) displayed in the input. Use this prop if you want
     * to control the component via its parent.
     */
    selected: optionType,
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
    a11yNumResults: (results) => {
      const resultString = pluralize('result', results.length);
      return `${resultString}. Use up and down arrow keys to navigate.`;
    },
    a11yNumSelected: (selected) => {
      return pluralize('selection', selected.length);
    },
    allowNew: false,
    autoFocus: false,
    bodyContainer: false,
    caseSensitive: false,
    clearButton: false,
    defaultInputValue: '',
    defaultSelected: [],
    disabled: false,
    dropup: false,
    emptyLabel: 'No matches found.',
    filterBy: [],
    highlightOnlyResult: false,
    ignoreDiacritics: true,
    inputProps: {},
    isLoading: false,
    labelKey: 'label',
    maxResults: 100,
    minLength: 0,
    multiple: false,
    onBlur: noop,
    onChange: noop,
    onFocus: noop,
    onInputChange: noop,
    onKeyDown: noop,
    onMenuHide: noop,
    onMenuShow: noop,
    onPaginate: noop,
    paginate: true,
    paginationText: 'Display additional results...',
    placeholder: '',
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

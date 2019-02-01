import {expect} from 'chai';
import {mount} from 'enzyme';
import {head, noop} from 'lodash';
import React from 'react';
import {Popper} from 'react-popper';
import sinon from 'sinon';

import {Menu, MenuItem, Typeahead} from '../../src';

import {change, focus, getHint, getInput, getMenu, getMenuItems, getPaginator, getTokens, keyDown} from '../helpers';
import states from '../../example/exampleData';
import {DOWN, ESC, RETURN, RIGHT, TAB, UP} from '../../src/constants';

function cycleThroughMenuAndGetActiveItem(wrapper, dir) {
  keyDown(wrapper, dir);
  return wrapper.find('a.active');
}

function mountTypeahead(props) {
  return mount(
    <Typeahead
      labelKey="name"
      onChange={noop}
      options={states}
      {...props}
    />
  );
}

function getClearButton(wrapper) {
  return wrapper.find('.rbt-close');
}

function getPlacement(wrapper) {
  return wrapper.find(Popper).prop('placement');
}

function getState(wrapper) {
  return wrapper.instance().getInstance().state;
}

function getSelected(wrapper) {
  return getState(wrapper).selected;
}

function getText(wrapper) {
  return getState(wrapper).text;
}

function hasFocus(wrapper) {
  // Focus state is stored at the top level and propagated down to the input.
  // Check both.
  return (
    getState(wrapper).isFocused &&
    wrapper.find('.form-control').hasClass('focus')
  );
}

function setCursorPosition(wrapper, pos) {
  const input = getInput(wrapper);
  input.instance().selectionStart = pos;
  input.simulate('change');
}

describe('<Typeahead>', () => {
  let typeahead;

  beforeEach(() => {
    typeahead = mountTypeahead();
  });

  it('should have an input', () => {
    expect(typeahead.find('input.rbt-input-main')).to.have.length(1);
  });

  it('should render in multi-select mode when `multiple=true`', () => {
    typeahead.setProps({multiple: true});
    expect(typeahead.find('.rbt-input-multi')).to.have.length(1);
  });

  it('should display tokens when selections are passed in', () => {
    typeahead.setProps({
      multiple: true,
      selected: states.slice(0, 3),
    });
    expect(getTokens(typeahead)).to.have.length(3);
  });

  it('sets and unsets the focus state on focus/blur', () => {
    const input = getInput(typeahead);

    expect(hasFocus(typeahead)).to.equal(false);

    input.simulate('focus');
    expect(hasFocus(typeahead)).to.equal(true);

    input.simulate('blur');
    expect(hasFocus(typeahead)).to.equal(false);
  });

  describe('input focus', () => {
    beforeEach(() => {
      typeahead.setProps({
        clearButton: true,
        selected: states.slice(0, 1),
      });

      focus(typeahead);
      expect(hasFocus(typeahead)).to.equal(true);
    });

    afterEach(() => {
      // The menu should close but the input stays focused.
      expect(getMenuItems(typeahead).length).to.equal(0);
      expect(hasFocus(typeahead)).to.equal(true);
    });

    it('maintains focus when clicking a menu item', () => {
      getMenuItems(typeahead).first().simulate('click');
    });

    it('maintains focus when clicking the clear button', () => {
      getClearButton(typeahead).simulate('click');
    });
  });

  describe('behaviors when selections are passed in', () => {
    const multiSelections = states.slice(0, 4);

    it('truncates selections when using `defaultSelected`', () => {
      const wrapper = mountTypeahead({
        defaultSelected: multiSelections,
      });

      expect(getSelected(wrapper).length).to.equal(1);
    });

    it('truncates selections when using `selected`', () => {
      typeahead.setProps({selected: multiSelections});

      expect(getSelected(typeahead).length).to.equal(1);
    });

    it('truncates selections when going from multi- to single-select', () => {
      typeahead.setProps({
        multiple: true,
        selected: multiSelections,
      });

      expect(getSelected(typeahead).length).to.equal(multiSelections.length);

      typeahead.setProps({multiple: false});

      expect(getSelected(typeahead).length).to.equal(1);
      expect(getSelected(typeahead)).to.deep.equal(states.slice(0, 1));
    });

    it('filters menu options based on `selected` values', () => {
      const selected = states.slice(0, 1);
      typeahead.setProps({selected});

      focus(typeahead);

      expect(getInput(typeahead).prop('value')).to.equal(head(selected).name);
      expect(getMenuItems(typeahead).length).to.equal(1);
    });

    it('filters menu options based on `defaultSelected` values', () => {
      const defaultSelected = states.slice(0, 1);
      const value = head(defaultSelected).name;

      typeahead = mountTypeahead({defaultSelected});

      focus(typeahead);

      expect(getInput(typeahead).prop('value')).to.equal(value);
      expect(getMenuItems(typeahead).length).to.equal(1);
    });
  });

  describe('input value behaviors', () => {
    let defaultInputValue, defaultSelected, selected;

    beforeEach(() => {
      defaultInputValue = 'This is a default value';
      /* eslint-disable-next-line no-multi-assign */
      defaultSelected = selected = states.slice(0, 1);
    });

    it('sets a default initial input value', () => {
      typeahead = mountTypeahead({defaultInputValue});
      expect(getInput(typeahead).prop('value')).to.equal(defaultInputValue);
    });

    it('sets an input value based on the `selected` value', () => {
      typeahead.setProps({selected});
      expect(getInput(typeahead).prop('value')).to.equal(head(selected).name);
    });

    it('sets an input value based on the `defaultSelected` value', () => {
      typeahead = mountTypeahead({defaultSelected});
      const inputValue = getInput(typeahead).prop('value');
      expect(inputValue).to.equal(head(defaultSelected).name);
    });

    it('overrides the initial input value', () => {
      typeahead = mountTypeahead({defaultInputValue, selected});
      expect(getInput(typeahead).prop('value')).to.equal(head(selected).name);
    });
  });

  describe('menu visibility behavior', () => {
    it('shows the menu on initial render', () => {
      typeahead = mountTypeahead({defaultOpen: true});
      expect(getState(typeahead).showMenu).to.equal(true);
      expect(getMenu(typeahead).length).to.equal(1);
    });

    it('shows the menu when `open` is `true`', () => {
      typeahead.setProps({open: true});

      // TODO: Menu isn't immediately rendered when changing props in testing
      // environment for some reason. For now, test that it at least stays open
      // when blurred.
      focus(typeahead);
      getInput(typeahead).simulate('blur');

      expect(getMenu(typeahead).length).to.equal(1);
    });

    it('hides the menu when `open` is `false`', () => {
      typeahead.setProps({open: false});
      focus(typeahead);
      expect(getMenu(typeahead).length).to.equal(0);
    });

    it('shows the menu when the input is focused', () => {
      focus(typeahead);
      expect(getMenu(typeahead).length).to.equal(1);
    });

    it('hides the menu on focus when `minLength=1`', () => {
      typeahead.setProps({minLength: 1});
      focus(typeahead);
      expect(getMenu(typeahead).length).to.equal(0);
    });

    it(
      'shows the menu when there are no results, `allowNew=true`, ' +
      'and `emptyLabel` is falsy', () => {
        typeahead.setProps({
          allowNew: true,
          emptyLabel: false,
          options: [],
        });
        change(typeahead, 'xx');
        focus(typeahead);

        const menuItems = getMenuItems(typeahead);
        expect(menuItems.length).to.equal(1);
        expect(menuItems.text()).to.equal('New selection: xx');
      }
    );
  });

  it('should not display a menu if `emptyLabel` is falsy', () => {
    function getMenuWithEmptyLabel(emptyLabel) {
      typeahead = mountTypeahead({emptyLabel, options: []});
      focus(typeahead);
      return getMenu(typeahead);
    }

    let menuNode = getMenuWithEmptyLabel('');
    expect(menuNode.length).to.equal(0);

    menuNode = getMenuWithEmptyLabel(null);
    expect(menuNode.length).to.equal(0);

    menuNode = getMenuWithEmptyLabel(0);
    expect(menuNode.length).to.equal(0);
  });

  it('should disable the input if the component is disabled', () => {
    const input = typeahead
      .setProps({disabled: true})
      .find('.form-control');

    expect(input.prop('disabled')).to.equal(true);
  });

  it('should not highlight disabled options', () => {
    let activeItem;

    const options = [
      {name: 'foo'},
      {disabled: true, name: 'bar'},
      {disabled: true, name: 'boo'},
      {name: 'baz'},
    ];

    typeahead = mountTypeahead({options});
    focus(typeahead);

    // Cycling down should activate the first option.
    activeItem = cycleThroughMenuAndGetActiveItem(typeahead, DOWN);
    expect(activeItem.text()).to.equal(options[0].name);

    // Cycling down should skip the two disabled option.
    activeItem = cycleThroughMenuAndGetActiveItem(typeahead, DOWN);
    expect(activeItem.text()).to.equal(options[3].name);

    // Cycling back up should again skip the two disabled option.
    activeItem = cycleThroughMenuAndGetActiveItem(typeahead, UP);
    expect(activeItem.text()).to.equal(options[0].name);
  });

  it(
    'should not highlight disabled option which is the last in the list',
    () => {
      const options = [
        {name: 'foo'},
        {name: 'bar'},
        {disabled: true, name: 'boo'},
      ];

      typeahead = mountTypeahead({options});
      focus(typeahead);

      // Cycling back up should skip the last option disabled.
      const activeOption = cycleThroughMenuAndGetActiveItem(typeahead, UP);
      expect(activeOption.text()).to.equal(options[1].name);
    }
  );

  describe('pagination behaviors', () => {
    let maxResults, onPaginate, shownResultsCount;

    beforeEach(() => {
      maxResults = 10;
      shownResultsCount = maxResults;

      onPaginate = sinon.spy((e, shownResults) => {
        shownResultsCount = shownResults;
      });

      typeahead = mountTypeahead({
        maxResults,
        onPaginate,
      });
    });

    it('has a menu item for pagination', () => {
      focus(typeahead);
      const paginator = getPaginator(typeahead);

      expect(paginator).to.have.length(1);
      expect(paginator.text()).to.equal('Display additional results...');
    });

    it('calls `onPaginate` when the menu item is clicked', () => {
      focus(typeahead);
      typeahead
        .find('.rbt-menu-pagination-option a')
        .hostNodes()
        .simulate('click');

      expect(onPaginate.calledOnce).to.equal(true);
      expect(shownResultsCount).to.equal(maxResults * 2);
      expect(getMenuItems(typeahead).length).to.equal(21);
    });

    it('calls `onPaginate` when the return key is pressed', () => {
      focus(typeahead);
      keyDown(typeahead, UP);
      keyDown(typeahead, RETURN);

      expect(onPaginate.calledOnce).to.equal(true);
      expect(shownResultsCount).to.equal(maxResults * 2);
      expect(getMenuItems(typeahead).length).to.equal(21);
    });

    it('calls `onPaginate` when `labelKey` is a function', () => {
      typeahead.setProps({labelKey: (o) => o.name});

      focus(typeahead);
      keyDown(typeahead, UP);
      keyDown(typeahead, RETURN);

      expect(onPaginate.calledOnce).to.equal(true);
      expect(shownResultsCount).to.equal(maxResults * 2);
      expect(getMenuItems(typeahead).length).to.equal(21);
    });

    it(
      'does not call `onPaginate` when the right arrow or tab keys are ' +
      'pressed', () => {
        focus(typeahead);

        keyDown(typeahead, UP);
        keyDown(typeahead, RIGHT);

        expect(onPaginate.notCalled).to.equal(true);

        keyDown(typeahead, TAB);
        expect(onPaginate.notCalled).to.equal(true);

        // The menu should close when the tab key is pressed.
        expect(getMenuItems(typeahead).length).to.equal(0);
      }
    );

    it('displays custom pagination text', () => {
      const paginationText = 'More Results...';
      typeahead.setProps({paginationText});

      focus(typeahead);
      expect(getPaginator(typeahead).text()).to.equal(paginationText);
    });

    it('does not have a menu item for pagination', () => {
      typeahead.setProps({paginate: false});

      focus(typeahead);
      expect(getPaginator(typeahead)).to.have.length(0);
    });

    it('resets the shown results when the input value changes', () => {
      maxResults = 5;
      typeahead.setProps({maxResults});

      change(typeahead, 'ar');
      focus(typeahead);
      keyDown(typeahead, UP);
      keyDown(typeahead, RETURN);

      expect(onPaginate.callCount).to.equal(1);
      expect(shownResultsCount).to.equal(maxResults * 2);

      change(typeahead, 'or');
      focus(typeahead);
      keyDown(typeahead, UP);
      keyDown(typeahead, RETURN);

      expect(onPaginate.callCount).to.equal(2);
      expect(shownResultsCount).to.equal(maxResults * 2);
    });
  });

  describe('should limit the results when `maxResults` is set', () => {
    const maxResults = 5;

    beforeEach(() => {
      typeahead = mountTypeahead({maxResults});
    });

    it('should limit results when `paginate=true`', () => {
      focus(typeahead);

      // When `paginate` is true, there will be a pagination menu item in
      // addition to the shown results.
      expect(getMenuItems(typeahead).length).to.equal(maxResults + 1);
    });

    it('should limit results when `paginate=false`', () => {
      typeahead.setProps({paginate: false});
      focus(typeahead);

      expect(getMenuItems(typeahead).length).to.equal(maxResults);
    });
  });

  it('changes the menu\'s horizontal positioning', () => {
    focus(typeahead);

    expect(getPlacement(typeahead)).to.equal('bottom-start');

    typeahead.setProps({align: 'right'});
    expect(getPlacement(typeahead)).to.equal('bottom-end');

    typeahead.setProps({align: 'left'});
    expect(getPlacement(typeahead)).to.equal('bottom-start');
  });

  it('should position the menu above the input when `dropup=true`', () => {
    typeahead.setProps({dropup: true});
    focus(typeahead);

    expect(getPlacement(typeahead)).to.equal('top-start');
  });

  it('renders a large input', () => {
    const input = typeahead
      .setProps({bsSize: 'large'})
      .find('.form-control');

    expect(input.hasClass('input-lg form-control-lg')).to.equal(true);
  });

  it('renders a small input', () => {
    const input = typeahead
      .setProps({bsSize: 'small'})
      .find('.form-control');

    expect(input.hasClass('input-sm form-control-sm')).to.equal(true);
  });

  it('renders a loading indicator', () => {
    typeahead.setProps({isLoading: true});
    expect(typeahead.find('.rbt-loader')).to.have.length(1);
  });

  describe('ClearButton behavior', () => {
    beforeEach(() => {
      typeahead = mountTypeahead();
    });

    it('displays a clear button when there are selections', () => {
      typeahead.setProps({
        clearButton: true,
        selected: states.slice(0, 1),
      });

      expect(getClearButton(typeahead).length).to.equal(1);
    });

    it('does not display a clear button when there are no selections', () => {
      typeahead.setProps({
        clearButton: true,
        selected: [],
      });
      expect(getClearButton(typeahead).length).to.equal(0);
    });
  });

  describe('updates when re-rendering with new props', () => {
    it('acts as a controlled input in single-select mode', () => {
      const selected1 = states.slice(0, 1);
      const selected2 = states.slice(1, 2);

      // Pass in new selection
      typeahead.setProps({selected: selected1});

      expect(getSelected(typeahead)).to.deep.equal(selected1);
      expect(getText(typeahead)).to.equal(head(selected1).name);

      // Pass in another new selection
      typeahead.setProps({selected: selected2});

      expect(getSelected(typeahead)).to.deep.equal(selected2);
      expect(getText(typeahead)).to.equal(head(selected2).name);

      // Clear the selections.
      typeahead.setProps({selected: []});

      expect(getSelected(typeahead)).to.deep.equal([]);
      expect(getText(typeahead)).to.equal('');
    });

    it('acts as a controlled input in multi-select mode', () => {
      const selected1 = states.slice(0, 4);

      // Pass in new selection
      typeahead.setProps({
        multiple: true,
        selected: selected1,
      });

      expect(getSelected(typeahead)).to.deep.equal(selected1);
      expect(getText(typeahead)).to.equal('');

      // Clear the selections.
      typeahead.setProps({selected: []});

      expect(getSelected(typeahead)).to.deep.equal([]);
      expect(getText(typeahead)).to.equal('');
    });

    it('updates the selections and input value in single-select mode', () => {
      typeahead.setProps({
        // Simulate a controlled component.
        onChange: (selected) => typeahead.setProps({selected}),
        selected: states.slice(0, 1),
      });

      expect(getSelected(typeahead).length).to.equal(1);
      expect(getText(typeahead)).to.equal('Alabama');

      // Simulate deleting the last character.
      change(typeahead, 'Alabam');

      // Text entry should clear the selection and keep the entry.
      expect(getSelected(typeahead).length).to.equal(0);
      expect(getText(typeahead)).to.equal('Alabam');
    });
  });

  describe('`highlightOnlyResult` behavior', () => {
    let selected;

    beforeEach(() => {
      selected = [];
      typeahead = mountTypeahead({
        onChange: (s) => selected = [s],
      });
    });

    it('does not highlight the only result', () => {
      change(typeahead, 'Alab');
      focus(typeahead);

      const menuItems = getMenuItems(typeahead);

      expect(menuItems.length).to.equal(1);
      expect(menuItems.hasClass('active')).to.equal(false);

      keyDown(typeahead, RETURN);

      expect(selected.length).to.equal(0);
    });

    it('highlights the only result', () => {
      typeahead.setProps({highlightOnlyResult: true});

      change(typeahead, 'Alab');
      focus(typeahead);

      const menuItems = getMenuItems(typeahead);

      expect(menuItems.length).to.equal(1);
      expect(menuItems.hasClass('active')).to.equal(true);

      keyDown(typeahead, RETURN);

      expect(selected.length).to.equal(1);
    });

    it('does not highlight the only result when `allowNew=true`', () => {
      typeahead.setProps({
        allowNew: true,
        highlightOnlyResult: true,
      });

      change(typeahead, 'qqq');
      focus(typeahead);

      const menuItems = getMenuItems(typeahead);

      expect(menuItems.length).to.equal(1);
      expect(menuItems.hasClass('active')).to.equal(false);

      keyDown(typeahead, RETURN);

      expect(selected.length).to.equal(0);
    });

    it('does not highlight or select a disabled result', () => {
      typeahead.setProps({
        highlightOnlyResult: true,
        options: [
          {name: 'foo'},
          {disabled: true, name: 'bar'},
          {disabled: true, name: 'boo'},
          {name: 'baz'},
        ],
      });

      change(typeahead, 'bar');
      focus(typeahead);

      const menuItems = getMenuItems(typeahead);

      expect(menuItems.length).to.equal(1);
      expect(menuItems.hasClass('active')).to.equal(false);

      keyDown(typeahead, RETURN);

      expect(selected.length).to.equal(0);
    });
  });

  it('applies arbitrary attributes to the input', () => {
    const inputProps = {
      autoComplete: 'off',
      className: 'input-classname',
      id: 'input-id',
      name: 'input-name',
      tabIndex: 5,
      type: 'number',
    };

    typeahead.setProps({
      inputProps,
      multiple: true,
      selected: states.slice(0, 1),
    });

    const props = getInput(typeahead).props();

    expect(props.autoComplete).to.equal(inputProps.autoComplete);
    expect(props.className).to.contain(inputProps.className);
    expect(props.id).to.equal(inputProps.id);
    expect(props.name).to.equal(inputProps.name);
    expect(props.tabIndex).to.equal(inputProps.tabIndex);
    expect(props.type).to.equal(inputProps.type);

    expect(getTokens(typeahead).prop('tabIndex')).to.equal(inputProps.tabIndex);
  });

  it('triggers the `onKeyDown` callback', () => {
    const onKeyDown = sinon.spy();

    typeahead.setProps({onKeyDown});
    keyDown(typeahead, RETURN);

    expect(onKeyDown.calledOnce).to.equal(true);
  });

  describe('menu visibility hooks', () => {
    it('calls `onMenuShow`', () => {
      const onMenuShow = sinon.spy();

      typeahead.setProps({onMenuShow});

      expect(onMenuShow.notCalled).to.equal(true);

      focus(typeahead);
      expect(onMenuShow.calledOnce).to.equal(true);

      // Shouldn't be called again if not hidden first.
      focus(typeahead);
      expect(onMenuShow.calledOnce).to.equal(true);
    });

    it('calls `onMenuHide`', () => {
      const onMenuHide = sinon.spy();

      typeahead.setProps({onMenuHide});

      focus(typeahead);
      expect(onMenuHide.notCalled).to.equal(true);

      keyDown(typeahead, ESC);
      expect(onMenuHide.calledOnce).to.equal(true);

      // Shouldn't be called again if not shown first.
      keyDown(typeahead, ESC);
      expect(onMenuHide.calledOnce).to.equal(true);
    });

    it('calls `onMenuToggle`', () => {
      const onMenuToggle = sinon.spy();

      typeahead.setProps({onMenuToggle});

      expect(onMenuToggle.notCalled).to.equal(true);

      focus(typeahead);
      expect(onMenuToggle.callCount).to.equal(1);

      // Shouldn't be called again if not hidden first.
      focus(typeahead);
      expect(onMenuToggle.callCount).to.equal(1);

      keyDown(typeahead, ESC);
      expect(onMenuToggle.callCount).to.equal(2);
    });
  });

  describe('hint behavior', () => {
    beforeEach(() => {
      typeahead = mountTypeahead({defaultInputValue: 'Ala'});
    });

    it('does not display a hint when the input is not focused', () => {
      expect(hasFocus(typeahead)).to.equal(false);
      expect(getHint(typeahead)).to.equal('');
    });

    it('displays a hint when the input is focused', () => {
      focus(typeahead);
      expect(getHint(typeahead)).to.equal('Alabama');
    });

    it('displays a hint in multi-select mode', () => {
      typeahead.setProps({multiple: true});

      change(typeahead, 'Ala');
      focus(typeahead);

      expect(getHint(typeahead)).to.equal('Alabama');
    });

    it('does not display a hint if the menu is hidden', () => {
      focus(typeahead);

      // When focused, the typeahead should show the menu and hint text.
      expect(getMenu(typeahead).length).to.equal(1);
      expect(getHint(typeahead)).to.equal('Alabama');

      keyDown(typeahead, ESC);

      // Expect the input to remain focused, but the menu and hint to be hidden.
      expect(hasFocus(typeahead)).to.equal(true);
      expect(getMenu(typeahead).length).to.equal(0);
      expect(getHint(typeahead)).to.equal('');
    });
  });

  describe('behavior when selecting the hinted result', () => {
    let keyCode;

    beforeEach(() => {
      keyCode = 0;

      typeahead.setProps({
        /* eslint-disable-next-line prefer-destructuring */
        onKeyDown: (e) => keyCode = e.keyCode,
      });

      change(typeahead, 'Ala');
      focus(typeahead);
    });

    it('should select the hinted result on tab keydown', () => {
      keyDown(typeahead, TAB);

      expect(keyCode).to.equal(TAB);
      expect(getSelected(typeahead).length).to.equal(1);
    });

    it('should select the hinted result on right arrow keydown', () => {
      setCursorPosition(typeahead, getText(typeahead).length);
      keyDown(typeahead, RIGHT);

      expect(keyCode).to.equal(RIGHT);
      expect(getSelected(typeahead).length).to.equal(1);
    });

    it(
      'should not select the hinted result on right arrow keydown unless ' +
      'the cursor is at the end of the input value',
      () => {
        setCursorPosition(typeahead, 1);
        keyDown(typeahead, RIGHT);

        expect(keyCode).to.equal(RIGHT);
        expect(getSelected(typeahead).length).to.equal(0);
      }
    );

    it('should not select the hinted result on enter keydown', () => {
      keyDown(typeahead, RETURN);

      expect(keyCode).to.equal(RETURN);
      expect(getSelected(typeahead).length).to.equal(0);
    });

    it('should select the hinted result on enter keydown', () => {
      typeahead.setProps({selectHintOnEnter: true});
      keyDown(typeahead, RETURN);

      expect(keyCode).to.equal(RETURN);
      expect(getSelected(typeahead).length).to.equal(1);
    });
  });

  describe('behavior when selecting the active item', () => {
    beforeEach(() => {
      // Focus and navigate to the first result.
      focus(typeahead);
      keyDown(typeahead, DOWN);
      expect(getSelected(typeahead).length).to.equal(0);
    });

    it('selects the active item when pressing return', () => {
      keyDown(typeahead, RETURN);
      expect(getSelected(typeahead).length).to.equal(1);
    });

    it('selects the active item when pressing right', () => {
      keyDown(typeahead, RIGHT);
      expect(getSelected(typeahead).length).to.equal(1);
    });

    it('selects the active item when pressing tab', () => {
      keyDown(typeahead, TAB);
      expect(getSelected(typeahead).length).to.equal(1);
    });
  });

  describe('form submission', () => {
    let event;

    const onKeyDown = (e) => event = e;

    beforeEach(() => {
      event = null;
      typeahead.setProps({onKeyDown});
    });

    it('prevents form submission when the menu is open', () => {
      focus(typeahead);
      keyDown(typeahead, RETURN);

      expect(event.defaultPrevented).to.equal(true);
    });

    it('allows form submission when the menu is closed', () => {
      focus(typeahead);
      keyDown(typeahead, ESC); // Close the menu
      keyDown(typeahead, RETURN);

      expect(event.defaultPrevented).to.equal(undefined);
    });
  });

  describe('accessibility status', () => {
    let statusNode;

    beforeEach(() => {
      focus(typeahead);
      statusNode = typeahead.find('.rbt-sr-status');
    });

    it('lists the number of results when the input is focused', () => {
      expect(statusNode.text()).to.contain('50 results');
    });

    it('lists the number of selected items', () => {
      keyDown(typeahead, DOWN);
      keyDown(typeahead, RETURN);

      expect(statusNode.text()).to.contain('1 selection');
    });
  });

  describe('accessibility attributes', () => {
    it('adds an id to the menu for accessibility', () => {
      expect(getInput(typeahead).prop('aria-owns')).to.equal('');

      focus(typeahead);

      // Default id.
      expect(getMenu(typeahead).prop('id')).to.contain('rbt-menu-');
      expect(getInput(typeahead).prop('aria-owns')).to.contain('rbt-menu-');

      const menuId = 'my-id';
      typeahead.setProps({menuId});

      expect(getMenu(typeahead).prop('id')).to.equal(menuId);
      expect(getInput(typeahead).prop('aria-owns')).to.equal(menuId);
    });

    it('sets the input `role`', () => {
      // Single-select
      expect(getInput(typeahead).prop('role')).to.equal('combobox');

      // Multi-select
      typeahead.setProps({multiple: true});
      expect(getInput(typeahead).prop('role')).to.equal(undefined);
    });

    it('sets the input `aria-autocomplete` description', () => {
      // Single-select
      expect(getInput(typeahead).prop('aria-autocomplete')).to.equal('both');

      // Multi-select
      typeahead.setProps({multiple: true});
      expect(getInput(typeahead).prop('aria-autocomplete')).to.equal('list');
    });

    it('sets the input `aria-expanded` description', () => {
      // Single-select
      expect(getInput(typeahead).prop('aria-expanded')).to.equal(false);

      focus(typeahead);
      expect(getInput(typeahead).prop('aria-expanded')).to.equal(true);

      // Multi-select
      typeahead.setProps({multiple: true});
      expect(getInput(typeahead).prop('aria-expanded')).to.equal(undefined);
    });

    it('sets the input `aria-activedescendant` description', () => {
      expect(getInput(typeahead).prop('aria-activedescendant')).to.equal('');

      focus(typeahead);
      keyDown(typeahead, DOWN);

      expect(getInput(typeahead).prop('aria-activedescendant'))
        .to.equal('rbt-menu-item-0');
    });

    it('sets menu item attributes', () => {
      focus(typeahead);

      const menuItem = typeahead.find('.rbt-menu li').first();
      expect(menuItem.prop('aria-label')).to.equal('Alabama');
      expect(menuItem.prop('aria-selected')).to.equal(false);
      expect(menuItem.prop('role')).to.equal('option');

      keyDown(typeahead, DOWN);
      expect(typeahead.find('.rbt-menu li').first().prop('aria-selected'))
        .to.equal(true);
    });
  });

  describe('bodyContainer behavior', () => {
    it('renders the menu inline', () => {
      focus(typeahead);
      const menuNode = getMenu(typeahead).instance();
      expect(menuNode.parentNode.nodeName).to.equal('DIV');
    });

    it('appends the menu to the document body', () => {
      typeahead.setProps({bodyContainer: true});
      focus(typeahead);

      const menuNode = getMenu(typeahead).instance();
      expect(menuNode.parentNode.nodeName).to.equal('BODY');
    });
  });

  it('calls the public `clear` method', () => {
    const wrapper = mountTypeahead({
      defaultSelected: states.slice(0, 1),
    });

    expect(getSelected(wrapper).length).to.equal(1);
    expect(getText(wrapper)).to.equal('Alabama');

    wrapper.instance().getInstance().clear();

    expect(getSelected(wrapper).length).to.equal(0);
    expect(getText(wrapper)).to.equal('');
  });

  describe('clear-on-select behavior', () => {
    let onChange;

    afterEach(() => {
      typeahead.setProps({onChange});

      // Simulate a manual selection.
      focus(typeahead);
      getMenuItems(typeahead).first().simulate('click');

      expect(onChange.calledOnce).to.equal(true);
      expect(getSelected(typeahead).length).to.equal(0);
      expect(getText(typeahead)).to.equal('');
    });

    it('clears an uncontrolled typeahead after selection', () => {
      onChange = sinon.spy((selected) => {
        typeahead.instance().getInstance().clear();
      });
    });

    it('clears a controlled typeahead after selection', () => {
      onChange = sinon.spy((selected) => {
        typeahead.setProps({selected: []});
      });
    });
  });

  describe('`onChange` and `onInputChange` behaviors', () => {
    let onChange, onInputChange, selected;

    beforeEach(() => {
      onChange = sinon.spy();
      onInputChange = sinon.spy();
      selected = states.slice(0, 1);

      typeahead.setProps({onChange, onInputChange});

      expect(onChange.notCalled).to.equal(true);
      expect(onInputChange.notCalled).to.equal(true);
    });

    it('calls `onChange` when a menu item is clicked', () => {
      focus(typeahead);
      getMenuItems(typeahead).first().simulate('click');

      expect(onChange.calledOnce).to.equal(true);
      expect(onInputChange.notCalled).to.equal(true);
    });

    it('calls `onChange` when a menu item is selected via keyboard', () => {
      focus(typeahead);
      keyDown(typeahead, DOWN);
      keyDown(typeahead, RETURN);

      expect(onChange.calledOnce).to.equal(true);
      expect(onInputChange.notCalled).to.equal(true);
    });

    it(
      'calls `onChange` once when a menu item is selected via keyboard and ' +
      '`selectHintOnEnter={true}`',
      () => {
        typeahead.setProps({selectHintOnEnter: true});

        focus(typeahead);
        keyDown(typeahead, DOWN);
        keyDown(typeahead, RETURN);

        expect(onChange.calledOnce).to.equal(true);
      }
    );

    it('calls `onChange` when clicking the clear button', () => {
      typeahead.setProps({
        clearButton: true,
        selected,
      });
      getClearButton(typeahead).simulate('click');

      expect(onChange.calledOnce).to.equal(true);
      expect(onInputChange.notCalled).to.equal(true);
    });

    it('calls `onInputChange` when text is entered in the input', () => {
      focus(typeahead);
      change(typeahead, 'z');
      expect(onInputChange.calledOnce).to.equal(true);
    });

    it('`onInputChange` receives an event as the second param', () => {
      let event;

      typeahead.setProps({
        onInputChange: (text, e) => event = e,
      });

      focus(typeahead);
      change(typeahead, 'z');

      expect(event).to.not.equal(undefined);
    });

    it('calls `onChange` when there is a selection and text is entered', () => {
      typeahead.setProps({selected});

      expect(getSelected(typeahead).length).to.equal(1);

      focus(typeahead);
      change(typeahead, 'z');

      expect(onInputChange.calledOnce).to.equal(true);
      expect(onChange.calledOnce).to.equal(true);
      expect(getSelected(typeahead).length).to.equal(0);
    });

    it('does not call either when selections are updated via props', () => {
      typeahead.setProps({selected});
      expect(onChange.notCalled).to.equal(true);
      expect(onInputChange.notCalled).to.equal(true);
    });

    it('does not call either when `clear()` is called externally', () => {
      const wrapper = mountTypeahead({
        defaultSelected: selected,
      });

      expect(getSelected(wrapper).length).to.equal(1);
      expect(getText(wrapper)).to.equal(head(selected).name);

      wrapper.instance().getInstance().clear();

      expect(getSelected(wrapper).length).to.equal(0);
      expect(getText(wrapper)).to.equal('');
      expect(onChange.notCalled).to.equal(true);
      expect(onInputChange.notCalled).to.equal(true);
    });
  });

  it('opens the menu when the up or down arrow keys are pressed', () => {
    focus(typeahead);
    expect(getState(typeahead).showMenu).to.equal(true);

    keyDown(typeahead, ESC);
    expect(getState(typeahead).showMenu).to.equal(false);

    keyDown(typeahead, DOWN);
    expect(getState(typeahead).showMenu).to.equal(true);

    keyDown(typeahead, ESC);
    expect(getState(typeahead).showMenu).to.equal(false);

    keyDown(typeahead, UP);
    expect(getState(typeahead).showMenu).to.equal(true);
  });

  /**
   * Some basic tests for the custom menu-rendering use-case.
   * Helps ensure that the context-related logic doesn't break.
   */
  describe('behaviors when rendering a custom menu', () => {
    let wrapper;

    beforeEach(() => {
      // Render a menu with states in reverse alphabetical order.
      wrapper = mountTypeahead({
        renderMenu: (results, menuProps) => (
          <Menu {...menuProps}>
            {results.reverse().map((r, idx) => (
              /* eslint-disable-next-line react/no-array-index-key */
              <MenuItem key={idx} option={r} position={idx}>
                {r.name}
              </MenuItem>
            ))}
          </Menu>
        ),
      });
    });

    it('renders the custom menu', () => {
      focus(wrapper);

      // Make sure the rendered menu and the internal state agree.
      expect(getState(wrapper).initialItem.name).to.equal('Wyoming');
      expect(getMenuItems(wrapper).first().text()).to.equal('Wyoming');
    });

    it('shows the correct hint', () => {
      change(wrapper, 'u');
      focus(wrapper); // Focus needs to come after change.

      expect(getMenuItems(wrapper).first().text()).to.equal('Utah');
      expect(getHint(wrapper)).to.equal('utah');
    });

    it('selects the correct option', () => {
      focus(wrapper);
      keyDown(wrapper, DOWN);

      expect(getState(wrapper).activeItem.name).to.equal('Wyoming');

      keyDown(wrapper, RETURN);
      expect(getSelected(wrapper)[0].name).to.equal('Wyoming');
    });
  });

  it('renders custom content in the menu items', () => {
    typeahead.setProps({
      // Render the capital instead of the state name.
      renderMenuItemChildren: (option, props) => option.capital,
    });

    focus(typeahead);

    expect(getMenuItems(typeahead).first().text()).to.equal('Montgomery');
  });

  it('renders custom tokens', () => {
    typeahead.setProps({
      multiple: true,
      renderToken: (option, props, idx) => (
        <div className="custom-token" key={idx}>
          {option.capital}
        </div>
      ),
      selected: states.slice(0, 1),
    });

    expect(typeahead.find('.custom-token').text()).to.equal('Montgomery');
  });

  it('renders children', () => {
    const text = 'This is the child';
    const children = <div className="children">{text}</div>;

    typeahead.setProps({children});

    expect(typeahead.find('.children').text()).to.equal(text);
  });

  it('renders children via a render function', () => {
    const children = (props) => (
      <div className="children">
        The menu {props.isMenuShown ? 'is' : 'is not'} open
      </div>
    );

    typeahead.setProps({children});

    expect(typeahead.find('.children').text()).to.equal('The menu is not open');

    focus(typeahead);

    expect(typeahead.find('.children').text()).to.equal('The menu is open');
  });

  describe('validation states', () => {
    beforeEach(() => {
      typeahead.setProps({
        isInvalid: true,
        isValid: true,
      });
    });

    afterEach(() => {
      const input = typeahead.find('.form-control');

      expect(input.hasClass('is-invalid')).to.equal(true);
      expect(input.hasClass('is-valid')).to.equal(true);
    });

    it('renders with validation classnames in single-select mode', () => {
      typeahead.setProps({multiple: false});
    });

    it('renders with validation classnames in multi-select mode', () => {
      typeahead.setProps({multiple: true});
    });
  });

  describe('allowNew behavior', () => {
    let emptyLabel, newSelectionPrefix, text;

    beforeEach(() => {
      emptyLabel = 'No results...';
      newSelectionPrefix = 'New selection: ';
      text = 'xxx';

      typeahead.setProps({
        emptyLabel,
        newSelectionPrefix,
      });
    });

    it('omits the custom option when `allowNew` is set to `false`', () => {
      typeahead.setProps({
        allowNew: false,
      });

      change(typeahead, text);
      focus(typeahead);

      const menuItems = getMenuItems(typeahead);

      expect(menuItems.length).to.equal(1);
      expect(menuItems.at(0).text()).to.equal(emptyLabel);
    });

    it('adds the custom option when `allowNew` is set to `true`', () => {
      typeahead.setProps({
        allowNew: true,
      });

      change(typeahead, text);
      focus(typeahead);

      const menuItems = getMenuItems(typeahead);

      expect(menuItems.length).to.equal(1);
      expect(menuItems.at(0).text()).to.equal(`${newSelectionPrefix}${text}`);
    });

    it('omits the custom option when there is an exact text match', () => {
      text = 'North Carolina';

      typeahead.setProps({
        allowNew: true,
      });

      change(typeahead, text);
      focus(typeahead);

      const menuItems = getMenuItems(typeahead);

      expect(menuItems.length).to.equal(1);
      expect(menuItems.at(0).text()).to.equal(text);
    });

    it('adds a custom option when `allowNew` returns true', () => {
      text = 'North Carolina';

      typeahead.setProps({
        allowNew: (results, props) => true,
      });

      change(typeahead, text);
      focus(typeahead);

      const menuItems = getMenuItems(typeahead);

      expect(menuItems.length).to.equal(2);
      expect(menuItems.at(0).text()).to.equal(text);
      expect(menuItems.at(1).text()).to.equal(`${newSelectionPrefix}${text}`);
    });

    it('omits new option when `allowNew` returns false', () => {
      text = 'North Carolina';

      typeahead.setProps({
        allowNew: (results, props) => false,
      });

      change(typeahead, text);
      focus(typeahead);

      const menuItems = getMenuItems(typeahead);

      expect(menuItems.length).to.equal(1);
      expect(menuItems.at(0).text()).to.equal(text);
    });
  });
});

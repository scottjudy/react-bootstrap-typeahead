import {expect} from 'chai';
import {noop, range} from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import ReactTestUtils from 'react-dom/test-utils';

import MenuItem, {BaseMenuItem} from '../src/MenuItem';
import TypeaheadMenu from '../src/TypeaheadMenu';

import options from '../example/exampleData';

class TypeaheadContext extends React.Component {
  getChildContext() {
    return {
      activeIndex: -1,
      onActiveItemChange: noop,
      onInitialItemChange: noop,
      onMenuItemClick: noop,
    };
  }

  render() {
    return this.props.children;
  }
}

TypeaheadContext.childContextTypes = {
  activeIndex: PropTypes.number.isRequired,
  onActiveItemChange: PropTypes.func.isRequired,
  onInitialItemChange: PropTypes.func.isRequired,
  onMenuItemClick: PropTypes.func.isRequired,
};

const bigData = range(0, 300).map(option => ({name: option.toString()}));

function getMenuInstance(props={}) {
  return ReactTestUtils.renderIntoDocument(
    <TypeaheadContext>
      <TypeaheadMenu
        labelKey="name"
        options={options}
        text=""
        {...props}
      />
    </TypeaheadContext>
  );
}

function renderMenuNode(props={}) {
  const instance = getMenuInstance(props);
  return ReactTestUtils.findRenderedDOMComponentWithClass(
    instance,
    'bootstrap-typeahead-menu'
  );
}

describe('<TypeaheadMenu>', () => {

  it('renders a basic typeahead menu', () => {
    const menuNode = renderMenuNode();
    expect(menuNode).to.exist;
  });

  it('renders a right-aligned typeahead menu', () => {
    const menuNode = renderMenuNode({align: 'right'});
    expect(menuNode.className).to.contain('dropdown-menu-right');
  });

  it('renders a menu with a max-height of 200px', () => {
    const menuNode = renderMenuNode({maxHeight: 200});
    expect(menuNode.style.maxHeight).to.equal('200px');
  });

  it ('renders disabled menu items', () => {
    const disabledOptions = options.map(option => (
      {...option, disabled: true}
    ));
    const instance = getMenuInstance({options: disabledOptions});
    const menuItems = ReactTestUtils.scryRenderedComponentsWithType(
      instance,
      MenuItem
    );
    expect(menuItems[0].props.disabled).to.equal(true);
  });

  it('renders an empty state when there are no results', () => {
    const instance = getMenuInstance({options: []});
    const menuItems = ReactTestUtils.scryRenderedComponentsWithType(
      instance,
      BaseMenuItem
    );

    expect(menuItems.length).to.equal(1);
    expect(menuItems[0].props.children).to.equal('No matches found.');
  });

  it('renders nothing when there are no results and an empty string is ' +
     'passed as the `emptyLabel`', () => {
    const instance = getMenuInstance({options: [], emptyLabel: ''});
    const menuComponents = ReactTestUtils.scryRenderedDOMComponentsWithClass(
      instance,
      'bootstrap-typeahead-menu'
    );

    expect(menuComponents.length).to.equal(0);
  });

  it('displays a paginator', () => {
    const instance = getMenuInstance({
      options: bigData,
      paginate: true,
    });
    const paginatorNode = ReactTestUtils.findRenderedDOMComponentWithClass(
      instance,
      'bootstrap-typeahead-menu-paginator'
    );
    expect(paginatorNode).to.exist;
    expect(paginatorNode.firstChild.innerHTML).to.equal(
      'Display additional results...'
    );
  });

  it('does not show a paginator when there are no results', () => {
    const instance = getMenuInstance({
      options: [],
      paginate: true,
    });
    const paginatorNodes = ReactTestUtils.scryRenderedDOMComponentsWithClass(
      instance,
      'bootstrap-typeahead-menu-paginator'
    );
    expect(paginatorNodes.length).to.equal(0);
  });

  it('does not show a paginator if `paginate=false`', () => {
    const instance = getMenuInstance({
      options: bigData,
      paginate: false,
    });
    const paginatorNodes = ReactTestUtils.scryRenderedDOMComponentsWithClass(
      instance,
      'bootstrap-typeahead-menu-paginator'
    );
    expect(paginatorNodes.length).to.equal(0);
  });

  it('displays custom pagination text', () => {
    const paginationText = 'See All';
    const instance = getMenuInstance({
      options: bigData,
      paginationText,
    });
    const paginatorNode = ReactTestUtils.findRenderedDOMComponentWithClass(
      instance,
      'bootstrap-typeahead-menu-paginator'
    );
    expect(paginatorNode.firstChild.innerHTML).to.equal(paginationText);
  });

});

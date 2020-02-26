import { mount } from 'enzyme';
import React from 'react';

import MenuItem, { BaseMenuItem } from '../../src/components/MenuItem.react';
import TypeaheadMenu from '../../src/components/TypeaheadMenu.react';
import TypeaheadInner from '../../src/core/TypeaheadInner';

import options from '../../example/exampleData';
import { context, getMenu, getPaginator } from '../helpers';

describe('<TypeaheadMenu>', () => {
  let menu;

  beforeEach(() => {
    menu = mount(
      <TypeaheadInner
        {...context}
        options={options}
        selected={[]}>
        {(props) => (
          <TypeaheadMenu
            {...props}
            id="menu-id"
            labelKey="name"
            text=""
          />
        )}
      </TypeaheadInner>
    );
  });

  test('renders a basic typeahead menu', () => {
    expect(menu.find('ul').hasClass('rbt-menu')).toBe(true);
    expect(menu.find(MenuItem).length).toBe(options.length);
  });

  test('renders a menu with the specified max-height', () => {
    const getMaxHeight = (wrapper) => getMenu(wrapper).prop('style').maxHeight;

    menu.setProps({ maxHeight: '200px' });
    expect(getMaxHeight(menu)).toBe('200px');

    menu.setProps({ maxHeight: '50%' });
    expect(getMaxHeight(menu)).toBe('50%');
  });

  test('renders disabled menu items', () => {
    menu.setProps({ options: options.map((o) => ({ ...o, disabled: true })) });
    expect(menu.find(MenuItem).first().prop('disabled')).toBe(true);
  });

  test('renders an empty state when there are no results', () => {
    const emptyLabel = 'No matches found.';

    const menuItems = menu
      .setProps({ emptyLabel, options: [] })
      .find(BaseMenuItem);

    expect(menuItems.length).toBe(1);
    expect(menuItems.first().text()).toBe(emptyLabel);
  });

  describe('pagination behaviors', () => {
    let paginationLabel;

    beforeEach(() => {
      paginationLabel = 'More results...';
      menu.setProps({
        maxResults: 10,
        onPaginate: () => {},
        options: options.concat({
          name: paginationLabel,
          paginationOption: true,
        }),
      });
    });

    test('displays a paginator', () => {
      const paginatorNode = getPaginator(menu);
      expect(paginatorNode.length).toBe(1);
      expect(paginatorNode.text()).toBe(paginationLabel);
    });

    test('does not show a paginator when there are no results', () => {
      menu.setProps({ options: [] });
      expect(getPaginator(menu).length).toBe(0);
    });
  });
});

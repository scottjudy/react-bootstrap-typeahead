import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import { noop, pick } from 'lodash';
import React from 'react';
import sinon from 'sinon';

import MenuItem, { BaseMenuItem } from '../../src/components/MenuItem.react';
import TypeaheadInner from '../../src/core/TypeaheadInner';
import { context } from '../helpers';

const event = {
  preventDefault: noop,
};

describe('<BaseMenuItem>', () => {
  let baseMenuItem, onClick;

  beforeEach(() => {
    onClick = sinon.spy();
    baseMenuItem = shallow(
      <BaseMenuItem onClick={onClick}>
        This is a base menu item.
      </BaseMenuItem>
    );
  });

  it('renders a base menu item', () => {
    expect(baseMenuItem).to.not.equal(undefined);
    expect(baseMenuItem.type()).to.equal('li');
  });

  it('renders an active base menu item', () => {
    baseMenuItem.setProps({ active: true });
    expect(baseMenuItem.hasClass('active')).to.equal(true);
  });

  it('triggers an event when clicked', () => {
    baseMenuItem.find('a').simulate('click', event);
    expect(onClick.calledOnce).to.equal(true);
  });

  it('renders a disabled base menu item', () => {
    baseMenuItem.setProps({ disabled: true });
    baseMenuItem.find('a').simulate('click', event);

    expect(baseMenuItem.hasClass('disabled')).to.equal(true);
    expect(onClick.notCalled).to.equal(true);
  });
});

describe('<MenuItem>', () => {
  let menuItem, onClick;

  beforeEach(() => {
    const contextProps = pick(context, [
      'activeIndex',
      'isOnlyResult',
      'onActiveItemChange',
      'onInitialItemChange',
      'onMenuItemClick',
      'results',
    ]);

    onClick = sinon.spy();
    menuItem = mount(
      <TypeaheadInner
        {...contextProps}
        selected={[]}>
        {(props) => (
          <MenuItem
            {...props}
            onClick={onClick}
            option={{ label: 'test' }}
            position={0}>
            This is a menu item.
          </MenuItem>
        )}
      </TypeaheadInner>
    );
  });

  it('renders a menu item', () => {
    expect(menuItem).to.not.equal(undefined);
    expect(menuItem.find('a')).to.have.length(1);
  });

  it('changes the active state of the menu item', () => {
    expect(menuItem.hasClass('active')).to.equal(false);

    menuItem.setProps({ activeIndex: 0 });
    expect(menuItem.find('a').hasClass('active')).to.equal(true);
  });

  it('sets the active state if it is the only result', () => {
    expect(menuItem.hasClass('active')).to.equal(false);

    menuItem.setProps({
      highlightOnlyResult: true,
      results: ['test'],
    });
    expect(menuItem.find('a').hasClass('active')).to.equal(true);
  });

  it('triggers an event when clicked', () => {
    menuItem.find('a').simulate('click', event);
    expect(onClick.calledOnce).to.equal(true);
  });
});

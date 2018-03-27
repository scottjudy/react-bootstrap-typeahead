import {expect} from 'chai';
import {shallow} from 'enzyme';
import React from 'react';

import Menu from '../../src/Menu';
import MenuItem, {BaseMenuItem} from '../../src/MenuItem';

describe('<Menu>', () => {
  let menu;

  beforeEach(() => {
    const options = [
      {label: 'Item 1'},
      {label: 'Item 2'},
      {label: 'Item 3'},
    ];

    menu = shallow(
      <Menu id="menu-id" paginate={false}>
        {options.map((o, idx) => (
          <MenuItem
            key={idx}
            option={o}
            position={idx}>
            {o.label}
          </MenuItem>
        ))}
      </Menu>
    );
  });

  it('renders a basic menu with menu items', () => {
    expect(menu.hasClass('rbt-menu dropdown-menu')).to.equal(true);
    expect(menu.children().length).to.equal(3);
  });

  it('changes the horizontal and vertical positioning', () => {
    expect(menu.prop('placement')).to.equal('bottom-start');

    menu.setProps({align: 'right'});
    expect(menu.prop('placement')).to.equal('bottom-end');

    menu.setProps({align: 'left'});
    expect(menu.prop('placement')).to.equal('bottom-start');

    menu.setProps({dropup: true});
    expect(menu.prop('placement')).to.equal('top-start');
  });

  it('sets the maxHeight and other styles', () => {
    let maxHeight = '100px';

    function getAttribute(wrapper, attribute) {
      return wrapper.prop('style')[attribute];
    }

    menu.setProps({
      maxHeight,
      style: {backgroundColor: 'red'},
    });

    expect(getAttribute(menu, 'backgroundColor')).to.equal('red');
    expect(getAttribute(menu, 'maxHeight')).to.equal(maxHeight);

    maxHeight = '75%';
    menu.setProps({maxHeight});
    expect(getAttribute(menu, 'maxHeight')).to.equal(maxHeight);
  });

  it('renders an empty label when there are no children', () => {
    const emptyLabel = 'No matches.';
    menu.setProps({
      children: undefined,
      emptyLabel,
    });

    expect(menu.children().length).to.equal(1);

    const emptyLabelItem = menu.find(BaseMenuItem);
    expect(emptyLabelItem.length).to.equal(1);
    expect(emptyLabelItem.prop('disabled')).to.equal(true);

    // See: http://airbnb.io/enzyme/docs/api/ShallowWrapper/dive.html
    expect(emptyLabelItem.dive().text()).to.equal(emptyLabel);
  });
});

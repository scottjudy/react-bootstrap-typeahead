import { shallow } from 'enzyme';
import React from 'react';

import Loader from '../../src/components/Loader.react';

describe('<Loader>', () => {
  let loader;

  beforeEach(() => {
    loader = shallow(<Loader />);
  });

  test('renders a default loading indicator', () => {
    expect(loader.type()).toBe('div');
    expect(loader.hasClass('rbt-loader')).toBe(true);
  });

  test('renders a small loading indicator', () => {
    loader.setProps({ bsSize: 'small' });
    expect(loader.hasClass('rbt-loader-sm')).toBe(true);
  });

  test('renders a large loading indicator', () => {
    loader.setProps({ bsSize: 'large' });
    expect(loader.hasClass('rbt-loader-lg')).toBe(true);
  });
});

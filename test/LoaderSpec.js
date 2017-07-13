import {expect} from 'chai';
import React from 'react';
import ReactShallowRenderer from 'react-test-renderer/shallow';

import Loader from '../src/Loader';

describe('<Loader>', () => {

  it('renders a default loading indicator', () => {
    const renderer = new ReactShallowRenderer();
    renderer.render(<Loader />);
    const result = renderer.getRenderOutput();

    expect(result.type).to.equal('div');
    expect(result.props.className).to.equal('rbt-loader');
  });

  it('renders a small loading indicator', () => {
    const renderer = new ReactShallowRenderer();
    renderer.render(<Loader bsSize="small" />);
    const result = renderer.getRenderOutput();

    expect(result.props.className).to.contain('rbt-loader-sm');
  });

  it('renders a large loading indicator', () => {
    const renderer = new ReactShallowRenderer();
    renderer.render(<Loader bsSize="large" />);
    const result = renderer.getRenderOutput();

    expect(result.props.className).to.contain('rbt-loader-lg');
  });

});

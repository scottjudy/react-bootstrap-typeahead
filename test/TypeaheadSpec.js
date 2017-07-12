import {expect} from 'chai';
import {range} from 'lodash';
import React from 'react';
import {render} from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import TokenizerInput from '../src/TokenizerInput';
import Typeahead from '../src/Typeahead';
import TypeaheadInput from '../src/TypeaheadInput';
import {RETURN} from '../src/utils/keyCode';

import states from '../example/exampleData';

const bigData = range(0, 500).map(o => o.toString());

let baseProps = {
  options: [],
};

function getInputNode(instance) {
  return ReactTestUtils.findRenderedDOMComponentWithClass(
    instance,
    'bootstrap-typeahead-input-main'
  );
}

function getMenuNode(instance) {
  return ReactTestUtils.findRenderedDOMComponentWithClass(
    instance,
    'bootstrap-typeahead-menu'
  );
}

function getTypeaheadInstance(props) {
  return ReactTestUtils.renderIntoDocument(<Typeahead {...props} />);
}

function simulateFormSubmit(instance) {
  const inputNode = getInputNode(instance);
  ReactTestUtils.Simulate.focus(inputNode);
  ReactTestUtils.Simulate.keyDown(inputNode, {
    key: 'Enter', keyCode: RETURN, which: RETURN,
  });
}

class FormWrapper extends React.Component {
  render() {
    return (
      <form onKeyDown={this.props.onKeyDown}>
        <Typeahead {...this.props} />
      </form>
    );
  }
}

function getFormWithTypeaheadInstance(props) {
  return ReactTestUtils.renderIntoDocument(<FormWrapper {...props}/>);
}

describe('<Typeahead>', () => {

  it('should have a TypeaheadInput', () => {
    const instance = getTypeaheadInstance(baseProps);
    const input = ReactTestUtils.findRenderedComponentWithType(
      instance,
      TypeaheadInput
    );

    expect(input).to.exist;
  });

  it('should have a TokenizerInput when `multiple` is `true`', () => {
    const instance = getTypeaheadInstance({
      ...baseProps,
      multiple: true,
    });
    const tokenizer = ReactTestUtils.findRenderedComponentWithType(
      instance,
      TokenizerInput
    );

    expect(tokenizer).to.exist;
  });

  it(
    'should display tokens when selections are passed into the tokenizer',
    () => {
      const instance = getTypeaheadInstance({
        labelKey: 'name',
        multiple: true,
        options: states,
        selected: states.slice(0, 3),
      });
      const tokens = ReactTestUtils.scryRenderedDOMComponentsWithClass(
        instance,
        'token'
      );

      expect(tokens.length).to.equal(3);
    }
  );

  it('should display a menu when the input is focused', () => {
    const instance = getTypeaheadInstance(baseProps);
    const inputNode = getInputNode(instance);
    ReactTestUtils.Simulate.focus(inputNode);

    const menuNode = getMenuNode(instance);

    expect(menuNode).to.exist;
  });

  it('should not display a menu on focus when `minLength = 1`', () => {
    const instance = getTypeaheadInstance({
      ...baseProps,
      minLength: 1,
    });
    const inputNode = getInputNode(instance);
    ReactTestUtils.Simulate.focus(inputNode);

    const menuNode = ReactTestUtils.scryRenderedDOMComponentsWithClass(
      instance,
      'bootstrap-typeahead-menu'
    );

    expect(menuNode.length).to.equal(0);
  });

  it('should disable the input if the component is disabled', () => {
    const instance = getTypeaheadInstance({
      ...baseProps,
      disabled: true,
    });
    const input = ReactTestUtils.findRenderedComponentWithType(
      instance,
      TypeaheadInput
    );

    expect(input.props.disabled).to.be.true;
  });

  it('should have a menu item for pagination', () => {
    let didPaginate = false;
    const onPaginate = () => didPaginate = true;
    const paginationText = 'See More';

    const instance = getTypeaheadInstance({
      onPaginate,
      options: bigData,
      paginationText,
    });
    const inputNode = getInputNode(instance);
    ReactTestUtils.Simulate.focus(inputNode);

    // Get the anchor node, not the `<li>`
    const paginatorAnchorNode =
      ReactTestUtils.findRenderedDOMComponentWithClass(
        instance,
        'bootstrap-typeahead-menu-paginator'
      ).firstChild;

    ReactTestUtils.Simulate.click(paginatorAnchorNode);

    expect(paginatorAnchorNode).to.exist;
    expect(paginatorAnchorNode.innerHTML).to.equal(paginationText);
    expect(didPaginate).to.equal(true);
  });

  it('should not have a menu item for pagination', () => {
    const instance = ReactTestUtils.renderIntoDocument(
      <Typeahead options={bigData} paginate={false} />
    );
    const inputNode = getInputNode(instance);
    ReactTestUtils.Simulate.focus(inputNode);

    const paginatorNodes = ReactTestUtils.scryRenderedDOMComponentsWithClass(
      instance,
      'bootstrap-typeahead-menu-paginator'
    );

    expect(paginatorNodes.length).to.equal(0);
  });

  describe('should limit the results when `maxResults` is set', () => {
    const labelKey = 'name';
    const maxResults = 5;

    it('should limit results when `paginate=true`', () => {
      const instance = getTypeaheadInstance({
        ...baseProps,
        labelKey,
        maxResults,
        options: states,
      });

      const inputNode = getInputNode(instance);
      ReactTestUtils.Simulate.focus(inputNode);

      const menuItems = ReactTestUtils.scryRenderedDOMComponentsWithTag(
        instance,
        'LI'
      );

      // When `paginate` is true, it adds 2 menu items to the menu: one for the
      // divider and one for the paginator.
      expect(menuItems.length).to.equal(maxResults + 2);
    });

    it('should limit results when `paginate=false`', () => {
      const instance = getTypeaheadInstance({
        ...baseProps,
        labelKey,
        maxResults,
        options: states,
        paginate: false,
      });

      const inputNode = getInputNode(instance);
      ReactTestUtils.Simulate.focus(inputNode);

      const menuItems = ReactTestUtils.scryRenderedDOMComponentsWithTag(
        instance,
        'LI'
      );

      // When `paginate` is true, it adds 2 menu items to the menu: one for the
      // divider and one for the paginator.
      expect(menuItems.length).to.equal(maxResults);
    });
  });

  it('should add the `dropup` className when `dropup=true`', () => {
    const instance = getTypeaheadInstance({...baseProps, dropup: true});
    const TypeaheadNode = ReactTestUtils.findRenderedDOMComponentWithClass(
      instance,
      'dropup'
    );

    expect(TypeaheadNode).to.exist;
  });

  it('should set the size of the typeahead input', () => {
    const instance = getTypeaheadInstance({...baseProps, bsSize: 'large'});
    const InputNode = ReactTestUtils.findRenderedDOMComponentWithClass(
      instance,
      'bootstrap-typeahead-input-main input-lg'
    );

    expect(InputNode).to.exist;
  });

  it('displays a loader when `isLoading=true`', () => {
    const instance = getTypeaheadInstance({...baseProps, isLoading: true});
    const LoaderNode = ReactTestUtils.findRenderedDOMComponentWithClass(
      instance,
      'bootstrap-typeahead-loader'
    );
    const InputNode = ReactTestUtils.findRenderedDOMComponentWithClass(
      instance,
      'bootstrap-typeahead-input-main has-aux'
    );

    expect(LoaderNode).to.exist;
    expect(InputNode).to.exist;
  });

  it('displays a clear button when `clearButton=true` and there is a ' +
     'selection', () => {
    const instance = getTypeaheadInstance({
      ...baseProps,
      clearButton: true,
      labelKey: 'name',
      options: states,
      selected: states.slice(0, 1),
    });
    const ClearButtonNode = ReactTestUtils.findRenderedDOMComponentWithClass(
      instance,
      'bootstrap-typeahead-clear-button'
    );
    const InputNode = ReactTestUtils.findRenderedDOMComponentWithClass(
      instance,
      'bootstrap-typeahead-input-main has-aux'
    );

    expect(ClearButtonNode).to.exist;
    expect(InputNode).to.exist;
  });

  describe('updates when re-rendering with new props', () => {
    let node, selected, text;

    const labelKey = 'name';
    const props = {
      labelKey,
      onChange: s => selected = s,
      onInputChange: t => text = t,
      options: states,
    };

    beforeEach(() => {
      node = document.createElement('div');
      render(<Typeahead {...props} />, node);
    });

    it('acts as a controlled input in single-select mode', () => {
      const selected1 = states.slice(0, 1);
      const selected2 = states.slice(1, 2);

      // Pass in new selection
      render(<Typeahead {...props} selected={selected1} />, node);

      expect(selected).to.deep.equal(selected1);
      expect(text).to.equal(selected1[0][labelKey]);

      // Pass in another new selection
      render(<Typeahead {...props} selected={selected2} />, node);

      expect(selected).to.deep.equal(selected2);
      expect(text).to.equal(selected2[0][labelKey]);

      // "Clear" the component
      render(<Typeahead {...props} selected={[]} />, node);

      expect(selected).to.deep.equal([]);
      expect(text).to.equal('');
    });

    it('acts as a controlled input in multi-select mode', () => {
      const selected1 = states.slice(0, 4);

      // Pass in new selection
      render(<Typeahead {...props} multiple selected={selected1} />, node);

      expect(selected).to.deep.equal(selected1);
      expect(text).to.equal('');

      // "Clear" the component
      render(<Typeahead {...props} multiple selected={[]} />, node);

      expect(selected).to.deep.equal([]);
      expect(text).to.equal('');
    });

    it('updates the selections when going from multi- to single-select', () => {
      const multiSelections = states.slice(0, 4);
      render(
        <Typeahead {...props} multiple selected={multiSelections} />,
        node
      );
      expect(selected).to.deep.equal(multiSelections);

      render(<Typeahead {...props} />, node);
      expect(selected).to.deep.equal(states.slice(0, 1));
    });
  });

  describe('form integration', () => {
    let onKeyDownEvent;

    beforeEach(() => {
      onKeyDownEvent = null;
    });

    const onKeyDown = e => onKeyDownEvent = e;

    /**
     * Since react test simulation doesn't trigger form submit on RETURN press,
     * we should handle keyDown event on form level and test whether default was
     * prevented or not.
     */
    it('should not submit form when `submitFormOnEnter=false', () => {
      const instance = getFormWithTypeaheadInstance({
        ...baseProps,
        submitFormOnEnter: false,
        onKeyDown,
      });
      simulateFormSubmit(instance);

      expect(onKeyDownEvent.defaultPrevented).to.equal(true);
    });

    it('should submit form when `submitFormOnEnter=true', () => {
      const instance = getFormWithTypeaheadInstance({
        ...baseProps,
        submitFormOnEnter: true,
        onKeyDown,
      });
      simulateFormSubmit(instance);

      expect(onKeyDownEvent.defaultPrevented).to.equal(undefined);
    });
  });

});

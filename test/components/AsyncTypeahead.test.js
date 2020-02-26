import { mount } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import { AsyncTypeahead } from '../../src';
import { change, focus, getMenuItems, keyDown } from '../helpers';
import { DOWN, RETURN } from '../../src/constants';

function search(wrapper, query, callback) {
  change(wrapper, query);
  wrapper.setProps({ isLoading: true });

  setTimeout(() => {
    wrapper.setProps({ isLoading: false });
    callback();
  }, 0);
}

describe('<AsyncTypeahead>', () => {
  let onSearch, wrapper;

  beforeEach(() => {
    onSearch = jest.fn();
    wrapper = mount(
      <AsyncTypeahead
        delay={0}
        id="async-example"
        isLoading={false}
        minLength={0}
        onChange={noop}
        onSearch={onSearch}
        selected={[]}
      />
    );
  });

  test('displays a prompt', () => {
    const promptText = 'Prompt text';

    wrapper.setProps({ promptText });

    focus(wrapper);
    const menuItems = getMenuItems(wrapper);

    expect(menuItems.length).toBe(1);
    expect(menuItems.text()).toBe(promptText);
  });

  test('displays the search text while searching', (done) => {
    const searchText = 'Search text';

    onSearch = () => {
      wrapper.setProps({ isLoading: true });

      const menuItems = getMenuItems(wrapper);
      expect(menuItems.length).toBe(1);
      expect(menuItems.text()).toBe(searchText);
      done();
    };

    wrapper.setProps({
      onSearch,
      searchText,
    });

    change(wrapper, 'search');
  });

  test('displays the empty label when there are no results', (done) => {
    const emptyLabel = 'empty label';

    wrapper.setProps({
      emptyLabel,
      useCache: false,
    });

    search(wrapper, 'search', () => {
      const menuItems = getMenuItems(wrapper);
      expect(menuItems.length).toBe(1);
      expect(menuItems.text()).toBe(emptyLabel);
      done();
    });
  });

  test('displays the empty label when the input has an initial value', () => {
    const emptyLabel = 'empty label';

    wrapper = mount(
      <AsyncTypeahead
        defaultInputValue="sometext"
        delay={0}
        emptyLabel={emptyLabel}
        isLoading={false}
        minLength={0}
        onSearch={onSearch}
        useCache={false}
      />
    );

    focus(wrapper);
    const menuItems = getMenuItems(wrapper);

    expect(menuItems.length).to.equal(1);
    expect(menuItems.text()).to.equal(emptyLabel);
  });

  test('delays the search by at least the specified amount', (done) => {
    const delay = 100;
    const preSearch = Date.now();

    onSearch = () => {
      expect(Date.now() - preSearch).toBeGreaterThanOrEqual(delay);
      done();
    };

    // Re-mount since delay is applied in `componentDidMount`.
    wrapper = mount(
      <AsyncTypeahead
        delay={delay}
        id="async-example"
        isLoading={false}
        onSearch={onSearch}
      />
    );

    // Perform search.
    change(wrapper, 'search');
  });

  test('does not call onSearch when a selection is made', () => {
    const onChange = jest.fn();

    wrapper.setProps({
      onChange,
      options: ['one', 'two', 'four'],
    });

    focus(wrapper);
    keyDown(wrapper, DOWN);
    keyDown(wrapper, RETURN);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledTimes(0);
  });

  test('uses cached results and does not perform a new search', (done) => {
    let menuItems;
    let callCount = 0;

    onSearch = (options, callback) => (query) => {
      callCount += 1;

      wrapper.setProps({ isLoading: true });

      setTimeout(() => {
        wrapper.setProps({
          isLoading: false,
          options,
        });
        callback();
      }, 0);
    };

    wrapper.setProps({
      onSearch: onSearch(['test-one', 'test-two', 'test-three'], () => {
        focus(wrapper);
        menuItems = getMenuItems(wrapper);
        expect(menuItems.length).toBe(3);
        expect(callCount).toBe(1);

        wrapper.setProps({
          onSearch: onSearch([], () => {
            focus(wrapper);
            menuItems = getMenuItems(wrapper);
            expect(menuItems.length).toBe(1);
            expect(menuItems.text()).toBe('No matches found.');
            expect(callCount).toBe(2);

            // Repeat first search
            change(wrapper, 'test');
            setTimeout(() => {
              focus(wrapper);
              menuItems = getMenuItems(wrapper);
              expect(menuItems.length).toBe(3);
              expect(callCount).toBe(2);
              done();
            }, 0);
          }),
        });

        // Second search
        change(wrapper, 'test!');
      }),
    });

    // First search
    change(wrapper, 'test');
  });

  test('does not use cached results', (done) => {
    wrapper.setProps({
      useCache: false,
    });

    // Initial search
    search(wrapper, 'search', () => {
      expect(onSearch).toHaveBeenCalledTimes(1);

      // Perform the search again.
      search(wrapper, 'search', () => {
        expect(onSearch).toHaveBeenCalledTimes(2);
        done();
      });
    });
  });

  test('does not call `onSearch` with an empty query', (done) => {
    const onInputChange = jest.fn();

    wrapper.setProps({
      onInputChange,
    });

    search(wrapper, '', () => {
      expect(onInputChange).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledTimes(0);
      done();
    });
  });

  test('does not call `onSearch` if query is less than `minLength`', (done) => {
    const onInputChange = jest.fn();

    wrapper.setProps({
      minLength: 2,
      onInputChange,
    });

    search(wrapper, 'x', () => {
      expect(onInputChange).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledTimes(0);
      done();
    });
  });

  test('performs a search when there is already a selection', (done) => {
    wrapper.setProps({
      multiple: true,
      options: ['one', 'two'],
      selected: ['one'],
    });

    expect(onSearch).toHaveBeenCalledTimes(0);

    search(wrapper, 'two', () => {
      expect(onSearch).toHaveBeenCalledTimes(1);
      done();
    });
  });

  test('receives an event as the second argument of `onInputChange`', () => {
    wrapper.setProps({
      onInputChange: (text, e) => {
        expect(text).toBe('x');
        expect(e).toBeDefined();
      },
    });

    change(wrapper, 'x');
  });

  test(
    'displays a custom option when `allowNew` function returns true',
    (done) => {
      wrapper.setProps({
        allowNew: (results, props) => true,
      });

      change(wrapper, 'zzz');

      setTimeout(() => {
        wrapper.setProps({ isLoading: true });

        focus(wrapper);
        const menuItems = getMenuItems(wrapper);

        expect(menuItems.length).toBe(1);
        expect(menuItems.at(0).text()).toMatch(/zzz/);
        done();
      }, 0);
    }
  );

  test('disables `allowNew` while results are loading', (done) => {
    wrapper.setProps({
      allowNew: true,
    });

    change(wrapper, 'zzz');

    setTimeout(() => {
      wrapper.setProps({ isLoading: true });

      focus(wrapper);
      const menuItems = getMenuItems(wrapper);
      expect(menuItems.length).toBe(1);
      expect(menuItems.at(0).text()).toBe('Searching...');

      wrapper.setProps({ isLoading: false });
      expect(getMenuItems(wrapper).at(0).text()).toMatch(/zzz/);
      done();
    }, 0);
  });

  test('makes the typehead instance and public methods available', () => {
    const instance = wrapper.instance().getInstance();

    expect(typeof instance.clear).toBe('function');
    expect(typeof instance.blur).toBe('function');
    expect(typeof instance.focus).toBe('function');
    expect(typeof instance.getInput).toBe('function');
  });

  test('resets instance properties on unmount', () => {
    /* eslint-disable no-underscore-dangle */
    const instance = wrapper.instance();
    const cancel = jest.fn();

    // Modify values
    instance._cache = null;
    instance._query = 'test';
    instance._handleSearchDebounced.cancel = cancel;

    wrapper.unmount();

    expect(instance._cache).toEqual({});
    expect(instance._query).toBe('');
    expect(cancel).toHaveBeenCalledTimes(1);
    /* eslint-enable no-underscore-dangle */
  });
});

import {noop} from 'lodash';
import PropTypes from 'prop-types';

export const childContextTypes = {
  activeIndex: PropTypes.number.isRequired,
  hintText: PropTypes.string.isRequired,
  isOnlyResult: PropTypes.bool.isRequired,
  onActiveItemChange: PropTypes.func.isRequired,
  onInitialItemChange: PropTypes.func.isRequired,
  onMenuItemClick: PropTypes.func.isRequired,
};

export const context = {
  activeIndex: -1,
  hintText: '',
  isOnlyResult: false,
  onActiveItemChange: noop,
  onInitialItemChange: noop,
  onMenuItemClick: noop,
};

// Make sure e.persist() is present in events.
const baseEvent = {
  persist: noop,
};

/* Events */
export function focus(wrapper) {
  getInput(wrapper).simulate('focus', baseEvent);
}

export function keyDown(wrapper, value) {
  getInput(wrapper).simulate('keyDown', {
    ...baseEvent,
    keyCode: value,
    which: value,
  });
}

export function change(wrapper, value) {
  // Calling `simulate` doesn't actually change the value, so call the
  // `onChange` prop directly: https://github.com/airbnb/enzyme/issues/1412
  getInput(wrapper).prop('onChange')({...baseEvent, target: {value}});
}


/* Finding React Elements */
export function getHint(wrapper) {
  return wrapper.find('.rbt-input-hint').prop('value');
}

export function getInput(wrapper) {
  return wrapper.find('.rbt-input-main');
}

export function getMenu(wrapper) {
  return wrapper.find('.rbt-menu').hostNodes();
}

export function getMenuItems(wrapper) {
  // Rather than finding the <li> node, find the <a> so we can simulate clicks
  // if needed. This also skips over things like menu item dividers.
  return wrapper.find('a.dropdown-item');
}

export function getPaginator(wrapper) {
  return wrapper.find('.rbt-menu-pagination-option').hostNodes();
}

export function getTokens(wrapper) {
  return wrapper.find('.rbt-token');
}


/* Other Functions */
export function search(wrapper, query, callback) {
  change(wrapper, query);
  setTimeout(callback, 100);
}

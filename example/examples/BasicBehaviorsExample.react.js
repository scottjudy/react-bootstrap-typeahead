import React, {Fragment} from 'react';
import {FormGroup} from 'react-bootstrap';

import Control from '../components/Control';
import {Typeahead} from '../../src/';

import options from '../../example/exampleData';

/* example-start */
class BasicBehaviorsExample extends React.Component {
  state = {
    disabled: false,
    dropup: false,
    flip: false,
    highlightOnlyResult: false,
    minLength: 0,
    selectHintOnEnter: false,
  };

  render() {
    const {
      disabled,
      dropup,
      emptyLabel,
      flip,
      highlightOnlyResult,
      minLength,
      selectHintOnEnter,
    } = this.state;

    const checkboxes = [
      /* eslint-disable max-len */
      {checked: disabled, children: 'Disable the input', name: 'disabled'},
      {checked: dropup, children: 'Dropup menu', name: 'dropup'},
      {checked: flip, children: 'Flip the menu position when it reaches the viewport bounds', name: 'flip'},
      {checked: !!minLength, children: 'Require minimum input before showing results (2 chars)', name: 'minLength'},
      {checked: emptyLabel, children: 'Hide the menu when there are no results', name: 'emptyLabel'},
      {checked: selectHintOnEnter, children: 'Select the hinted result by pressing enter', name: 'selectHintOnEnter'},
      {checked: highlightOnlyResult, children: 'Highlight the only result', name: 'highlightOnlyResult'},
      /* eslint-enable max-len */
    ];

    return (
      <Fragment>
        <Typeahead
          {...this.state}
          emptyLabel={emptyLabel ? '' : undefined}
          labelKey="name"
          options={options}
          placeholder="Choose a state..."
        />
        <FormGroup>
          {checkboxes.map((props) => (
            <Control
              {...props}
              key={props.name}
              onChange={this._handleChange}
              type="checkbox"
            />
          ))}
        </FormGroup>
      </Fragment>
    );
  }

  _handleChange = (e) => {
    const {checked, name} = e.target;
    const newState = {[name]: checked};

    if (name === 'minLength') {
      newState.minLength = checked ? 2 : 0;
    }

    this.setState(newState);
  }
}
/* example-end */

export default BasicBehaviorsExample;

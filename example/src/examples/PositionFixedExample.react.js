/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */

import React, { Fragment } from 'react';
import { FormGroup } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';

import Control from '../components/Control.react';
import options from '../data';

/* example-start */
class PositionFixedExample extends React.Component {
  state = {
    positionFixed: true,
  };

  render() {
    const { positionFixed } = this.state;

    return (
      <Fragment>
        <div
          style={{
            border: '1px solid #ddd',
            height: '116px',
            overflowY: 'scroll',
            padding: '40px',
          }}>
          <div style={{ height: '300px' }}>
            <Typeahead
              {...this.state}
              id="position-fixed-example"
              labelKey="name"
              options={options}
              placeholder="Choose a state..."
            />
          </div>
        </div>
        <FormGroup>
          <Control
            checked={positionFixed}
            name="positionFixed"
            onChange={this._handleChange}
            type="checkbox">
            Use fixed positioning
          </Control>
        </FormGroup>
      </Fragment>
    );
  }

  _handleChange = (e) => {
    const { checked, name } = e.target;
    this.setState({ [name]: checked });
  }
}
/* example-end */

export default PositionFixedExample;

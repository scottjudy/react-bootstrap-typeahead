/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */

import React, { Fragment } from 'react';
import { FormGroup } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';

import Control from '../components/Control.react';
import options from '../data';

/* example-start */
class MenuAlignExample extends React.Component {
  state = {
    align: 'justify',
  };

  render() {
    const { align } = this.state;
    const radios = [
      { label: 'Justify (default)', value: 'justify' },
      { label: 'Align left', value: 'left' },
      { label: 'Align right', value: 'right' },
    ];

    return (
      <Fragment>
        <Typeahead
          align={align}
          id="menu-align-example"
          labelKey="name"
          options={options}
          placeholder="Choose a state..."
        />
        <FormGroup>
          {radios.map(({ label, value }) => (
            <Control
              checked={align === value}
              key={value}
              onChange={(e) => this.setState({ align: value })}
              type="radio"
              value={value}>
              {label}
            </Control>
          ))}
        </FormGroup>
      </Fragment>
    );
  }
}
/* example-end */

export default MenuAlignExample;

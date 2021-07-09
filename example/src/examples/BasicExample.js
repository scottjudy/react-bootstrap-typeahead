/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */

import React, { Fragment, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';

import options from '../data';

/* example-start */
const BasicExample = () => {
  const [singleSelections, setSingleSelections] = useState([]);
  const [multiSelections, setMultiSelections] = useState([]);

  return (
    <Fragment>
      <Form.Group>
        <Form.Label>Single Selection</Form.Label>
        <Typeahead
          clearButton
          id="basic-typeahead-single"
          labelKey="name"
          onChange={setSingleSelections}
          onInputChange={console.log}
          options={options}
          placeholder="Choose a state..."
          selected={singleSelections}
        />
      </Form.Group>
      <Form.Group style={{ marginTop: '20px' }}>
        <Form.Label>Multiple Selections</Form.Label>
        <Typeahead
          id="basic-typeahead-multiple"
          labelKey="name"
          multiple
          onChange={setMultiSelections}
          options={options}
          placeholder="Choose several states..."
          selected={multiSelections}
        />
      </Form.Group>
    </Fragment>
  );
};
/* example-end */

export default BasicExample;

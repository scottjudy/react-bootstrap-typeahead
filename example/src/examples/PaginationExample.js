/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */

import { range } from 'lodash';
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';

/* eslint-disable no-console */
/* example-start */
const options = range(0, 1000).map((o) => `Item ${o}`);

const PaginationExample = () => {
  const [paginate, setPaginate] = useState(true);

  return (
    <>
      <Typeahead
        id="pagination-example"
        onPaginate={() => console.log('Results paginated')}
        options={options}
        paginate={paginate}
        placeholder="Pick a number..."
      />
      <Form.Group>
        <Form.Check
          checked={paginate}
          id="paginate-results"
          label="Paginate results"
          onChange={(e) => setPaginate(!!e.target.checked)}
          type="checkbox"
        />
      </Form.Group>
    </>
  );
};
/* example-end */
/* eslint-enable no-console */

export default PaginationExample;

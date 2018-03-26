import React from 'react';
import {FormGroup} from 'react-bootstrap';

import Control from '../components/Control';
import {Typeahead} from '../../src/';

/* example-start */
class FilteringExample extends React.Component {
  state = {
    caseSensitive: false,
    ignoreDiacritics: true,
  };

  render() {
    const {caseSensitive, ignoreDiacritics} = this.state;

    return (
      <div>
        <Typeahead
          {...this.state}
          options={[
            'Warsaw',
            'Kraków',
            'Łódź',
            'Wrocław',
            'Poznań',
            'Gdańsk',
            'Szczecin',
            'Bydgoszcz',
            'Lublin',
            'Katowice',
            'Białystok',
            'Gdynia',
            'Częstochowa',
            'Radom',
            'Sosnowiec',
            'Toruń',
            'Kielce',
            'Gliwice',
            'Zabrze',
            'Bytom',
            'Olsztyn',
            'Bielsko-Biała',
            'Rzeszów',
            'Ruda Śląska',
            'Rybnik',
          ]}
          placeholder="Cities in Poland..."
        />
        <FormGroup>
          <Control
            checked={caseSensitive}
            onChange={(e) => this.setState({caseSensitive: e.target.checked})}
            type="checkbox">
            Case-sensitive filtering
          </Control>
          <Control
            checked={!ignoreDiacritics}
            onChange={(e) => {
              this.setState({ignoreDiacritics: !e.target.checked});
            }}
            type="checkbox">
            Don't ignore diacritical marks
          </Control>
        </FormGroup>
      </div>
    );
  }
}
/* example-end */

export default FilteringExample;

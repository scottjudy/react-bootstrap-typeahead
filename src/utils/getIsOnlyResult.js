// @flow

import { head } from 'lodash';

import getOptionProperty from './getOptionProperty';

import type { Option, TypeaheadProps } from '../types';

type Props = TypeaheadProps & {
  results: Option[],
};

function getIsOnlyResult(props: Props) {
  const { allowNew, highlightOnlyResult, results } = props;

  if (!highlightOnlyResult || allowNew) {
    return false;
  }

  return results.length === 1 && !getOptionProperty(head(results), 'disabled');
}

export default getIsOnlyResult;

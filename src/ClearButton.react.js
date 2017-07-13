import cx from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';

/**
 * CloseButton
 *
 * http://getbootstrap.com/css/#helper-classes-close
 */
const ClearButton = ({bsSize, className, onClick}) => (
  <button
    aria-label="Close"
    className={cx('close', 'rbt-close', {
      'rbt-close-lg': bsSize === 'large' || bsSize === 'lg',
    }, className)}
    onClick={e => {
      e.stopPropagation();
      onClick(e);
    }}
    type="button">
    <span aria-hidden="true">&times;</span>
    <span className="sr-only">Close</span>
  </button>
);

ClearButton.displayName = 'ClearButton';
ClearButton.propTypes = {
  bsSize: PropTypes.oneOf(['large', 'lg', 'small', 'sm']),
};

export default ClearButton;

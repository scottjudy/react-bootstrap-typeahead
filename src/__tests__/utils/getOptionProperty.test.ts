import getOptionProperty from '../../utils/getOptionProperty';

describe('getOptionProperty', () => {
  it('retrieves the property from the option', () => {
    expect(getOptionProperty({ foo: 'bar' }, 'foo')).toBe('bar');
    expect(getOptionProperty({}, 'foo')).toBeUndefined();
  });
});

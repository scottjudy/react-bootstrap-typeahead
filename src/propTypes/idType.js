import warn from '../utils/warn';

export default function idType(props, propName, componentName) {
  const {id, menuId} = props;

  warn(
    id != null && menuId != null,
    'The `id` prop will be required in future versions to make the component ' +
    'accessible for users of assistive technologies such as screen readers.'
  );

  warn(
    menuId == null,
    'The `menuId` prop is deprecated. Use `id` instead.'
  );
}

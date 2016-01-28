# React Bootstrap Typeahead
React-based typeahead component that uses standard the Bootstrap theme for as a base and supports both single- and multi-selection. Try a [live example](http://ericgio.github.io/react-bootstrap-typeahead/).

## Installation
It is highly recommended that you use npm to install the module in your project and build using a tool like webpack or browserify.

```
npm install react-bootstrap-typeahead
```

If you want to use the component in a standalone manner, both an unminified development version and a minified production version are included in the `dist` folder.

## Usage
`react-bootstrap-typeahead` works very much like any standard `input` element. It requires an array of options to display, similar to a `select`. 

```
<Typeahead
  onChange={this._handleChange}
  options={data}
/>
```

### Single & Multi-Selection
`react-bootstrap-typeahead` allows single-selection by default, but also supports multi-selection. Simply set the `multiple` prop and the component turns into a tokenizer:

```
<Typeahead
  multiple
  onChange={this._handleChange}
  options={data}
/>
```

### Controlled vs. Uncontrolled
Like an `input`, the component can be controlled or uncontrolled. Use the `selected` prop to control it via the parent, or `defaultSelected` to optionally set defaults and then allow the component to control itself.

```
<Typeahead
  onChange={this._handleChange}
  options={data}
  selected={selected}
/>
```

## Data
`react-bootstrap-typeahead` has some expectations about the shape of your data. It expects an array of objects, each of which should have a string property to be used as the label for display. By default, the key is named `label`, but you can specify a different key via the `labelKey` prop.

As far as the source of the data, the component simply handles rendering and selection. It is agnostic about the data source (eg: an async endpoint), which should be handled separately.

## Example
An example file is included with the module. Simply open `index.html` in a browser.

## Documentation

### Props
Name | Type | Default | Description
-----|------|---------|------------
defaultSelected | array | `[]` | Specify any pre-selected options. Use only if you want the component to be uncontrolled.
emptyLabel | string | 'No matches found.' | Message to display in the menu if there are no valid results.
labelKey | string | 'label' | Specify which option key to use for display. By default, the selector will use the `label` key.
maxHeight | number | `300` | Maximum height of the dropdown menu, in px.
multiple | boolean | `false` | Whether or not multiple selections are allowed.
options `required` | array | | Full set of options, including any pre-selected options.
placeholder | string | | Placeholder text for the input.
selected | array | `[]` | The selected option(s) displayed in the input. Use this prop if you want to control the component via it's parent.

## Future Enhancements
- [ ] Custom `Token` and `MenuItem` rendering
- [ ] Create a new data item on the fly
- [ ] Test coverage

function getAccessibilityStatus(props) {
  const {
    a11yNumResults,
    a11yNumSelected,
    emptyLabel,
    isMenuShown,
    results,
    selected,
  } = props;

  // If the menu is hidden, display info about the number of selections.
  if (!isMenuShown) {
    return a11yNumSelected(selected);
  }

  // Display info about the number of matches.
  if (results.length === 0) {
    return emptyLabel;
  }

  return a11yNumResults(results);
}

export default getAccessibilityStatus;

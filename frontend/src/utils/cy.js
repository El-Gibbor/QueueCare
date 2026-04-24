// Flatten characters that break data-cy readability or Cypress's selector parser.
export const cyReplaceSpecial = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/[/.:-]/g, '_');
};

// Build the canonical key for a field: <groupName>_<componentType>[_<labelId>][<groupIndex>].
export const getKeyName = ({ groupName, componentType, labelId, groupIndex }) => {
  const labelPart = labelId ? `_${labelId}` : '';
  const indexPart = Number.isInteger(groupIndex) ? String(groupIndex) : '';
  return `${groupName}_${componentType}${labelPart}${indexPart}`;
};

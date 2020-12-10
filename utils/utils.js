exports.deUmlaut = (value) => {
  value = value.toLowerCase();
  value = value.replace(/ä/g, "a");
  value = value.replace(/ö/g, "o");
  value = value.replace(/ü/g, "u");
  value = value.replace(/ß/g, "s");
  value = value.replace(/ /g, "-");
  value = value.replace(/\./g, "");
  value = value.replace(/,/g, "");
  value = value.replace(/\(/g, "");
  value = value.replace(/\)/g, "");
  return value;
};

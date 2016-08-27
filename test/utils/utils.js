function numLines(str) {
  return typeof str === 'string' ? (str.match(/\n/g) || []).length + 1 : 0;
}
exports.numLines = numLines;

function getTempDir() {
  // TODO: fix this to return a new directory for each test
  return 'tmp';
}
exports.getTempDir = getTempDir;

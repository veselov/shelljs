var test = require('ava');

var isWindows = module.exports.isWindows = process.platform === 'win32';
var notWindows = module.exports.notWindows = !isWindows;

module.exports.test = function testWin(title, cb) {
  if (isWindows) test.apply(this, arguments);
  else test.skip(title);
};

module.exports.skip = function skipWin(title, cb) {
  if (isWindows) test.skip(title);
  else test.apply(this, arguments);
};

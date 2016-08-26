import test from 'ava';
import shell from '..';
import common from '../src/common';

test.before(t => {
  shell.config.silent = true;

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Invalids
//

test('No Test Title #30', t => {
  var result;
});

test('No Test Title #31', t => {
  var result = shell.test(); // no expression given
  t.truthy(shell.error());
});

test('No Test Title #32', t => {
  var result = shell.test('asdf'); // bad expression
  t.truthy(shell.error());
});

test('No Test Title #33', t => {
  var result = shell.test('f', 'resources/file1'); // bad expression
  t.truthy(shell.error());
});

test('No Test Title #34', t => {
  var result = shell.test('-f'); // no file
  t.truthy(shell.error());
});

//
// Valids
//

test('exists', t => {
  var result = shell.test('-e', 'resources/file1');
  t.is(shell.error(), null);
  t.is(result, true);// true
});

test('No Test Title #35', t => {
  var result = shell.test('-e', 'resources/404');
  t.is(shell.error(), null);
  t.is(result, false);
});

test('directory', t => {
  var result = shell.test('-d', 'resources');
  t.is(shell.error(), null);
  t.is(result, true);// true
});

test('No Test Title #36', t => {
  var result = shell.test('-f', 'resources');
  t.is(shell.error(), null);
  t.is(result, false);
});

test('No Test Title #37', t => {
  var result = shell.test('-L', 'resources');
  t.is(shell.error(), null);
  t.is(result, false);
});

test('file', t => {
  var result = shell.test('-d', 'resources/file1');
  t.is(shell.error(), null);
  t.is(result, false);
});

test('No Test Title #38', t => {
  var result = shell.test('-f', 'resources/file1');
  t.is(shell.error(), null);
  t.is(result, true);// true
});

test('No Test Title #39', t => {
  var result = shell.test('-L', 'resources/file1');
  t.is(shell.error(), null);
  t.is(result, false);

  // link
  // Windows is weird with links so skip these tests
  if (common.platform !== 'win') {
    var result = shell.test('-d', 'resources/link');
    t.is(shell.error(), null);
    t.is(result, false);

    // @@TEST(No Test Title #40)
    var result = shell.test('-f', 'resources/link');

    t.is(shell.error(), null);
    t.is(result, true);// true

    // @@TEST(No Test Title #41)
    var result = shell.test('-L', 'resources/link');

    t.is(shell.error(), null);
    t.is(result, true);// true

    // @@TEST(No Test Title #42)
    var result = shell.test('-L', 'resources/badlink');

    t.is(shell.error(), null);
    t.is(result, true);// true

    // @@TEST(No Test Title #43)
    var result = shell.test('-L', 'resources/404');

    t.is(shell.error(), null);
    t.is(result, false);// false
  }
});

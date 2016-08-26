import test from 'ava';
import shell from '..';
import common from '../src/common';

var numLines = require('./utils/utils').numLines;

test.before(t => {
  shell.config.silent = true;

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');

  // Prepare tmp/
  shell.cp('resources/*', 'tmp');
});


//
// Invalids
//

test('No Test Title #38', t => {
  var result = shell.mv();
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: missing <source> and/or <dest>');
});

test('No Test Title #39', t => {
  var result = shell.mv('file1');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: missing <source> and/or <dest>');
});

test('No Test Title #40', t => {
  var result = shell.mv('-f');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: missing <source> and/or <dest>');
});

test('No Test Title #41', t => {
  var result = shell.mv('-Z', 'tmp/file1', 'tmp/file1'); // option not supported
  t.truthy(shell.error());
  t.is(common.existsSync('tmp/file1'), true);
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: option not recognized: Z');
});

test('No Test Title #42', t => {
  var result = shell.mv('asdfasdf', 'tmp'); // source does not exist
  t.truthy(shell.error());
  t.is(numLines(shell.error()), 1);
  t.is(common.existsSync('tmp/asdfasdf'), false);
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: no such file or directory: asdfasdf');
});

test('No Test Title #43', t => {
  var result = shell.mv('asdfasdf1', 'asdfasdf2', 'tmp'); // sources do not exist
  t.truthy(shell.error());
  t.is(numLines(shell.error()), 2);
  t.is(common.existsSync('tmp/asdfasdf1'), false);
  t.is(common.existsSync('tmp/asdfasdf2'), false);
  t.is(result.code, 1);
  t.is(
    result.stderr,
    'mv: no such file or directory: asdfasdf1\nmv: no such file or directory: asdfasdf2'
  );
});

test('No Test Title #44', t => {
  var result = shell.mv('asdfasdf1', 'asdfasdf2', 'tmp/file1'); // too many sources (dest is file)
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: dest is not a directory (too many sources)');
});

test('-n is no-force/no-clobber', t => {
  var result = shell.mv('-n', 'tmp/file1', 'tmp/file2'); // dest already exists
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: dest file already exists: tmp/file2');
});

test('-f is the default behavior', t => {
  shell.cp('tmp/file1', 'tmp/tmp_file');
  var result = shell.mv('tmp/tmp_file', 'tmp/file2'); // dest already exists (but that's ok)
  t.truthy(!shell.error());
  t.truthy(!result.stderr);
  t.is(result.code, 0);
});

test('-fn is the same as -n', t => {
  var result = shell.mv('-fn', 'tmp/file1', 'tmp/file2');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: dest file already exists: tmp/file2');
});

test('No Test Title #45', t => {
  var result = shell.mv('tmp/file1', 'tmp/file2', 'tmp/a_file'); // too many sources (exist, but dest is file)
  t.truthy(shell.error());
  t.is(common.existsSync('tmp/a_file'), false);
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: dest is not a directory (too many sources)');
});

test('No Test Title #46', t => {
  var result = shell.mv('tmp/file*', 'tmp/file1'); // can't use wildcard when dest is file
  t.truthy(shell.error());
  t.is(common.existsSync('tmp/file1'), true);
  t.is(common.existsSync('tmp/file2'), true);
  t.is(common.existsSync('tmp/file1.js'), true);
  t.is(common.existsSync('tmp/file2.js'), true);
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: dest is not a directory (too many sources)');
});

//
// Valids
//

test('No Test Title #47', t => {
  shell.cd('tmp');
});

test('handles self OK', t => {
  shell.mkdir('tmp2');
  var result = shell.mv('*', 'tmp2'); // has to handle self (tmp2 --> tmp2) without throwing error
  t.truthy(shell.error()); // there's an error, but not fatal
  t.is(common.existsSync('tmp2/file1'), true); // moved OK
  t.is(result.code, 1);
  var result = shell.mv('tmp2/*', '.'); // revert
  t.is(common.existsSync('file1'), true); // moved OK
  t.is(result.code, 0);
});

test('No Test Title #48', t => {
  var result = shell.mv('file1', 'file3'); // one source
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('file1'), false);
  t.is(common.existsSync('file3'), true);
  var result = shell.mv('file3', 'file1'); // revert
  t.is(shell.error(), null);
  t.is(common.existsSync('file1'), true);
  t.is(result.code, 0);
});

test('two sources', t => {
  shell.rm('-rf', 't');
  shell.mkdir('-p', 't');
  var result = shell.mv('file1', 'file2', 't');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('file1'), false);
  t.is(common.existsSync('file2'), false);
  t.is(common.existsSync('t/file1'), true);
  t.is(common.existsSync('t/file2'), true);
  var result = shell.mv('t/*', '.'); // revert
  t.is(result.code, 0);
  t.is(common.existsSync('file1'), true);
  t.is(common.existsSync('file2'), true);
});

test('two sources, array style', t => {
  shell.rm('-rf', 't');
  shell.mkdir('-p', 't');
  var result = shell.mv(['file1', 'file2'], 't'); // two sources
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('file1'), false);
  t.is(common.existsSync('file2'), false);
  t.is(common.existsSync('t/file1'), true);
  t.is(common.existsSync('t/file2'), true);
  var result = shell.mv('t/*', '.'); // revert
  t.is(common.existsSync('file1'), true);
  t.is(common.existsSync('file2'), true);
});

test('No Test Title #49', t => {
  var result = shell.mv('file*.js', 't'); // wildcard
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('file1.js'), false);
  t.is(common.existsSync('file2.js'), false);
  t.is(common.existsSync('t/file1.js'), true);
  t.is(common.existsSync('t/file2.js'), true);
  var result = shell.mv('t/*', '.'); // revert
  t.is(common.existsSync('file1.js'), true);
  t.is(common.existsSync('file2.js'), true);
});

test('No Test Title #50', t => {
  var result = shell.mv('-f', 'file1', 'file2'); // dest exists, but -f given
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('file1'), false);
  t.is(common.existsSync('file2'), true);
});

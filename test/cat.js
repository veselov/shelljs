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

test('No Test Title #1', t => {
  var result = shell.cat();
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cat: no paths given');
});

test('No Test Title #2', t => {
  t.is(common.existsSync('/asdfasdf'), false); // sanity check
  var result = shell.cat('/asdfasdf'); // file does not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cat: no such file or directory: /asdfasdf');
});

//
// Valids
//

test('simple', t => {
  var result = shell.cat('resources/cat/file1');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'test1\n');
});

test('multiple files', t => {
  var result = shell.cat('resources/cat/file2', 'resources/cat/file1');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'test2\ntest1\n');
});

test('multiple files, array syntax', t => {
  var result = shell.cat(['resources/cat/file2', 'resources/cat/file1']);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'test2\ntest1\n');
});

test('No Test Title #3', t => {
  var result = shell.cat('resources/file*.txt');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.truthy(result.search('test1') > -1); // file order might be random
  t.truthy(result.search('test2') > -1);
});

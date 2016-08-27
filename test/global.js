/* globals cat, config, cp, env, error, exit, mkdir, rm */
import test from 'ava';
import '../global';
import common from '../src/common';

test.before(() => {
  config.silent = true;

  rm('-rf', 'tmp');
  mkdir('tmp');
});


//
// Valids
//

test('env is exported', t => {
  t.is(process.env, env);
});

test('cat', t => {
  const result = cat('resources/cat/file1');
  t.is(error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'test1\n');
});

test('rm', t => {
  cp('-f', 'resources/file1', 'tmp/file1');
  t.is(common.existsSync('tmp/file1'), true);
  const result = rm('tmp/file1');
  t.is(error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/file1'), false);
});

test('String.prototype is modified for global require', t => {
  'foo'.to('tmp/testfile.txt');
  t.is('foo', cat('tmp/testfile.txt').toString());
  'bar'.toEnd('tmp/testfile.txt');
  t.is('foobar', cat('tmp/testfile.txt').toString());
});


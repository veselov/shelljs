import test from 'ava';
import shell from '..';
import common from '../src/common';
import fs from 'fs';
import windows from './_windows';

const numLines = require('./utils/utils').numLines;

test.before(() => {
  shell.config.silent = true;

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Invalids
//

test('No Test Title #30', t => {
  const result = shell.mkdir();
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mkdir: no paths given');
});

test('No Test Title #31', t => {
  const mtime = fs.statSync('tmp').mtime.toString();
  const result = shell.mkdir('tmp'); // dir already exists
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mkdir: path already exists: tmp');
  t.is(fs.statSync('tmp').mtime.toString(), mtime); // didn't mess with dir
});

test('Can\'t overwrite a broken link', t => {
  const mtime = fs.lstatSync('resources/badlink').mtime.toString();
  const result = shell.mkdir('resources/badlink');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mkdir: path already exists: resources/badlink');
  t.is(fs.lstatSync('resources/badlink').mtime.toString(), mtime); // didn't mess with file
});

test('No Test Title #32', t => {
  t.is(common.existsSync('/asdfasdf'), false); // sanity check
  const result = shell.mkdir('/asdfasdf/foobar'); // root path does not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mkdir: no such file or directory: /asdfasdf');
  t.is(common.existsSync('/asdfasdf'), false);
  t.is(common.existsSync('/asdfasdf/foobar'), false);
});

// This test case only works on unix, but should work on Windows as well
windows.skip('Check for invalid permissions', t => {
  const dirName = 'nowritedir';
  shell.mkdir(dirName);
  t.truthy(!shell.error());
  shell.chmod('-w', dirName);
  const result = shell.mkdir(dirName + '/foo');
  t.is(result.code, 1);
  t.is(
      result.stderr,
      'mkdir: cannot create directory nowritedir/foo: Permission denied'
    );
  t.truthy(shell.error());
  t.is(common.existsSync(dirName + '/foo'), false);
  shell.rm('-rf', dirName); // clean up
});

//
// Valids
//

test('No Test Title #33', t => {
  t.is(common.existsSync('tmp/t1'), false);
  const result = shell.mkdir('tmp/t1'); // simple dir
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/t1'), true);
});

test('No Test Title #34', t => {
  t.is(common.existsSync('tmp/t2'), false);
  t.is(common.existsSync('tmp/t3'), false);
  const result = shell.mkdir('tmp/t2', 'tmp/t3'); // multiple dirs
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/t2'), true);
  t.is(common.existsSync('tmp/t3'), true);
});

test('No Test Title #35', t => {
  t.is(common.existsSync('tmp/t1'), true);
  t.is(common.existsSync('tmp/t4'), false);
  const result = shell.mkdir('tmp/t1', 'tmp/t4'); // one dir exists, one doesn't
  t.is(result.code, 1);
  t.is(numLines(shell.error()), 1);
  t.is(common.existsSync('tmp/t1'), true);
  t.is(common.existsSync('tmp/t4'), true);
});

test('No Test Title #36', t => {
  t.is(common.existsSync('tmp/a'), false);
  const result = shell.mkdir('-p', 'tmp/a/b/c');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/a/b/c'), true);
  shell.rm('-Rf', 'tmp/a'); // revert
});

test('multiple dirs', t => {
  const result = shell.mkdir('-p', 'tmp/zzza', 'tmp/zzzb', 'tmp/zzzc');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/zzza'), true);
  t.is(common.existsSync('tmp/zzzb'), true);
  t.is(common.existsSync('tmp/zzzc'), true);
});

test('multiple dirs, array syntax', t => {
  const result = shell.mkdir('-p', ['tmp/yyya', 'tmp/yyyb', 'tmp/yyyc']);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/yyya'), true);
  t.is(common.existsSync('tmp/yyyb'), true);
  t.is(common.existsSync('tmp/yyyc'), true);
});

test('globbed dir', t => {
  let result = shell.mkdir('-p', 'tmp/mydir');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/mydir'), true);
  result = shell.mkdir('-p', 'tmp/m*ir');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/mydir'), true);
  t.is(common.existsSync('tmp/m*ir'), false); // doesn't create literal name
});

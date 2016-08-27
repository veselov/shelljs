import test from 'ava';
import shell from '..';
import common from '../src/common';
import path from 'path';
import fs from 'fs';

test.before(() => {
  shell.config.silent = true;

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Invalids
//

test('No Test Title #85', t => {
  const result = shell.rm();
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'rm: no paths given');
});

test('No Test Title #86', t => {
  const result = shell.rm('asdfasdf'); // file does not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'rm: no such file or directory: asdfasdf');
});

test('No Test Title #87', t => {
  const result = shell.rm('-f'); // no file
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'rm: no paths given');
});

test('No Test Title #88', t => {
  const result = shell.rm('-@', 'resources/file1'); // invalid option
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(common.existsSync('resources/file1'), true);
  t.is(result.stderr, 'rm: option not recognized: @');
});

//
// Valids
//

test('file does not exist, but -f specified', t => {
  const result = shell.rm('-f', 'asdfasdf');
  t.is(shell.error(), null);
  t.is(result.code, 0);
});

test('directory does not exist, but -fr specified', t => {
  const result = shell.rm('-fr', 'fake_dir/');
  t.is(shell.error(), null);
  t.is(result.code, 0);
});

test('directory does not exist, but *only -f* specified', t => {
  const result = shell.rm('-f', 'fake_dir/');
  t.is(shell.error(), null);
  t.is(result.code, 0);
});

test('file (in fake dir) does not exist, but -f specified', t => {
  const result = shell.rm('-f', 'fake_dir/asdfasdf');
  t.is(shell.error(), null);
  t.is(result.code, 0);
});

test('dir (in fake dir) does not exist, but -fr specified', t => {
  const result = shell.rm('-fr', 'fake_dir/sub/');
  t.is(shell.error(), null);
  t.is(result.code, 0);
});

test('simple rm', t => {
  shell.cp('-f', 'resources/file1', 'tmp/file1');
  t.is(common.existsSync('tmp/file1'), true);
  const result = shell.rm('tmp/file1');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/file1'), false);
});

test('recursive dir removal - small-caps \'-r\'', t => {
  shell.mkdir('-p', 'tmp/a/b/c');
  t.is(common.existsSync('tmp/a/b/c'), true);
  const result = shell.rm('-rf', 'tmp/a');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/a'), false);
});

test('recursive dir removal - capital \'-R\'', t => {
  shell.mkdir('-p', 'tmp/a/b/c');
  t.is(common.existsSync('tmp/a/b/c'), true);
  const result = shell.rm('-Rf', 'tmp/a');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/a'), false);
});

test('recursive dir removal - absolute path', t => {
  shell.mkdir('-p', 'tmp/a/b/c');
  t.is(common.existsSync('tmp/a/b/c'), true);
  const result = shell.rm('-Rf', path.resolve('./tmp/a'));
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/a'), false);
});

test('wildcard', t => {
  let result = shell.cp('-f', 'resources/file*', 'tmp');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/file1'), true);
  t.is(common.existsSync('tmp/file2'), true);
  t.is(common.existsSync('tmp/file1.js'), true);
  t.is(common.existsSync('tmp/file2.js'), true);
  result = shell.rm('tmp/file*');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/file1'), false);
  t.is(common.existsSync('tmp/file2'), false);
  t.is(common.existsSync('tmp/file1.js'), false);
  t.is(common.existsSync('tmp/file2.js'), false);
});

test('recursive dir removal', t => {
  shell.mkdir('-p', 'tmp/a/b/c');
  shell.mkdir('-p', 'tmp/b');
  shell.mkdir('-p', 'tmp/c');
  shell.mkdir('-p', 'tmp/.hidden');
  t.is(common.existsSync('tmp/a/b/c'), true);
  t.is(common.existsSync('tmp/b'), true);
  t.is(common.existsSync('tmp/c'), true);
  t.is(common.existsSync('tmp/.hidden'), true);
  const result = shell.rm('-rf', 'tmp/*');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  const contents = fs.readdirSync('tmp');
  t.is(contents.length, 1);
  t.is(contents[0], '.hidden'); // shouldn't remove hiddden if no .* given
});

test('recursive dir removal', t => {
  shell.mkdir('-p', 'tmp/a/b/c');
  shell.mkdir('-p', 'tmp/b');
  shell.mkdir('-p', 'tmp/c');
  shell.mkdir('-p', 'tmp/.hidden');
  t.is(common.existsSync('tmp/a/b/c'), true);
  t.is(common.existsSync('tmp/b'), true);
  t.is(common.existsSync('tmp/c'), true);
  t.is(common.existsSync('tmp/.hidden'), true);
  const result = shell.rm('-rf', 'tmp/*', 'tmp/.*');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  const contents = fs.readdirSync('tmp');
  t.is(contents.length, 0);
});

test('recursive dir removal - array-syntax', t => {
  shell.mkdir('-p', 'tmp/a/b/c');
  shell.mkdir('-p', 'tmp/b');
  shell.mkdir('-p', 'tmp/c');
  shell.mkdir('-p', 'tmp/.hidden');
  t.is(common.existsSync('tmp/a/b/c'), true);
  t.is(common.existsSync('tmp/b'), true);
  t.is(common.existsSync('tmp/c'), true);
  t.is(common.existsSync('tmp/.hidden'), true);
  const result = shell.rm('-rf', ['tmp/*', 'tmp/.*']);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  const contents = fs.readdirSync('tmp');
  t.is(contents.length, 0);
});

test('removal of a read-only file (unforced)', t => {
  shell.mkdir('-p', 'tmp/readonly');
  shell.ShellString('asdf').to('tmp/readonly/file1');
  fs.chmodSync('tmp/readonly/file1', '0444'); // -r--r--r--
  shell.rm('tmp/readonly/file1');
  t.is(common.existsSync('tmp/readonly/file1'), true); // bash's rm always asks before removing read-only files
  // here we just assume "no"
});

test('removal of a read-only file (forced)', t => {
  shell.mkdir('-p', 'tmp/readonly');
  shell.ShellString('asdf').to('tmp/readonly/file2');
  fs.chmodSync('tmp/readonly/file2', '0444'); // -r--r--r--
  shell.rm('-f', 'tmp/readonly/file2');
  t.is(common.existsSync('tmp/readonly/file2'), false);
});

test('removal of a tree containing read-only files (unforced)', t => {
  shell.mkdir('-p', 'tmp/tree2');
  shell.ShellString('asdf').to('tmp/tree2/file1');
  shell.ShellString('asdf').to('tmp/tree2/file2');
  fs.chmodSync('tmp/tree2/file1', '0444'); // -r--r--r--
  shell.rm('-r', 'tmp/tree2');
  t.is(common.existsSync('tmp/tree2/file1'), true);
  t.is(common.existsSync('tmp/tree2/file2'), false);
});

test('removal of a tree containing read-only files (forced)', t => {
  shell.mkdir('-p', 'tmp/tree');
  shell.ShellString('asdf').to('tmp/tree/file1');
  shell.ShellString('asdf').to('tmp/tree/file2');
  fs.chmodSync('tmp/tree/file1', '0444'); // -r--r--r--
  shell.rm('-rf', 'tmp/tree');
  t.is(common.existsSync('tmp/tree'), false);
});

test(
  'removal of a sub-tree containing read-only and hidden files - rm(\'dir/*\')',
  t => {
    shell.mkdir('-p', 'tmp/tree3');
    shell.mkdir('-p', 'tmp/tree3/subtree');
    shell.mkdir('-p', 'tmp/tree3/.hidden');
    shell.ShellString('asdf').to('tmp/tree3/subtree/file');
    shell.ShellString('asdf').to('tmp/tree3/.hidden/file');
    shell.ShellString('asdf').to('tmp/tree3/file');
    fs.chmodSync('tmp/tree3/file', '0444'); // -r--r--r--
    fs.chmodSync('tmp/tree3/subtree/file', '0444'); // -r--r--r--
    fs.chmodSync('tmp/tree3/.hidden/file', '0444'); // -r--r--r--
    shell.rm('-rf', 'tmp/tree3/*', 'tmp/tree3/.*'); // erase dir contents
    t.is(shell.ls('tmp/tree3').length, 0);
  }
);

test(
  'removal of a sub-tree containing read-only and hidden files - rm(\'dir\')',
  t => {
    shell.mkdir('-p', 'tmp/tree4');
    shell.mkdir('-p', 'tmp/tree4/subtree');
    shell.mkdir('-p', 'tmp/tree4/.hidden');
    shell.ShellString('asdf').to('tmp/tree4/subtree/file');
    shell.ShellString('asdf').to('tmp/tree4/.hidden/file');
    shell.ShellString('asdf').to('tmp/tree4/file');
    fs.chmodSync('tmp/tree4/file', '0444'); // -r--r--r--
    fs.chmodSync('tmp/tree4/subtree/file', '0444'); // -r--r--r--
    fs.chmodSync('tmp/tree4/.hidden/file', '0444'); // -r--r--r--
    shell.rm('-rf', 'tmp/tree4'); // erase dir contents
    t.is(common.existsSync('tmp/tree4'), false);
  }
);

test('remove symbolic link to a dir', t => {
  let result = shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
  shell.cp('-R', 'resources/rm', 'tmp');
  result = shell.rm('-f', 'tmp/rm/link_to_a_dir');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/rm/link_to_a_dir'), false);
  t.is(common.existsSync('tmp/rm/a_dir'), true);
});

test('remove broken symbolic link', t => {
  if (process.platform !== 'win32') {
    let result = shell.rm('-rf', 'tmp');
    shell.mkdir('tmp');
    shell.cp('-R', 'resources/rm', 'tmp');
    t.truthy(shell.test('-L', 'tmp/rm/fake.lnk'));
    result = shell.rm('tmp/rm/fake.lnk');
    t.is(shell.error(), null);
    t.is(result.code, 0);
    t.truthy(!shell.test('-L', 'tmp/rm/fake.lnk'));
    t.is(common.existsSync('tmp/rm/fake.lnk'), false);
  }
});

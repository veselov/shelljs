import test from 'ava';
import shell from '..';
import path from 'path';
import common from '../src/common';

test.before(t => {
  shell.config.silent = true;

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Invalids
//

test('No Test Title #5', t => {
  t.is(common.existsSync('/asdfasdf'), false);
  var result = shell.cd('/asdfasdf'); // dir does not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cd: no such file or directory: /asdfasdf');
});

test('No Test Title #6', t => {
  t.is(common.existsSync('resources/file1'), true); // sanity check
  var result = shell.cd('resources/file1'); // file, not dir
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cd: not a directory: resources/file1');
});

test('No Test Title #7', t => {
  var result = shell.cd('-'); // Haven't changed yet, so there is no previous directory
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cd: could not find previous directory');
});

//
// Valids
//

test('No Test Title #8', t => {
  var result = shell.cd(cur);
  var result = shell.cd('tmp');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(path.basename(process.cwd()), 'tmp');
});

test('No Test Title #9', t => {
  var result = shell.cd(cur);
  var result = shell.cd('/');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(process.cwd(), path.resolve('/'));
});

test('No Test Title #10', t => {
  var result = shell.cd(cur);
  var result = shell.cd('/');
  var result = shell.cd('-');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(process.cwd(), path.resolve(cur.toString()));

  // @@TEST(cd + other commands)

  // No Test Title #11
  var result = shell.cd(cur);

  var result = shell.rm('-f', 'tmp/*');
  t.is(common.existsSync('tmp/file1'), false);
  var result = shell.cd('resources');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  var result = shell.cp('file1', '../tmp');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  var result = shell.cd('../tmp');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(common.existsSync('file1'), true);

  // @@TEST(Test tilde expansion)

  // No Test Title #12
  var result = shell.cd('~');

  t.is(process.cwd(), common.getUserHome());
  var result = shell.cd('..');
  t.not(process.cwd(), common.getUserHome());
  var result = shell.cd('~'); // Change back to home
  t.is(process.cwd(), common.getUserHome());
});

test('Goes to home directory if no arguments are passed', t => {
  var result = shell.cd(cur);
  var result = shell.cd();
  t.truthy(!shell.error());
  t.is(result.code, 0);
  t.is(process.cwd(), common.getUserHome());
});

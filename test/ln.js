import test from 'ava';
import shell from '..';
import common from '../src/common';
import fs from 'fs';
import path from 'path';

test.before(t => {
  var isWindows = common.platform === 'win';

  shell.config.silent = true;

  // On Windows, symlinks for files need admin permissions. This helper
  // skips certain tests if we are on Windows and got an EPERM error
  function skipOnWinForEPERM(action, test) {
    action();
    var error = shell.error();

    if (isWindows && error && /EPERM:/.test(error)) {
      console.log('Got EPERM when testing symlinks on Windows. Assuming non-admin environment and skipping test.');
    } else {
      test();
    }
  }

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');

  // Prepare tmp/
  shell.cp('resources/*', 'tmp');
});


//
// Invalids
//

test('No Test Title #13', t => {
  var result = shell.ln();
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #14', t => {
  var result = shell.ln('file');
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #15', t => {
  var result = shell.ln('-f');
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #16', t => {
  var result = shell.ln('tmp/file1', 'tmp/file2');
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #17', t => {
  var result = shell.ln('tmp/noexist', 'tmp/linkfile1');
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #18', t => {
  var result = shell.ln('-sf', 'no/exist', 'tmp/badlink');
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #19', t => {
  var result = shell.ln('-sf', 'noexist', 'tmp/badlink');
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #20', t => {
  var result = shell.ln('-f', 'noexist', 'tmp/badlink');
  t.truthy(shell.error());
  t.is(result.code, 1);
});

//
// Valids
//

test('No Test Title #21', t => {
  var result = shell.ln('tmp/file1', 'tmp/linkfile1');
  assert(common.existsSync('tmp/linkfile1'));
  t.is(
    fs.readFileSync('tmp/file1').toString(),
    fs.readFileSync('tmp/linkfile1').toString()
  );
  fs.writeFileSync('tmp/file1', 'new content 1');
  t.is(fs.readFileSync('tmp/linkfile1').toString(), 'new content 1');
  t.is(result.code, 0);
});

test('With glob', t => {
  shell.rm('tmp/linkfile1');
  var result = shell.ln('tmp/fi*1', 'tmp/linkfile1');
  assert(common.existsSync('tmp/linkfile1'));
  t.is(
    fs.readFileSync('tmp/file1').toString(),
    fs.readFileSync('tmp/linkfile1').toString()
  );
  fs.writeFileSync('tmp/file1', 'new content 1');
  t.is(fs.readFileSync('tmp/linkfile1').toString(), 'new content 1');
  t.is(result.code, 0);
});

test('No Test Title #22', t => {
  skipOnWinForEPERM(shell.ln.bind(shell, '-s', 'file2', 'tmp/linkfile2'), function () {
    assert(common.existsSync('tmp/linkfile2'));
    t.is(
      fs.readFileSync('tmp/file2').toString(),
      fs.readFileSync('tmp/linkfile2').toString()
    );
    fs.writeFileSync('tmp/file2', 'new content 2');
    t.is(fs.readFileSync('tmp/linkfile2').toString(), 'new content 2');
  });
});

test('Symbolic link directory test', t => {
  shell.mkdir('tmp/ln');
  shell.touch('tmp/ln/hello');
  var result = shell.ln('-s', 'ln', 'tmp/dir1');
  assert(common.existsSync('tmp/ln/hello'));
  assert(common.existsSync('tmp/dir1/hello'));
  t.is(result.code, 0);
});

test('To current directory', t => {
  shell.cd('tmp');
  var result = shell.ln('-s', './', 'dest');
  t.is(result.code, 0);
  shell.touch('testfile.txt');
  assert(common.existsSync('testfile.txt'));
  assert(common.existsSync('dest/testfile.txt'));
  shell.rm('-f', 'dest');
  shell.mkdir('dir1');
  shell.cd('dir1');
  var result = shell.ln('-s', './', '../dest');
  t.is(result.code, 0);
  shell.touch('insideDir.txt');
  shell.cd('..');
  assert(common.existsSync('testfile.txt'));
  assert(common.existsSync('dest/testfile.txt'));
  assert(common.existsSync('dir1/insideDir.txt'));
  assert(!common.existsSync('dest/insideDir.txt'));
  shell.cd('..');
});

test('No Test Title #23', t => {
  var result = shell.ln('-f', 'tmp/file1.js', 'tmp/file2.js');
  t.is(result.code, 0);
  assert(common.existsSync('tmp/file2.js'));
  t.is(
    fs.readFileSync('tmp/file1.js').toString(),
    fs.readFileSync('tmp/file2.js').toString()
  );
  fs.writeFileSync('tmp/file1.js', 'new content js');
  t.is(fs.readFileSync('tmp/file2.js').toString(), 'new content js');
});

test('No Test Title #24', t => {
  skipOnWinForEPERM(shell.ln.bind(shell, '-sf', 'file1.txt', 'tmp/file2.txt'), function () {
    assert(common.existsSync('tmp/file2.txt'));
    t.is(
      fs.readFileSync('tmp/file1.txt').toString(),
      fs.readFileSync('tmp/file2.txt').toString()
    );
    fs.writeFileSync('tmp/file1.txt', 'new content txt');
    t.is(fs.readFileSync('tmp/file2.txt').toString(), 'new content txt');
  });
});

test('Abspath regression', t => {
  skipOnWinForEPERM(shell.ln.bind(shell, '-sf', 'file1', path.resolve('tmp/abspath')), function () {
    assert(common.existsSync('tmp/abspath'));
    t.is(
      fs.readFileSync('tmp/file1').toString(),
      fs.readFileSync('tmp/abspath').toString()
    );
    fs.writeFileSync('tmp/file1', 'new content 3');
    t.is(fs.readFileSync('tmp/abspath').toString(), 'new content 3');
  });
});

test('Relative regression', t => {
  skipOnWinForEPERM(shell.ln.bind(shell, '-sf', 'file1.txt', 'tmp/file2.txt'), function () {
    shell.mkdir('-p', 'tmp/new');
      // Move the symlink first, as the reverse confuses `mv`.
    shell.mv('tmp/file2.txt', 'tmp/new/file2.txt');
    shell.mv('tmp/file1.txt', 'tmp/new/file1.txt');
    assert(common.existsSync('tmp/new/file2.txt'));
    t.is(
      fs.readFileSync('tmp/new/file1.txt').toString(),
      fs.readFileSync('tmp/new/file2.txt').toString()
    );
    fs.writeFileSync('tmp/new/file1.txt', 'new content txt');
    t.is(fs.readFileSync('tmp/new/file2.txt').toString(), 'new content txt');
  });
});

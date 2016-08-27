import test from 'ava';
import shell from '..';
import common from '../src/common';
import fs from 'fs';
import crypto from 'crypto';

function resetUtimes(f) {
  const d = new Date();
  d.setYear(2000);
  fs.utimesSync(f, d, d);
  return fs.statSync(f);
}

function tmpFile(noCreate) {
  const str = crypto.randomBytes(Math.ceil(10 / 2)).toString('hex');
  const file = 'tmp/' + str;
  if (!noCreate) {
    fs.closeSync(fs.openSync(file, 'a'));
  }
  return file;
}

test.before(t => {
  shell.config.silent = true;
  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Valids
//

test('should handle args', t => {
  const result = shell.touch();
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #53', t => {
  const result = shell.touch(1);
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('exits without error when trying to touch a directory', t => {
  let result = shell.touch('tmp/');
  t.truthy(!shell.error());
  t.is(result.code, 0);
  result = shell.touch('tmp');
  t.truthy(!shell.error());
  t.is(result.code, 0);
});

test('creates new files', t => {
  const testFile = tmpFile();
  const result = shell.touch(testFile);
  t.truthy(common.existsSync(testFile));
});

test('does not create a file if told not to', t => {
  const testFile = tmpFile(true);
  const result = shell.touch('-c', testFile);
  t.is(result.code, 0);
  t.truthy(!common.existsSync(testFile));
});

test('handles globs correctly', t => {
  shell.touch('tmp/file.txt');
  shell.touch('tmp/file.js');
  const result = shell.touch('tmp/file*');
  t.is(result.code, 0);
  const files = shell.ls('tmp/file*');
  t.truthy(files.indexOf('tmp/file.txt') > -1);
  t.truthy(files.indexOf('tmp/file.js') > -1);
  t.is(files.length, 2);
});

test('errors if reference file is not found', t => {
  const testFile = tmpFile();
  const refFile = tmpFile(true);
  const result = shell.touch({ '-r': refFile }, testFile);
  t.is(result.code, 1);
  t.truthy(shell.error());
});

test('uses a reference file for mtime', t => {
  const testFile = tmpFile(false);
  const testFile2 = tmpFile();
  shell.touch(testFile2);
  shell.exec(JSON.stringify(process.execPath) + ' resources/exec/slow.js 3000');
  let result = shell.touch(testFile);
  t.truthy(!shell.error());
  t.is(result.code, 0);
  t.not(
    fs.statSync(testFile).mtime.getTime(),
    fs.statSync(testFile2).mtime.getTime()
  );
  t.not(
    fs.statSync(testFile).atime.getTime(),
    fs.statSync(testFile2).atime.getTime()
  );
  result = shell.touch({ '-r': testFile2 }, testFile);
  t.truthy(!shell.error());
  t.is(result.code, 0);
  t.is(
    fs.statSync(testFile).mtime.getTime(),
    fs.statSync(testFile2).mtime.getTime()
  );
  t.is(
    fs.statSync(testFile).atime.getTime(),
    fs.statSync(testFile2).atime.getTime()
  );
});

test('sets mtime', t => {
  const testFile = tmpFile();
  const oldStat = resetUtimes(testFile);
  const result = shell.touch(testFile);
  t.is(result.code, 0);
  t.truthy(oldStat.mtime < fs.statSync(testFile).mtime);
  // sets atime
  t.truthy(oldStat.atime < fs.statSync(testFile).atime);
});

test('does not sets mtime if told not to', t => {
  const testFile = tmpFile();
  const oldStat = resetUtimes(testFile);
  const result = shell.touch('-a', testFile);
  t.is(result.code, 0);
  t.is(oldStat.mtime.getTime(), fs.statSync(testFile).mtime.getTime());
});

test('does not sets atime if told not to', t => {
  const testFile = tmpFile();
  const oldStat = resetUtimes(testFile);
  const result = shell.touch('-m', testFile);
  t.is(result.code, 0);
  t.is(oldStat.atime.getTime(), fs.statSync(testFile).atime.getTime());
});

test('multiple files', t => {
  const testFile = tmpFile(true);
  const testFile2 = tmpFile(true);
  shell.rm('-f', testFile, testFile2);
  const result = shell.touch(testFile, testFile2);
  t.is(result.code, 0);
  t.truthy(common.existsSync(testFile));
  t.truthy(common.existsSync(testFile2));
});

test('file array', t => {
  const testFile = tmpFile(true);
  const testFile2 = tmpFile(true);
  shell.rm('-f', testFile, testFile2);
  const result = shell.touch([testFile, testFile2]);
  t.is(result.code, 0);
  t.truthy(common.existsSync(testFile));
  t.truthy(common.existsSync(testFile2));
});

test('touching broken link creates a new file', t => {
  if (process.platform !== 'win32') {
    const result = shell.touch('resources/badlink');
    t.is(result.code, 0);
    t.truthy(!shell.error());
    t.truthy(common.existsSync('resources/not_existed_file'));
    shell.rm('resources/not_existed_file');
  }
});

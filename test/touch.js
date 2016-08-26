import test from 'ava';
import shell from '..';
import common from '../src/common';
import fs from 'fs';
import crypto from 'crypto';

function resetUtimes(f) {
  var d = new Date();
  d.setYear(2000);
  fs.utimesSync(f, d, d);
  return fs.statSync(f);
}

function tmpFile(noCreate) {
  var str = crypto.randomBytes(Math.ceil(10 / 2)).toString('hex');
  var file = 'tmp/' + str;
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
  var result = shell.touch();
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #53', t => {
  var result = shell.touch(1);
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('exits without error when trying to touch a directory', t => {
  var result = shell.touch('tmp/');
  t.truthy(!shell.error());
  t.is(result.code, 0);
  var result = shell.touch('tmp');
  t.truthy(!shell.error());
  t.is(result.code, 0);
});

test('creates new files', t => {
  var testFile = tmpFile();
  var result = shell.touch(testFile);
  t.truthy(common.existsSync(testFile));
});

test('does not create a file if told not to', t => {
  var testFile = tmpFile(true);
  var result = shell.touch('-c', testFile);
  t.is(result.code, 0);
  t.truthy(!common.existsSync(testFile));
});

test('handles globs correctly', t => {
  var result = shell.touch('tmp/file.txt');
  var result = shell.touch('tmp/file.js');
  var result = shell.touch('tmp/file*');
  t.is(result.code, 0);
  var files = shell.ls('tmp/file*');
  t.truthy(files.indexOf('tmp/file.txt') > -1);
  t.truthy(files.indexOf('tmp/file.js') > -1);
  t.is(files.length, 2);
});

test('errors if reference file is not found', t => {
  var testFile = tmpFile();
  var refFile = tmpFile(true);
  var result = shell.touch({ '-r': refFile }, testFile);
  t.is(result.code, 1);
  t.truthy(shell.error());
});

test('uses a reference file for mtime', t => {
  var testFile = tmpFile(false);
  var testFile2 = tmpFile();
  shell.touch(testFile2);
  shell.exec(JSON.stringify(process.execPath) + ' resources/exec/slow.js 3000');
  var result = shell.touch(testFile);
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
  var result = shell.touch({ '-r': testFile2 }, testFile);
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
  var testFile = tmpFile();
  var oldStat = resetUtimes(testFile);
  var result = shell.touch(testFile);
  t.is(result.code, 0);
  t.truthy(oldStat.mtime < fs.statSync(testFile).mtime);
  // sets atime
  t.truthy(oldStat.atime < fs.statSync(testFile).atime);
});

test('does not sets mtime if told not to', t => {
  var testFile = tmpFile();
  var oldStat = resetUtimes(testFile);
  var result = shell.touch('-a', testFile);
  t.is(result.code, 0);
  t.is(oldStat.mtime.getTime(), fs.statSync(testFile).mtime.getTime());
});

test('does not sets atime if told not to', t => {
  var testFile = tmpFile();
  var oldStat = resetUtimes(testFile);
  var result = shell.touch('-m', testFile);
  t.is(result.code, 0);
  t.is(oldStat.atime.getTime(), fs.statSync(testFile).atime.getTime());
});

test('multiple files', t => {
  var testFile = tmpFile(true);
  var testFile2 = tmpFile(true);
  shell.rm('-f', testFile, testFile2);
  var result = shell.touch(testFile, testFile2);
  t.is(result.code, 0);
  t.truthy(common.existsSync(testFile));
  t.truthy(common.existsSync(testFile2));
});

test('file array', t => {
  var testFile = tmpFile(true);
  var testFile2 = tmpFile(true);
  shell.rm('-f', testFile, testFile2);
  var result = shell.touch([testFile, testFile2]);
  t.is(result.code, 0);
  t.truthy(common.existsSync(testFile));
  t.truthy(common.existsSync(testFile2));
});

test('touching broken link creates a new file', t => {
  if (process.platform !== 'win32') {
    var result = shell.touch('resources/badlink');
    t.is(result.code, 0);
    t.truthy(!shell.error());
    t.truthy(common.existsSync('resources/not_existed_file'));
    shell.rm('resources/not_existed_file');
  }
});

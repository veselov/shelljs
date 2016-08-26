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
  var result = shell.sed();
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.truthy(result.stderr);
});

test('No Test Title #2', t => {
  var result = shell.sed(/asdf/g); // too few args
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #3', t => {
  var result = shell.sed(/asdf/g, 'nada'); // too few args
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #4', t => {
  t.is(common.existsSync('asdfasdf'), false); // sanity check
  var result = shell.sed(/asdf/g, 'nada', 'asdfasdf'); // no such file
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.stderr, 'sed: no such file or directory: asdfasdf');
});

test('if at least one file is missing, this should be an error', t => {
  shell.cp('-f', 'resources/file1', 'tmp/file1');
  t.is(common.existsSync('asdfasdf'), false); // sanity check
  t.is(common.existsSync('tmp/file1'), true); // sanity check
  var result = shell.sed(/asdf/g, 'nada', 'tmp/file1', 'asdfasdf');
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.stderr, 'sed: no such file or directory: asdfasdf');
});

//
// Valids
//

test('No Test Title #5', t => {
  shell.cp('-f', 'resources/file1', 'tmp/file1');
  var result = shell.sed('test1', 'hello', 'tmp/file1'); // search string
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello');
});

test('No Test Title #6', t => {
  var result = shell.sed(/test1/, 'hello', 'tmp/file1'); // search regex
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello');
});

test('No Test Title #7', t => {
  var result = shell.sed(/test1/, 1234, 'tmp/file1'); // numeric replacement
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), '1234');
});

test('No Test Title #8', t => {
  var replaceFun = function (match) {
    return match.toUpperCase() + match;
  };
  var result = shell.sed(/test1/, replaceFun, 'tmp/file1'); // replacement function
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'TEST1test1');
});

test('No Test Title #9', t => {
  var result = shell.sed('-i', /test1/, 'hello', 'tmp/file1');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello');
  t.is(shell.cat('tmp/file1').toString(), 'hello');
});

test('make sure * in regex is not globbed', t => {
  var result = shell.sed(/alpha*beta/, 'hello', 'resources/grep/file');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(
    result.toString(),
    'hello\nhowareyou\nhello\nthis line ends in.js\nlllllllllllllllll.js\n'
  );
});

test('make sure * in string-regex is not globbed', t => {
  var result = shell.sed('alpha*beta', 'hello', 'resources/grep/file');
  t.truthy(!shell.error());
  t.is(result.code, 0);
  t.is(
    result.toString(),
    'hello\nhowareyou\nhello\nthis line ends in.js\nlllllllllllllllll.js\n'
  );
});

test('make sure * in regex is not globbed', t => {
  var result = shell.sed(/l*\.js/, '', 'resources/grep/file');
  t.truthy(!shell.error());
  t.is(result.code, 0);
  t.is(
    result.toString(),
    'alphaaaaaaabeta\nhowareyou\nalphbeta\nthis line ends in\n\n'
  );
});

test('make sure * in string-regex is not globbed', t => {
  var result = shell.sed('l*\\.js', '', 'resources/grep/file');
  t.truthy(!shell.error());
  t.is(result.code, 0);
  t.is(
    result.toString(),
    'alphaaaaaaabeta\nhowareyou\nalphbeta\nthis line ends in\n\n'
  );
});

test('No Test Title #10', t => {
  shell.cp('-f', 'resources/file1', 'tmp/file1');
  shell.cp('-f', 'resources/file2', 'tmp/file2');
});

test('multiple file names', t => {
  var result = shell.sed('test', 'hello', 'tmp/file1', 'tmp/file2');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello1\nhello2');
});

test('array of file names (and try it out with a simple regex)', t => {
  var result = shell.sed(/t.*st/, 'hello', ['tmp/file1', 'tmp/file2']);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello1\nhello2');
});

test('multiple file names, with in-place-replacement', t => {
  var result = shell.sed('-i', 'test', 'hello', ['tmp/file1', 'tmp/file2']);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello1\nhello2');
  t.is(shell.cat('tmp/file1').toString(), 'hello1');
  t.is(shell.cat('tmp/file2').toString(), 'hello2');
});

test('glob file names, with in-place-replacement', t => {
  shell.cp('resources/file*.txt', 'tmp/');
  t.is(shell.cat('tmp/file1.txt').toString(), 'test1\n');
  t.is(shell.cat('tmp/file2.txt').toString(), 'test2\n');
  var result = shell.sed('-i', 'test', 'hello', 'tmp/file*.txt');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello1\n\nhello2\n'); // TODO: fix sed's behavior
  t.is(shell.cat('tmp/file1.txt').toString(), 'hello1\n');
  t.is(shell.cat('tmp/file2.txt').toString(), 'hello2\n');
});

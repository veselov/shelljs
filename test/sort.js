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

test('No Test Title #21', t => {
                          var result = shell.sort();
                          t.truthy(shell.error());
                          t.truthy(result.code);
});

test('No Test Title #22', t => {
                          t.is(common.existsSync('/asdfasdf'), false); // sanity check
                          var result = shell.sort('/adsfasdf'); // file does not exist
                          t.truthy(shell.error());
                          t.truthy(result.code);
});

//
// Valids
//

test('simple', t => {
                          var result = shell.sort('resources/sort/file1');
                          t.is(shell.error(), null);
                          t.is(result.code, 0);
                          t.is(result + '', shell.cat('resources/sort/sorted'));
});

test('simple', t => {
                          var result = shell.sort('resources/sort/file2');
                          t.is(shell.error(), null);
                          t.is(result.code, 0);
                          t.is(result + '', shell.cat('resources/sort/sorted'));
});

test('multiple files', t => {
                          var result = shell.sort('resources/sort/file2', 'resources/sort/file1');
                          t.is(shell.error(), null);
                          t.is(result.code, 0);
                          t.is(result + '', doubleSorted);
});

test('multiple files, array syntax', t => {
                          var result = shell.sort(['resources/sort/file2', 'resources/sort/file1']);
                          t.is(shell.error(), null);
                          t.is(result.code, 0);
                          t.is(result + '', doubleSorted);
});

test('Globbed file', t => {
                          var result = shell.sort('resources/sort/file?');
                          t.is(shell.error(), null);
                          t.is(result.code, 0);
                          t.is(result + '', doubleSorted);
});

test('With \'-n\' option', t => {
                          var result = shell.sort('-n', 'resources/sort/file2');
                          t.is(shell.error(), null);
                          t.is(result.code, 0);
                          t.is(result + '', shell.cat('resources/sort/sortedDashN'));
});

test('With \'-r\' option', t => {
                          var result = shell.sort('-r', 'resources/sort/file2');
                          t.is(shell.error(), null);
                          t.is(result.code, 0);
                          t.is(result + '', shell.cat('resources/sort/sorted')
                                                    .trimRight()
                                                    .split('\n')
                                                    .reverse()
                                                    .join('\n') + '\n');
});

test('With \'-rn\' option', t => {
                          var result = shell.sort('-rn', 'resources/sort/file2');
                          t.is(shell.error(), null);
                          t.is(result.code, 0);
                          t.is(result + '', shell.cat('resources/sort/sortedDashN')
                                                    .trimRight()
                                                    .split('\n')
                                                    .reverse()
                                                    .join('\n') + '\n');
});

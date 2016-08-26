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

test('Normal strings don\'t have \'.toEnd()\' anymore', t => {
  var str = 'hello world';
  t.truthy(typeof str.toEnd === 'undefined');
});

test('No Test Title #24', t => {
  shell.ShellString('hello world').toEnd();
  t.truthy(shell.error());
});

test('No Test Title #25', t => {
  t.is(common.existsSync('/asdfasdf'), false); // sanity check
  t.truthy(shell.error());
});

//
// Valids
//

test('No Test Title #26', t => {
  var result;
  t.is(common.existsSync('tmp/toEnd1'), false); // Check file toEnd() creates does not already exist
  t.is(common.existsSync('tmp/toEnd2'), false);
  shell.ShellString('hello ').toEnd('tmp/toEnd1');
  t.is(common.existsSync('tmp/toEnd1'), true); // Check that file was created
  shell.ShellString('world').toEnd('tmp/toEnd1').toEnd('tmp/toEnd2'); // Write some more to the file
  result = shell.cat('tmp/toEnd1');
  t.is(shell.error(), null);
  t.is(result.toString(), 'hello world'); // Check that the result is what we expect
  result = shell.cat('tmp/toEnd2');
  t.is(shell.error(), null);
  t.is(result.toString(), 'world'); // Check that the result is what we expect
});

test('With a glob', t => {
  shell.ShellString('good').to('tmp/toE*1');
  shell.ShellString('bye').toEnd('tmp/toE*1');
  t.is(
    common.existsSync('tmp/toE*1'),
    false,
    'globs are not interpreted literally'
  );
  var result = shell.cat('tmp/toEnd1');
  t.is(shell.error(), null);
  t.is(result.toString(), 'goodbye');
});

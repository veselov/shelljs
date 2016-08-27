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

test('Normal strings don\'t have \'.to()\' anymore', t => {
  const str = 'hello world';
  t.truthy(typeof str.to === 'undefined');
});

test('No Test Title #48', t => {
  shell.ShellString('hello world').to();
  t.truthy(shell.error());
});

test('No Test Title #49', t => {
  t.is(common.existsSync('/asdfasdf'), false); // sanity check
  shell.ShellString('hello world').to('/asdfasdf/file');
  t.truthy(shell.error());
});

//
// Valids
//

test('No Test Title #51', t => {
  shell.ShellString('hello world').to('tmp/to1').to('tmp/to2');
  let result = shell.cat('tmp/to1');
  t.is(shell.error(), null);
  t.is(result.toString(), 'hello world');
  result = shell.cat('tmp/to2');
  t.is(shell.error(), null);
  t.is(result.toString(), 'hello world');
});

test('With a glob', t => {
  shell.ShellString('goodbye').to('tmp/t*1');
  t.is(common.existsSync('tmp/t*1'), false, 'globs are not interpreted literally');
  const result = shell.cat('tmp/to1');
  t.is(shell.error(), null);
  t.is(result.toString(), 'goodbye');
});

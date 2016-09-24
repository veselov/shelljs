import test from 'ava';
import shell from '..';
import common from '../src/common';
import windows from './_windows';

test.before(() => {
  shell.config.silent = true;

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Invalids
//

test('No Test Title #57', t => {
  shell.which();
  t.truthy(shell.error());
});

test('No Test Title #58', t => {
  const result = shell.which('asdfasdfasdfasdfasdf'); // what are the odds...
  t.truthy(!shell.error());
  t.truthy(!result);
});

//
// Valids
//

test('No Test Title #59', t => {
  const node = shell.which('node');
  t.is(node.code, 0);
  t.truthy(!node.stderr);
  t.truthy(!shell.error());
  t.truthy(common.existsSync(node + ''));
});

// TODO: Why are we skipping this?
windows.skip('No Test Title #60', t => {
  // This should be equivalent on Windows
  const node = shell.which('node');
  const nodeExe = shell.which('node.exe');
  t.truthy(!shell.error());
  // If the paths are equal, then this file *should* exist, since that's
  // already been checked.
  t.is(node + '', nodeExe + '');
});

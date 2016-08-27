import test from 'ava';
import shell from '..';
import common from '../src/common';

test.before(() => {
  shell.config.silent = true;

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Valids
//

test('No Test Title #19', t => {
  const tmp = shell.tempdir();
  t.is(shell.error(), null);
  t.is(common.existsSync(tmp), true);
});

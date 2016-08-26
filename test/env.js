import test from 'ava';
import shell from '..';

test.before(t => {
  shell.config.silent = true;

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Valids
//

test('No Test Title #69', t => {
  t.is(shell.env.PATH, process.env.PATH);
});

test('No Test Title #70', t => {
  shell.env.SHELLJS_TEST = 'hello world';
  t.is(shell.env.SHELLJS_TEST, process.env.SHELLJS_TEST);
});

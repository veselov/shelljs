import test from 'ava';
import shell from '..';

test.before(() => {
  shell.config.silent = true;

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Valids
//

test('existing variables', t => {
  t.is(shell.env.PATH, process.env.PATH);
});

test('variables are exported', t => {
  shell.env.SHELLJS_TEST = 'hello world';
  t.is(shell.env.SHELLJS_TEST, process.env.SHELLJS_TEST);
});

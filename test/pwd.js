import test from 'ava';
import shell from '..';
import path from 'path';

test.before(t => {
  shell.config.silent = true;

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Valids
//

test('No Test Title #81', t => {
  var _pwd = shell.pwd();
  t.is(shell.error(), null);
  t.is(_pwd.code, 0);
  t.truthy(!_pwd.stderr);
  t.is(_pwd.toString(), path.resolve('.'));
});

test('No Test Title #82', t => {
  shell.cd('tmp');
  var _pwd = shell.pwd();
  t.is(_pwd.code, 0);
  t.truthy(!_pwd.stderr);
  t.is(shell.error(), null);
  t.is(path.basename(_pwd.toString()), 'tmp');
});

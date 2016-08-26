import test from 'ava';
import shell from '..';
import path from 'path';

test.before(t => {
  shell.config.silent = true;

  var root = path.resolve();

  shell.pushd('resources/pushd');
  shell.pushd('a');
});


//
// Valids
//

var trail = [
  path.resolve(root, 'resources/pushd/a'),
  path.resolve(root, 'resources/pushd'),
  root
];

test('No Test Title #91', t => {
  t.deepEqual(shell.dirs(), trail);
});

test('Single items', t => {
  t.is(shell.dirs('+0'), trail[0]);
  t.is(shell.dirs('+1'), trail[1]);
  t.is(shell.dirs('+2'), trail[2]);
  t.is(shell.dirs('-0'), trail[2]);
  t.is(shell.dirs('-1'), trail[1]);
  t.is(shell.dirs('-2'), trail[0]);
});

test('Clearing items', t => {
  t.deepEqual(shell.dirs('-c'), []);
  t.truthy(!shell.error());
});

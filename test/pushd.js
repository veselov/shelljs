import test from 'ava';
import shell from '..';
import path from 'path';

test.before(t => {
  shell.config.silent = true;

  var root = path.resolve();

  function reset() {
    shell.dirs('-c');
    shell.cd(root);
  }
});


//
// Valids
//

test('Push valid directories', t => {
  var trail = shell.pushd('resources/pushd');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(root, 'resources/pushd'),
    root
  ]);
});

test('No Test Title #67', t => {
  var trail = shell.pushd('a');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(root, 'resources/pushd/a'),
    path.resolve(root, 'resources/pushd'),
    root
  ]);
});

test('No Test Title #68', t => {
  var trail = shell.pushd('../b');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(root, 'resources/pushd/b'),
    path.resolve(root, 'resources/pushd/a'),
    path.resolve(root, 'resources/pushd'),
    root
  ]);
});

test('No Test Title #69', t => {
  var trail = shell.pushd('c');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(root, 'resources/pushd/b/c'),
    path.resolve(root, 'resources/pushd/b'),
    path.resolve(root, 'resources/pushd/a'),
    path.resolve(root, 'resources/pushd'),
    root
  ]);
});

test('Push stuff around with positive indices', t => {
  var trail = shell.pushd('+0');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(root, 'resources/pushd/b/c'),
    path.resolve(root, 'resources/pushd/b'),
    path.resolve(root, 'resources/pushd/a'),
    path.resolve(root, 'resources/pushd'),
    root
  ]);
});

test('No Test Title #70', t => {
  var trail = shell.pushd('+1');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(root, 'resources/pushd/b'),
    path.resolve(root, 'resources/pushd/a'),
    path.resolve(root, 'resources/pushd'),
    root,
    path.resolve(root, 'resources/pushd/b/c')
  ]);
});

test('No Test Title #71', t => {
  var trail = shell.pushd('+2');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(root, 'resources/pushd'),
    root,
    path.resolve(root, 'resources/pushd/b/c'),
    path.resolve(root, 'resources/pushd/b'),
    path.resolve(root, 'resources/pushd/a')
  ]);
});

test('No Test Title #72', t => {
  var trail = shell.pushd('+3');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(root, 'resources/pushd/b'),
    path.resolve(root, 'resources/pushd/a'),
    path.resolve(root, 'resources/pushd'),
    root,
    path.resolve(root, 'resources/pushd/b/c')
  ]);
});

test('No Test Title #73', t => {
  var trail = shell.pushd('+4');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(root, 'resources/pushd/b/c'),
    path.resolve(root, 'resources/pushd/b'),
    path.resolve(root, 'resources/pushd/a'),
    path.resolve(root, 'resources/pushd'),
    root
  ]);
});

test('Push stuff around with negative indices', t => {
  var trail = shell.pushd('-0');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    root,
    path.resolve(root, 'resources/pushd/b/c'),
    path.resolve(root, 'resources/pushd/b'),
    path.resolve(root, 'resources/pushd/a'),
    path.resolve(root, 'resources/pushd')
  ]);
});

test('No Test Title #74', t => {
  var trail = shell.pushd('-1');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(root, 'resources/pushd/a'),
    path.resolve(root, 'resources/pushd'),
    root,
    path.resolve(root, 'resources/pushd/b/c'),
    path.resolve(root, 'resources/pushd/b')
  ]);
});

test('No Test Title #75', t => {
  var trail = shell.pushd('-2');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    root,
    path.resolve(root, 'resources/pushd/b/c'),
    path.resolve(root, 'resources/pushd/b'),
    path.resolve(root, 'resources/pushd/a'),
    path.resolve(root, 'resources/pushd')
  ]);
});

test('No Test Title #76', t => {
  var trail = shell.pushd('-3');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(root, 'resources/pushd/b/c'),
    path.resolve(root, 'resources/pushd/b'),
    path.resolve(root, 'resources/pushd/a'),
    path.resolve(root, 'resources/pushd'),
    root
  ]);
});

test('No Test Title #77', t => {
  var trail = shell.pushd('-4');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(root, 'resources/pushd/b/c'),
    path.resolve(root, 'resources/pushd/b'),
    path.resolve(root, 'resources/pushd/a'),
    path.resolve(root, 'resources/pushd'),
    root
  ]);
});

test('Push without changing directory or resolving paths', t => {
  reset();
  var trail = shell.pushd('-n', 'resources/pushd');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    root,
    'resources/pushd'
  ]);
});

test('No Test Title #78', t => {
  var trail = shell.pushd('-n', 'resources/pushd/a');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    root,
    'resources/pushd/a',
    'resources/pushd'
  ]);
});

test('Push invalid directory', t => {
  shell.pushd('does/not/exist');
  t.is(
    shell.error(),
    'pushd: no such file or directory: ' + path.resolve('.', 'does/not/exist')
  );
  t.is(process.cwd(), trail[0]);
});

test(
  'Push without arguments should swap top two directories when stack length is 2',
  t => {
    reset();
    var trail = shell.pushd('resources/pushd');
    t.is(shell.error(), null);
    t.is(trail.length, 2);
    t.is(path.relative(root, trail[0]), path.join('resources', 'pushd'));
    t.is(trail[1], root);
    t.is(process.cwd(), trail[0]);
    var trail = shell.pushd();
    t.is(shell.error(), null);
    t.is(trail.length, 2);
    t.is(trail[0], root);
    t.is(path.relative(root, trail[1]), path.join('resources', 'pushd'));
    t.is(process.cwd(), trail[0]);
  }
);

test(
  'Push without arguments should swap top two directories when stack length is > 2',
  t => {
    var trail = shell.pushd('resources/pushd/a');
    t.is(shell.error(), null);
    t.is(trail.length, 3);
    t.is(path.relative(root, trail[0]), path.join('resources', 'pushd', 'a'));
    t.is(trail[1], root);
    t.is(path.relative(root, trail[2]), path.join('resources', 'pushd'));
    t.is(process.cwd(), trail[0]);
  }
);

test('No Test Title #79', t => {
  var trail = shell.pushd();
  t.is(shell.error(), null);
  t.is(trail.length, 3);
  t.is(trail[0], root);
  t.is(path.relative(root, trail[1]), path.join('resources', 'pushd', 'a'));
  t.is(path.relative(root, trail[2]), path.join('resources', 'pushd'));
  t.is(process.cwd(), trail[0]);
});

test('Push without arguments invalid when stack is empty', t => {
  reset();shell.pushd();
  t.is(shell.error(), 'pushd: no other directory');
});

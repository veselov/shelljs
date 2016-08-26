import test from 'ava';
import plugin from '../plugin';
import shell from '..';

var data = 0;
var ret;
var fname;

function fooImplementation(options, arg) {
  // Some sort of side effect, so we know when this is called
  if (arg) {
    fname = arg;
  } else {
    fname = plugin.readFromPipe();
  }

  if (arg === 'exitWithCode5') {
    plugin.error('Exited with code 5', 5);
  }

  if (options.flag) {
    data = 12;
  } else {
    data++;
  }
  return 'hello world';
}

test.before(t => {
  shell.config.silent = true;
});


//
// Valids
//

test('All plugin utils exist', t => {
  t.is(typeof plugin.error, 'function');
  t.is(typeof plugin.parseOptions, 'function');
  t.is(typeof plugin.readFromPipe, 'function');
  t.is(typeof plugin.register, 'function');
});

test('The plugin does not exist before it\'s registered', t => {
  t.falsy(shell.foo);
});

test('Register the plugin', t => {
  plugin.register('foo', fooImplementation, {
    cmdOptions: {
      'f': 'flag',
    },
    wrapOutput: true,
    canReceivePipe: true,
  });
});

test('The plugin exists after registering', t => {
  t.is(typeof shell.foo, 'function');
});

test('The command fails for invalid options', t => {
  var ret = shell.foo('-n', 'filename');
  t.is(ret.code, 1);
  t.is(ret.stdout, '');
  t.is(ret.stderr, 'foo: option not recognized: n');
  t.is(shell.error(), 'foo: option not recognized: n');
});

test('The command succeeds for normal calls', t => {
  t.is(data, 0);
  shell.foo('filename');
  t.is(data, 1);
  t.is(fname, 'filename');
  shell.foo('filename2');
  t.is(data, 2);
  t.is(fname, 'filename2');
});

test('The command parses options', t => {
  shell.foo('-f', 'filename');
  t.is(data, 12);
  t.is(fname, 'filename');
});

test('The command supports globbing by default', t => {
  shell.foo('-f', 're*u?ces');
  t.is(data, 12);
  t.is(fname, 'resources');
});

test('Plugins are also compatible with shelljs/global', t => {
  require('../global');
  t.is(typeof global.foo, 'function');
  t.is(global.foo, shell.foo);
});

test('Plugins can be added as methods to ShellStrings', t => {
  var ret = shell.ShellString('hello world\n');
  t.is(ret.toString(), 'hello world\n');
  t.is(typeof ret.grep, 'function'); // existing methods persist
  t.is(typeof ret.foo, 'function');
  ret.foo();
  t.is(fname, 'hello world\n'); // readFromPipe() works
});

test('Plugins can signal errors', t => {
  var ret = shell.foo('exitWithCode5');
  t.is(ret.code, 5);
  t.is(ret.stdout, '');
  t.is(ret.stderr, 'foo: Exited with code 5');
  t.is(shell.error(), 'foo: Exited with code 5');
});

test('Cannot overwrite an existing command by default', t => {
  var oldCat = shell.cat;
  t.throws(function () {
    plugin.register('cat', fooImplementation);
  }, 'unable to overwrite `cat` command');
  t.is(shell.cat, oldCat);
});

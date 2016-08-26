import test from 'ava';
import shell from '..';
import util from 'util';
import path from 'path';
import os from 'os';

test.before(t => {
  shell.config.silent = true;
});


//
// Invalids
//

test('No Test Title #72', t => {
  shell.exec();
  t.truthy(shell.error());
});

test('No Test Title #73', t => {
  var result = shell.exec('asdfasdf'); // could not find command
  t.truthy(result.code > 0);
});

test(
  'Test \'fatal\' mode for exec, temporarily overriding process.exit',
  t => {
    var oldFatal = shell.config.fatal;
  }
);

test('No Test Title #74', t => {
  shell.config.fatal = true;
});

test('No Test Title #75', t => {
  t.throws(function () {
    shell.exec('asdfasdf'); // could not find command
  }, /exec: internal error/);
});

test('No Test Title #76', t => {
  shell.config.fatal = oldFatal;
});

//
// Valids
//

//
// sync
//

test('check if stdout goes to output', t => {
  var result = shell.exec(JSON.stringify(process.execPath) + ' -e "console.log(1234);"');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.truthy(result.stdout === '1234\n' || result.stdout === '1234\nundefined\n'); // 'undefined' for v0.4
});

test('check if stderr goes to output', t => {
  var result = shell.exec(JSON.stringify(process.execPath) + ' -e "console.error(1234);"');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.truthy(result.stdout === '' || result.stdout === 'undefined\n'); // 'undefined' for v0.4
  t.truthy(result.stderr === '1234\n' || result.stderr === '1234\nundefined\n'); // 'undefined' for v0.4
});

test('check if stdout + stderr go to output', t => {
  var result = shell.exec(JSON.stringify(process.execPath) + ' -e "console.error(1234); console.log(666);"');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.truthy(result.stdout === '666\n' || result.stdout === '666\nundefined\n');  // 'undefined' for v0.4
  t.truthy(result.stderr === '1234\n' || result.stderr === '1234\nundefined\n');  // 'undefined' for v0.4
});

test('check exit code', t => {
  var result = shell.exec(JSON.stringify(process.execPath) + ' -e "process.exit(12);"');
  t.truthy(shell.error());
  t.is(result.code, 12);
});

test('interaction with cd', t => {
  shell.cd('resources/external');
  var result = shell.exec(JSON.stringify(process.execPath) + ' node_script.js');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.stdout, 'node_script_1234\n');
  shell.cd('../..');
});

test('check quotes escaping', t => {
  var result = shell.exec(util.format(JSON.stringify(process.execPath) + ' -e "console.log(%s);"', "\\\"\\'+\\'_\\'+\\'\\\""));
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.stdout, "'+'_'+'\n");
});

test('set cwd', t => {
  var cmdString = process.platform === 'win32' ? 'cd' : 'pwd';
  var result = shell.exec(cmdString, { cwd: '..' });
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.stdout, path.resolve('..') + os.EOL);
});

test('set maxBuffer (very small)', t => {
  var result = shell.exec('echo 1234567890'); // default maxBuffer is ok
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.stdout, '1234567890' + os.EOL);
  if (process.version >= 'v0.11') { // this option doesn't work on v0.10
    shell.exec('echo 1234567890', { maxBuffer: 6 });
    t.truthy(shell.error());
  }
});

test('set timeout option', t => {
  var result = shell.exec(JSON.stringify(process.execPath) + ' resources/exec/slow.js 100'); // default timeout is ok
  t.truthy(!shell.error());
  t.is(result.code, 0);
  if (process.version >= 'v0.11') {
    // this option doesn't work on v0.10
    var result = shell.exec(JSON.stringify(process.execPath) + ' resources/exec/slow.js 100', { timeout: 10 }); // times out

    t.truthy(shell.error());
  }
});

test('check process.env works', t => {
  t.truthy(!shell.env.FOO);
  shell.env.FOO = 'Hello world';
  var result = shell.exec(process.platform !== 'win32' ? 'echo $FOO' : 'echo %FOO%');
  t.truthy(!shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, 'Hello world' + os.EOL);
  t.is(result.stderr, '');
});

test('set shell option (TODO: add tests for Windows)', t => {
  if (process.platform !== 'win32') {
    var result = shell.exec('echo $0');
    t.truthy(!shell.error());
    t.is(result.code, 0);
    t.is(result.stdout, '/bin/sh\n'); // sh by default
    var bashPath = shell.which('bash').trim();
    // this option doesn't work on v0.10
    if (bashPath && process.version >= 'v0.11') {
      var result = shell.exec('echo $0', { shell: '/bin/bash' });
      t.truthy(!shell.error());
      t.is(result.code, 0);
      t.is(result.stdout, '/bin/bash\n');
    }
  }
});

test('exec returns a ShellString', t => {
  var result = shell.exec('echo foo');
  t.truthy(typeof result === 'object');
  t.truthy(result instanceof String);
  t.truthy(typeof result.stdout === 'string');
  t.true(result.toString() === result.stdout);
});

//
// async
//

test('no callback', t => {
  var c = shell.exec(JSON.stringify(process.execPath) + ' -e "console.log(1234)"', { async: true });
  t.is(shell.error(), null);
  t.truthy('stdout' in c, 'async exec returns child process object');

  //
  // callback as 2nd argument
  //
  shell.exec(JSON.stringify(process.execPath) + ' -e "console.log(5678);"', function (code, stdout, stderr) {
    t.is(code, 0);
    t.truthy(stdout === '5678\n' || stdout === '5678\nundefined\n');  // 'undefined' for v0.4
    t.truthy(stderr === '' || stderr === 'undefined\n');  // 'undefined' for v0.4

  // @@TEST(No Test Title #77)
    //
    // callback as 3rd argument
    //
    shell.exec(JSON.stringify(process.execPath) + ' -e "console.log(5566);"', { async: true }, function (code2, stdout2, stderr2) {
      t.is(code2, 0);
      t.truthy(stdout2 === '5566\n' || stdout2 === '5566\nundefined\n');  // 'undefined' for v0.4
      t.truthy(stderr2 === '' || stderr2 === 'undefined\n');  // 'undefined' for v0.4

  // @@TEST(No Test Title #78)
      //
      // callback as 3rd argument (slient:true)
      //
      shell.exec(JSON.stringify(process.execPath) + ' -e "console.log(5678);"', { silent: true }, function (code3, stdout3, stderr3) {
        t.is(code3, 0);
        t.truthy(stdout3 === '5678\n' || stdout3 === '5678\nundefined\n');  // 'undefined' for v0.4
        t.truthy(stderr3 === '' || stderr3 === 'undefined\n');  // 'undefined' for v0.4
      });
    });
  });
});

test('No Test Title #80', t => {
  t.is(shell.error(), null);
});

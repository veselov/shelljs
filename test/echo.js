import test from 'ava';
import shell from '..';
import child from 'child_process';

test.before(t => {
  shell.config.silent = true;

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Valids
//

test('simple test with defaults', t => {
  var file = 'tmp/tempscript' + Math.random() + '.js';
  var script = 'require(\'../../global.js\'); echo("-asdf", "111");'; // test '-' bug (see issue #20)
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath) + ' ' + file, function (err, stdout, stderr) {
    t.is(stdout, '-asdf 111\n');
  });
});

test('using null as an explicit argument doesn\'t crash the function', t => {
  var file = 'tmp/tempscript' + Math.random() + '.js';
  var script = 'require(\'../../global.js\'); echo(null);';
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath) + ' ' + file, function (err, stdout, stderr) {
    t.is(stdout, 'null\n');
    t.is(stderr, '');
  });
});

test('simple test with silent(true)', t => {
  var script = 'require(\'../../global.js\'); config.silent=true; echo(555);';
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath) + ' ' + file, function (err, stdout) {
    t.is(stdout, '555\n');
  });
});

test('No Test Title #1', t => {
  var script = "require('../../global.js'); echo('-e', '\\tmessage');";
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath) + ' ' + file, function (err, stdout) {
    t.is(stdout, '\tmessage\n');
  });
});


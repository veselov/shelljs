import test from 'ava';
import shell from '..';
import child from 'child_process';
import common from '../src/common';
test.before(t => {});


//
// Valids
//

//
// config.silent
//

test('No Test Title #85', t => {
  t.is(shell.config.silent, false);
});

test('No Test Title #86', t => {
  shell.config.silent = true;
  t.is(shell.config.silent, true);
});

test('No Test Title #87', t => {
  shell.config.silent = false;
  t.is(shell.config.silent, false);
});

//
// config.fatal
//

test('No Test Title #88', t => {
  t.is(shell.config.fatal, false);

  //
  // config.fatal = false
  //
  shell.mkdir('-p', 'tmp');
  var file = 'tmp/tempscript' + Math.random() + '.js';
  var script = 'require(\'../../global.js\'); config.silent=true; config.fatal=false; cp("this_file_doesnt_exist", "."); echo("got here");';
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath) + ' ' + file, function (err, stdout) {
    t.truthy(stdout.match('got here'));

  // @@TEST(No Test Title #89)
    //
    // config.fatal = true
    //
    shell.mkdir('-p', 'tmp');
    file = 'tmp/tempscript' + Math.random() + '.js';
    script = 'require(\'../../global.js\'); config.silent=true; config.fatal=true; cp("this_file_doesnt_exist", "."); echo("got here");';
    shell.ShellString(script).to(file);
    child.exec(JSON.stringify(process.execPath) + ' ' + file, function (err2, stdout2) {
      t.truthy(!stdout2.match('got here'));
    });
  });
});

//
// config.globOptions
//

test('Expands to directories by default', t => {
  var result = common.expand(['resources/*a*']);
  t.is(result.length, 5);
  t.truthy(result.indexOf('resources/a.txt') > -1);
  t.truthy(result.indexOf('resources/badlink') > -1);
  t.truthy(result.indexOf('resources/cat') > -1);
  t.truthy(result.indexOf('resources/head') > -1);
  t.truthy(result.indexOf('resources/external') > -1);
});

test(
  'Check to make sure options get passed through (nodir is an example)',
  t => {
    shell.config.globOptions = { nodir: true };
    var result = common.expand(['resources/*a*']);
    t.is(result.length, 2);
    t.truthy(result.indexOf('resources/a.txt') > -1);
    t.truthy(result.indexOf('resources/badlink') > -1);
    t.truthy(result.indexOf('resources/cat') < 0);
    t.truthy(result.indexOf('resources/external') < 0);
  }
);

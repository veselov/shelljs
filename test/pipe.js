import test from 'ava';
import shell from '..';

test.before(t => {
  shell.config.silent = true;

  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Invalids
//

test('commands like `rm` can\'t be on the right side of pipes', t => {
  t.is(typeof shell.ls('.').rm, 'undefined');
  t.is(typeof shell.cat('resources/file1.txt').rm, 'undefined');
});

//
// Valids
//

test('piping to cat() should return roughly the same thing', t => {
  t.true(
    shell.cat('resources/file1.txt').cat().toString() === shell.cat('resources/file1.txt').toString()
  );
});

test('piping ls() into cat() converts to a string', t => {
  t.true(shell.ls('resources/').cat().toString() === shell.ls('resources/').stdout);
});

test('No Test Title #52', t => {
  var result;
  result = shell.ls('resources/').grep('file1');
  t.is(result + '', 'file1\nfile1.js\nfile1.txt\n');
});

test('No Test Title #53', t => {
  var result = shell.ls('resources/').cat().grep('file1');
  t.is(result + '', 'file1\nfile1.js\nfile1.txt\n');
});

test('Equivalent to a simple grep() test case', t => {
  var result = shell.cat('resources/grep/file').grep(/alpha*beta/);
  t.is(shell.error(), null);
  t.is(result.toString(), 'alphaaaaaaabeta\nalphbeta\n');
});

test('Equivalent to a simple sed() test case', t => {
  var result = shell.cat('resources/grep/file').sed(/l*\.js/, '');
  t.truthy(!shell.error());
  t.is(
    result.toString(),
    'alphaaaaaaabeta\nhowareyou\nalphbeta\nthis line ends in\n\n'
  );
});

test('Sort a file by frequency of each line', t => {
  var result = shell.sort('resources/uniq/pipe').uniq('-c').sort('-n');
  t.is(shell.error(), null);
  t.is(result.toString(), shell.cat('resources/uniq/pipeSorted').toString());

  // Synchronous exec
  // TODO: add windows tests
  if (process.platform !== 'win32') {
    // unix-specific
    if (shell.which('grep').stdout) {
      var result = shell.cat('resources/grep/file').exec("grep 'alpha*beta'");
      t.is(shell.error(), null);
      t.is(result.toString(), 'alphaaaaaaabeta\nalphbeta\n');
    } else {
      console.error('Warning: Cannot verify piped exec');
    }
  } else {
    console.error('Warning: Cannot verify piped exec');
  }

  // Async exec
  // TODO: add windows tests
  if (process.platform !== 'win32') {
    // unix-specific
    if (shell.which('grep').stdout) {
      shell.cat('resources/grep/file').exec("grep 'alpha*beta'", function (code, stdout) {
        t.is(code, 0);
        t.is(stdout, 'alphaaaaaaabeta\nalphbeta\n');
      });
    } else {
      console.error('Warning: Cannot verify piped exec');
    }
  } else {
    console.error('Warning: Cannot verify piped exec');
  }
});

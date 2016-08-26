import test from 'ava';
import shell from '..';
import common from '../src/common';
import fs from 'fs';

test.before(t => {
  var numLines = require('./utils/utils').numLines;

  shell.config.silent = true;

  var isWindows = common.platform === 'win';

  // On Windows, symlinks for files need admin permissions. This helper
  // skips certain tests if we are on Windows and got an EPERM error
  function skipOnWinForEPERM(action, test) {
    action();
    var error = shell.error();

    if (isWindows && error && /EPERM:/.test(error)) {
      console.log('Got EPERM when testing symlinks on Windows. Assuming non-admin environment and skipping test.');
    } else {
      test();
    }
  }


  shell.rm('-rf', 'tmp');
  shell.mkdir('tmp');
});


//
// Invalids
//

test('No Test Title #31', t => {
  var result = shell.cp();
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cp: missing <source> and/or <dest>');
});

test('No Test Title #32', t => {
  var result = shell.cp('file1');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cp: missing <source> and/or <dest>');
});

test('No Test Title #33', t => {
  var result = shell.cp('-f');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cp: missing <source> and/or <dest>');
});

test('No Test Title #34', t => {
  shell.rm('-rf', 'tmp/*');
  var result = shell.cp('-@', 'resources/file1', 'tmp/file1'); // option not supported, files OK
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(common.existsSync('tmp/file1'), false);
  t.is(result.stderr, 'cp: option not recognized: @');
});

test('No Test Title #35', t => {
  var result = shell.cp('-Z', 'asdfasdf', 'tmp/file2'); // option not supported, files NOT OK
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(common.existsSync('tmp/file2'), false);
  t.is(result.stderr, 'cp: option not recognized: Z');
});

test('No Test Title #36', t => {
  var result = shell.cp('asdfasdf', 'tmp'); // source does not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(numLines(result.stderr), 1);
  t.is(common.existsSync('tmp/asdfasdf'), false);
  t.is(result.stderr, 'cp: no such file or directory: asdfasdf');
});

test('No Test Title #37', t => {
  var result = shell.cp('asdfasdf1', 'asdfasdf2', 'tmp'); // sources do not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(numLines(result.stderr), 2);
  t.is(common.existsSync('tmp/asdfasdf1'), false);
  t.is(common.existsSync('tmp/asdfasdf2'), false);
  t.is(
    result.stderr,
    'cp: no such file or directory: asdfasdf1\ncp: no such file or directory: asdfasdf2'
  );
});

test('No Test Title #38', t => {
  var result = shell.cp('asdfasdf1', 'asdfasdf2', 'resources/file1'); // too many sources (dest is file)
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cp: dest is not a directory (too many sources)');
});

test('No Test Title #39', t => {
  var result = shell.cp('resources/file1', 'resources/file2', 'tmp/a_file'); // too many sources
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(common.existsSync('tmp/a_file'), false);
  t.is(result.stderr, 'cp: dest is not a directory (too many sources)');
});

//
// Valids
//

test('No Test Title #40', t => {
  var oldContents = shell.cat('resources/file2').toString();
  var result = shell.cp('-n', 'resources/file1', 'resources/file2'); // dest already exists
  t.truthy(!shell.error());
  t.is(result.code, 0);
  t.is(result.stderr, '');
  t.is(shell.cat('resources/file2').toString(), oldContents);
});

test('-f by default', t => {
  var result = shell.cp('resources/file2', 'resources/copyfile2');
  var result = shell.cp('resources/file1', 'resources/file2'); // dest already exists
  t.truthy(!shell.error());
  t.is(result.code, 0);
  t.truthy(!result.stderr);
  t.is(shell.cat('resources/file1') + '', shell.cat('resources/file2') + ''); // after cp
  shell.mv('resources/copyfile2', 'resources/file2'); // restore
  t.truthy(!shell.error());
});

test('-f (explicitly)', t => {
  var result = shell.cp('resources/file2', 'resources/copyfile2');
  var result = shell.cp('-f', 'resources/file1', 'resources/file2'); // dest already exists
  t.truthy(!shell.error());
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.is(shell.cat('resources/file1') + '', shell.cat('resources/file2') + ''); // after cp
  shell.mv('resources/copyfile2', 'resources/file2'); // restore
  t.truthy(!shell.error());
  t.is(result.code, 0);
});

test('simple - to dir', t => {
  var result = shell.cp('resources/file1', 'tmp');
  t.is(shell.error(), null);
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/file1'), true);
});

test('simple - to file', t => {
  var result = shell.cp('resources/file2', 'tmp/file2');
  t.is(shell.error(), null);
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/file2'), true);
});

test('simple - file list', t => {
  shell.rm('-rf', 'tmp/*');
  var result = shell.cp('resources/file1', 'resources/file2', 'tmp');
  t.is(shell.error(), null);
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/file1'), true);
  t.is(common.existsSync('tmp/file2'), true);
});

test('simple - file list, array syntax', t => {
  shell.rm('-rf', 'tmp/*');
  var result = shell.cp(['resources/file1', 'resources/file2'], 'tmp');
  t.is(shell.error(), null);
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/file1'), true);
  t.is(common.existsSync('tmp/file2'), true);
});

test('No Test Title #41', t => {
  var result = shell.cp('resources/file2', 'tmp/file3');
  t.is(common.existsSync('tmp/file3'), true);
  var result = shell.cp('-f', 'resources/file2', 'tmp/file3'); // file exists, but -f specified
  t.is(shell.error(), null);
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/file3'), true);
});

test('glob', t => {
  shell.rm('-rf', 'tmp/*');
  var result = shell.cp('resources/file?', 'tmp');
  t.is(shell.error(), null);
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.truthy(common.existsSync('tmp/file1'));
  t.truthy(common.existsSync('tmp/file2'));
  t.truthy(!common.existsSync('tmp/file1.js'));
  t.truthy(!common.existsSync('tmp/file2.js'));
  t.truthy(!common.existsSync('tmp/file1.txt'));
  t.truthy(!common.existsSync('tmp/file2.txt'));
});

test('wildcard', t => {
  shell.rm('tmp/file1', 'tmp/file2');
  var result = shell.cp('resources/file*', 'tmp');
  t.is(shell.error(), null);
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.truthy(common.existsSync('tmp/file1'));
  t.truthy(common.existsSync('tmp/file2'));
  t.truthy(common.existsSync('tmp/file1.js'));
  t.truthy(common.existsSync('tmp/file2.js'));
  t.truthy(common.existsSync('tmp/file1.txt'));
  t.truthy(common.existsSync('tmp/file2.txt'));
});

test('recursive, with regular files', t => {
  shell.rm('-rf', 'tmp/*');
  var result = shell.cp('-R', 'resources/file1', 'resources/file2', 'tmp');
  t.is(shell.error(), null);
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.truthy(common.existsSync('tmp/file1'));
  t.truthy(common.existsSync('tmp/file2'));
});

test('recursive, nothing exists', t => {
  shell.rm('-rf', 'tmp/*');
  var result = shell.cp('-R', 'resources/cp', 'tmp');
  t.is(shell.error(), null);
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.is(shell.ls('-R', 'resources/cp') + '', shell.ls('-R', 'tmp/cp') + '');
});

test(
  'recursive, nothing exists, source ends in \'/\' (see Github issue #15)',
  t => {
    shell.rm('-rf', 'tmp/*');
    var result = shell.cp('-R', 'resources/cp/', 'tmp/');
    t.is(shell.error(), null);
    t.truthy(!result.stderr);
    t.is(result.code, 0);
    t.is(shell.ls('-R', 'resources/cp') + '', shell.ls('-R', 'tmp/cp') + '');
  }
);

test(
  'recursive, globbing regular files with extension (see Github issue #376)',
  t => {
    shell.rm('-rf', 'tmp/*');
    var result = shell.cp('-R', 'resources/file*.txt', 'tmp');
    t.is(shell.error(), null);
    t.truthy(!result.stderr);
    t.is(result.code, 0);
    t.truthy(common.existsSync('tmp/file1.txt'));
    t.truthy(common.existsSync('tmp/file2.txt'));
  }
);

test(
  'recursive, copying one regular file (also related to Github issue #376)',
  t => {
    shell.rm('-rf', 'tmp/*');
    var result = shell.cp('-R', 'resources/file1.txt', 'tmp');
    t.is(shell.error(), null);
    t.truthy(!result.stderr);
    t.is(result.code, 0);
    t.truthy(common.existsSync('tmp/file1.txt'));
    t.truthy(!fs.statSync('tmp/file1.txt').isDirectory()); // don't let it be a dir
  }
);

test('recursive, everything exists, no force flag', t => {
  shell.rm('-rf', 'tmp/*');
  var result = shell.cp('-R', 'resources/cp', 'tmp');
  var result = shell.cp('-R', 'resources/cp', 'tmp');
  t.is(shell.error(), null); // crash test only
  t.truthy(!result.stderr);
  t.is(result.code, 0);
});

test('No Test Title #42', t => {
  if (process.platform !== 'win32') {
    // Recursive, everything exists, overwrite a real file with a link (if same name)
    // Because -R implies to not follow links!
    shell.rm('-rf', 'tmp/*');
    shell.cp('-R', 'resources/cp/*', 'tmp');
    t.truthy(fs.lstatSync('tmp/links/sym.lnk').isSymbolicLink()); // this one is a link
    t.truthy(!(fs.lstatSync('tmp/fakeLinks/sym.lnk').isSymbolicLink())); // this one isn't
    t.not(
      shell.cat('tmp/links/sym.lnk').toString(),
      shell.cat('tmp/fakeLinks/sym.lnk').toString()
    );
    var result = shell.cp('-R', 'tmp/links/*', 'tmp/fakeLinks');
    t.is(shell.error(), null);
    t.truthy(!result.stderr);
    t.is(result.code, 0);
    t.truthy(fs.lstatSync('tmp/links/sym.lnk').isSymbolicLink()); // this one is a link
    t.truthy(fs.lstatSync('tmp/fakeLinks/sym.lnk').isSymbolicLink()); // this one is now a link
    t.is(
      shell.cat('tmp/links/sym.lnk').toString(),
      shell.cat('tmp/fakeLinks/sym.lnk').toString()
    );

    // @@TEST(No Test Title #43)
    // Recursive, everything exists, overwrite a real file *by following a link*
    // Because missing the -R implies -L.
    shell.rm('-rf', 'tmp/*');
    shell.cp('-R', 'resources/cp/*', 'tmp');
    t.truthy(fs.lstatSync('tmp/links/sym.lnk').isSymbolicLink()); // this one is a link
    t.truthy(!(fs.lstatSync('tmp/fakeLinks/sym.lnk').isSymbolicLink())); // this one isn't
    t.not(
      shell.cat('tmp/links/sym.lnk').toString(),
      shell.cat('tmp/fakeLinks/sym.lnk').toString()
    );
    var result = shell.cp('tmp/links/*', 'tmp/fakeLinks'); // don't use -R
    t.is(shell.error(), null);
    t.truthy(!result.stderr);
    t.is(result.code, 0);
    t.truthy(fs.lstatSync('tmp/links/sym.lnk').isSymbolicLink()); // this one is a link
    t.truthy(!fs.lstatSync('tmp/fakeLinks/sym.lnk').isSymbolicLink()); // this one is still not a link
    // But it still follows the link
    t.is(
      shell.cat('tmp/links/sym.lnk').toString(),
      shell.cat('tmp/fakeLinks/sym.lnk').toString()
    );
  }
});

test('recursive, everything exists, with force flag', t => {
  shell.rm('-rf', 'tmp/*');
  var result = shell.cp('-R', 'resources/cp', 'tmp');
  shell.ShellString('changing things around').to('tmp/cp/dir_a/z');
  t.not(shell.cat('resources/cp/dir_a/z') + '', shell.cat('tmp/cp/dir_a/z') + ''); // before cp
  var result = shell.cp('-Rf', 'resources/cp', 'tmp');
  t.is(shell.error(), null);
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.is(shell.cat('resources/cp/dir_a/z') + '', shell.cat('tmp/cp/dir_a/z') + ''); // after cp
});

test(
  'recursive, creates dest dir since it\'s only one level deep (see Github issue #44)',
  t => {
    shell.rm('-rf', 'tmp/*');
    var result = shell.cp('-r', 'resources/issue44', 'tmp/dir2');
    t.is(shell.error(), null);
    t.truthy(!result.stderr);
    t.is(result.code, 0);
    t.is(shell.ls('-R', 'resources/issue44') + '', shell.ls('-R', 'tmp/dir2') + '');
    t.is(
      shell.cat('resources/issue44/main.js') + '',
      shell.cat('tmp/dir2/main.js') + ''
    );
  }
);

test(
  'recursive, does *not* create dest dir since it\'s too deep (see Github issue #44)',
  t => {
    shell.rm('-rf', 'tmp/*');
    var result = shell.cp('-r', 'resources/issue44', 'tmp/dir2/dir3');
    t.truthy(shell.error());
    t.is(
      result.stderr,
      'cp: cannot create directory \'tmp/dir2/dir3\': No such file or directory'
    );
    t.is(result.code, 1);
    t.is(common.existsSync('tmp/dir2'), false);
  }
);

test('recursive, copies entire directory', t => {
  shell.rm('-rf', 'tmp/*');
  var result = shell.cp('-r', 'resources/cp/dir_a', 'tmp/dest');
  t.is(shell.error(), null);
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.is(common.existsSync('tmp/dest/z'), true);
});

test('recursive, with trailing slash, does the exact same', t => {
  shell.rm('-rf', 'tmp/*');
  var result = shell.cp('-r', 'resources/cp/dir_a/', 'tmp/dest');
  t.is(shell.error(), null);
  t.is(common.existsSync('tmp/dest/z'), true);
});

test(
  'On Windows, permission bits are quite different so skip those tests for now',
  t => {
    if (common.platform !== 'win') {
      // preserve mode bits
      shell.rm('-rf', 'tmp/*');
      var execBit = parseInt('001', 8);
      t.is(fs.statSync('resources/cp-mode-bits/executable').mode & execBit, execBit);
      shell.cp('resources/cp-mode-bits/executable', 'tmp/executable');
      t.is(
        fs.statSync('resources/cp-mode-bits/executable').mode,
        fs.statSync('tmp/executable').mode
      );
    }
  }
);

test('Make sure hidden files are copied recursively', t => {
  shell.rm('-rf', 'tmp/');
  var result = shell.cp('-r', 'resources/ls/', 'tmp/');
  t.truthy(!shell.error());
  t.truthy(!result.stderr);
  t.is(result.code, 0);
  t.truthy(common.existsSync('tmp/.hidden_file'));
});

test('no-recursive will copy regular files only', t => {
  shell.rm('-rf', 'tmp/');
  shell.mkdir('tmp/');
  var result = shell.cp('resources/file1.txt', 'resources/ls/', 'tmp/');
  t.truthy(shell.error());
  t.truthy(!common.existsSync('tmp/.hidden_file')); // doesn't copy dir contents
  t.truthy(!common.existsSync('tmp/ls')); // doesn't copy dir itself
  t.truthy(common.existsSync('tmp/file1.txt'));
});

test('no-recursive will copy regular files only', t => {
  shell.rm('-rf', 'tmp/');
  shell.mkdir('tmp/');

  var result = shell.cp('resources/file1.txt', 'resources/file2.txt', 'resources/cp',
    'resources/ls/', 'tmp/');

  t.truthy(shell.error());
  t.truthy(!common.existsSync('tmp/.hidden_file')); // doesn't copy dir contents
  t.truthy(!common.existsSync('tmp/ls')); // doesn't copy dir itself
  t.truthy(!common.existsSync('tmp/a')); // doesn't copy dir contents
  t.truthy(!common.existsSync('tmp/cp')); // doesn't copy dir itself
  t.truthy(common.existsSync('tmp/file1.txt'));
  t.truthy(common.existsSync('tmp/file2.txt'));
});

test('No Test Title #44', t => {
  if (process.platform !== 'win32') {
    // -R implies -P
    shell.rm('-rf', 'tmp/*');
    shell.cp('-R', 'resources/cp/links/sym.lnk', 'tmp');
    t.truthy(fs.lstatSync('tmp/sym.lnk').isSymbolicLink());

    // @@TEST(No Test Title #45)
    // using -P explicitly works
    shell.rm('-rf', 'tmp/*');
    shell.cp('-P', 'resources/cp/links/sym.lnk', 'tmp');
    t.truthy(fs.lstatSync('tmp/sym.lnk').isSymbolicLink());

    // @@TEST(No Test Title #46)
    // using -PR on a link to a folder does not follow the link
    shell.rm('-rf', 'tmp/*');
    shell.cp('-PR', 'resources/cp/symFolder', 'tmp');
    t.truthy(fs.lstatSync('tmp/symFolder').isSymbolicLink());

    // @@TEST(No Test Title #47)
    // -L overrides -P for copying directory
    shell.rm('-rf', 'tmp/*');
    shell.cp('-LPR', 'resources/cp/symFolder', 'tmp');
    t.truthy(!fs.lstatSync('tmp/symFolder').isSymbolicLink());
    t.truthy(!fs.lstatSync('tmp/symFolder/sym.lnk').isSymbolicLink());

    // @@TEST(No Test Title #48)
    // Recursive, copies entire directory with no symlinks and -L option does not cause change in behavior.
    shell.rm('-rf', 'tmp/*');
    var result = shell.cp('-rL', 'resources/cp/dir_a', 'tmp/dest');
    t.is(shell.error(), null);
    t.truthy(!result.stderr);
    t.is(result.code, 0);
    t.is(common.existsSync('tmp/dest/z'), true);
  }
});

test('using -R on a link to a folder *does* follow the link', t => {
  shell.rm('-rf', 'tmp/*');
  shell.cp('-R', 'resources/cp/symFolder', 'tmp');
  t.truthy(!fs.lstatSync('tmp/symFolder').isSymbolicLink());
});

test('Without -R, -L is implied', t => {
  shell.rm('-rf', 'tmp/*');
  shell.cp('resources/cp/links/sym.lnk', 'tmp');
  t.truthy(!fs.lstatSync('tmp/sym.lnk').isSymbolicLink());
});

test('-L explicitly works', t => {
  shell.rm('-rf', 'tmp/*');
  shell.cp('-L', 'resources/cp/links/sym.lnk', 'tmp');
  t.truthy(!fs.lstatSync('tmp/sym.lnk').isSymbolicLink());
});

test('using -LR does not imply -P', t => {
  shell.rm('-rf', 'tmp/*');
  shell.cp('-LR', 'resources/cp/links/sym.lnk', 'tmp');
  t.truthy(!fs.lstatSync('tmp/sym.lnk').isSymbolicLink());
});

test('using -LR also works recursively on directories containing links', t => {
  shell.rm('-rf', 'tmp/*');
  shell.cp('-LR', 'resources/cp/links', 'tmp');
  t.truthy(!fs.lstatSync('tmp/links/sym.lnk').isSymbolicLink());
});

test('-L always overrides a -P', t => {
  shell.rm('-rf', 'tmp/*');
  shell.cp('-LP', 'resources/cp/links/sym.lnk', 'tmp');
  t.truthy(!fs.lstatSync('tmp/sym.lnk').isSymbolicLink());
  shell.rm('-rf', 'tmp/*');
  shell.cp('-LPR', 'resources/cp/links/sym.lnk', 'tmp');
  t.truthy(!fs.lstatSync('tmp/sym.lnk').isSymbolicLink());
});

test('Test max depth.', t => {
  shell.rm('-rf', 'tmp/');
  shell.mkdir('tmp/');
  shell.config.maxdepth = 32;
  var directory = '';
  var i;
  for (i = 1; i < 40; i++) {
    directory += '/' + i;
  }
  var directory32deep = '';
  for (i = 1; i < 32; i++) {
    directory32deep += '/' + i;
  }
  shell.mkdir('-p', 'tmp/0' + directory);
  shell.cp('-r', 'tmp/0', 'tmp/copytestdepth');
  // Check full directory exists.
  t.truthy(shell.test('-d', 'tmp/0/' + directory));
  // Check full copy of directory does not exist.
  t.truthy(!shell.test('-d', 'tmp/copytestdepth' + directory));
  // Check last directory to exist is bellow maxdepth.
  t.truthy(shell.test('-d', 'tmp/copytestdepth' + directory32deep));
  t.truthy(!shell.test('-d', 'tmp/copytestdepth' + directory32deep + '/32'));
});

test('Only complete sym link checks if script has permission to do so.', t => {
  skipOnWinForEPERM(shell.ln.bind(shell, '-s', 'tmp/0', 'tmp/symlinktest'), function () {
    if (!shell.test('-L', 'tmp/symlinktest')) {
      return;
    }
    shell.rm('-rf', 'tmp/symlinktest');
    // Create sym links to check for cycle.
    shell.cd('tmp/0/1/2/3/4');
    shell.ln('-s', '../../../2', 'link');
    shell.ln('-s', './5/6/7', 'link1');
    shell.cd('../../../../../..');
    t.truthy(shell.test('-d', 'tmp/'));

  // @@TEST(No Test Title #49)
    shell.rm('-fr', 'tmp/copytestdepth');
    shell.cp('-r', 'tmp/0', 'tmp/copytestdepth');
    t.truthy(shell.test('-d', 'tmp/copytestdepth/1/2/3/4/link/3/4/link/3/4'));

  // @@TEST(No Test Title #50)
    // Test copying of symlinked files cp -L.
    shell.rm('-fr', 'tmp');
    shell.mkdir('-p', 'tmp/sub');
    shell.mkdir('-p', 'tmp/new');
    shell.cp('-f', 'resources/file1.txt', 'tmp/sub/file.txt');
    shell.cd('tmp/sub');
    shell.ln('-s', 'file.txt', 'foo.lnk');
    shell.ln('-s', 'file.txt', 'sym.lnk');
    shell.cd('..');
    shell.cp('-L', 'sub/*', 'new/');

  // @@TEST(No Test Title #51)
    // Ensure copies are files.
    shell.cd('new');
    shell.cp('-f', '../../resources/file2.txt', 'file.txt');
    t.is(shell.cat('file.txt').toString(), 'test2\n');
    // Ensure other files have not changed.
    t.is(shell.cat('foo.lnk').toString(), 'test1\n');
    t.is(shell.cat('sym.lnk').toString(), 'test1\n');

  // @@TEST(No Test Title #52)
    // Ensure the links are converted to files.
    t.is(shell.test('-L', 'foo.lnk'), false);
    t.is(shell.test('-L', 'sym.lnk'), false);
    shell.cd('../..');

  // @@TEST(No Test Title #53)
    // Test with recursive option and symlinks.

  // @@TEST(No Test Title #54)
    shell.rm('-fr', 'tmp');
    shell.mkdir('-p', 'tmp/sub/sub1');
    shell.cp('-f', 'resources/file1.txt', 'tmp/sub/file.txt');
    shell.cp('-f', 'resources/file1.txt', 'tmp/sub/sub1/file.txt');
    shell.cd('tmp/sub');
    shell.ln('-s', 'file.txt', 'foo.lnk');
    shell.ln('-s', 'file.txt', 'sym.lnk');
    shell.cd('sub1');
    shell.ln('-s', '../file.txt', 'foo.lnk');
    shell.ln('-s', '../file.txt', 'sym.lnk');

  // @@TEST(No Test Title #55)
    // Ensure file reads from proper source.
    t.is(shell.cat('file.txt').toString(), 'test1\n');
    t.is(shell.cat('foo.lnk').toString(), 'test1\n');
    t.is(shell.cat('sym.lnk').toString(), 'test1\n');
    t.is(shell.test('-L', 'foo.lnk'), true);
    t.is(shell.test('-L', 'sym.lnk'), true);
    shell.cd('../..');
    shell.cp('-rL', 'sub/', 'new/');
    shell.cd('new');

  // @@TEST(No Test Title #56)
    // Ensure copies of files are symlinks by updating file contents.
    shell.cp('-f', '../../resources/file2.txt', 'file.txt');
    t.is(shell.cat('file.txt').toString(), 'test2\n');
    // Ensure other files have not changed.
    t.is(shell.cat('foo.lnk').toString(), 'test1\n');
    t.is(shell.cat('sym.lnk').toString(), 'test1\n');

  // @@TEST(No Test Title #57)
    // Ensure the links are converted to files.
    t.is(shell.test('-L', 'foo.lnk'), false);
    t.is(shell.test('-L', 'sym.lnk'), false);

  // @@TEST(No Test Title #58)
    shell.cd('sub1');
    shell.cp('-f', '../../../resources/file2.txt', 'file.txt');
    t.is(shell.cat('file.txt').toString(), 'test2\n');
    // Ensure other files have not changed.
    t.is(shell.cat('foo.lnk').toString(), 'test1\n');
    t.is(shell.cat('sym.lnk').toString(), 'test1\n');

  // @@TEST(No Test Title #59)
    // Ensure the links are converted to files.
    t.is(shell.test('-L', 'foo.lnk'), false);
    t.is(shell.test('-L', 'sym.lnk'), false);
  });
});

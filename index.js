/* jshint camelcase: false */

/*!
 * module deps
 */

var resolve = require('component-resolver'),
    flatten = require('component-flatten'),
    main = require('duo-main'),
    co = require('co'),
    exec = require('co-exec'),
    join = require('path').join,
    rename = require('fs').renameSync,
    exists = require('fs').existsSync,
    write = require('fs').writeFileSync,
    read = require('fs').readFileSync,
    mkdir = require('fs').mkdirSync,
    debug =  require('debug');


/*!
 * globals
 */


var log = debug('component2webpack:log'),
    warn = debug('component2webpack:warn');


// resolve deps tree
co(function* () {
  var tree = yield* resolve(process.cwd(), { install: true }),
      list = flatten(tree);

  // remove existing
  yield exec('rm -r -f web_modules');
  mkdir('web_modules');


  list.filter(function (x) {
    return x.type === 'dependency';
  })
  .map(function(x){
    var json = require(x.filename),
        prefix = '',
        cmp;

    cmp = {
      dir: x.path,
      repo: x.name.split('/')[1],
      name: json.name,
      js: main(json, 'js')
    };

    // copy to web_modules
    if (!exists(join('web_modules', cmp.name))) {
      log('[rename] %s --> %s', cmp.dir,  join('web_modules', cmp.name));
      rename(cmp.dir, join('web_modules', cmp.name));
    }

    // add index.js if missing
    if (cmp.js !== 'index.js') {
      write(
        join('web_modules', cmp.name, 'index.js'),
        'module.exports = require(\'./' + cmp.js + '\');'
      );

      log('[write index] %s --> %s',
        join('web_modules', cmp.name, 'index.js'),
        'module.exports = require(\'./' + cmp.js + '\');'
      );
    }

    if (json.styles && json.styles.length) {

      prefix = json.styles.map(function(file) {
        return 'require(\'./' + file + '\');\n';
      }).join('');

      write(
        join('web_modules', cmp.name, 'index.js'),
        prefix + read(join('web_modules', cmp.name, 'index.js'), 'utf8')
      );

      log('[write style] %s --> %s',
        join('web_modules', cmp.name, 'index.js'),
        prefix
      );
    }

    // add alias if repo name doesnt match manifest name
    if (json.name !== cmp.repo) {
      warn('repo & name dont match %s !== %s', json.name, cmp.repo);

      if (!exists(join('web_modules', cmp.repo))) {
        mkdir(join('web_modules', cmp.repo));
        write(
          join('web_modules', cmp.repo, 'index.js'),
          'module.exports = require(\'' + json.name + '\');'
        );
      }
    }
  });

  // delete component directory
  log('delete  components folder');
  yield exec('rm -r -f components');

})();
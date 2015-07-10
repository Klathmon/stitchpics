/*jslint node: true */
'use strict';

/*
  This gulpfile was built for a few internal projects i use and is probably massivly overcomplicated
  It's meant to be run on a fairly powerful machine, and it does all it can to speed up the compilation
  process (at the expense of CPU, RAM, disk usage, etc...).
*/

import fs from 'fs';
import del from 'del';
import path from 'path';
import gulp from 'gulp';
import merge from 'merge-stream';
import glp from 'gulp-load-plugins';
var $ = glp({
  pattern: ['*'],
  rename: {
    'lodash': '_',
    'babel': 'babelProper',
    'vulcanize': 'vulcanizeProper'
  }
});

var PROD = false;

const SASS_OPTIONS = {
  outputStyle: 'expanded',
  includePaths: $.nodeBourbon.includePaths
};

const AUTOPREFIXER_OPTIONS = {
  cascade: true,
  remove: true,
  browsers: [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ]
};

const BABEL_OPTIONS = {
  compact: false,
  blacklist: [
    'strict',
    'jscript',
  ],
  loose: 'all'
};

const UGLIFY_OPTIONS = {
  'screw-ie8': true,
  compress: {
    unsafe: true
  },
  // Enable these when support for them drops in gulp-uglify
  //'mangle-props': true,
  //'mangle-regex': '/^_/'
};

const MIN_CSS_OPTIONS = {
  keepSpecialComments: 0
};

const IMAGEMIN_OPTIONS = {
  optimizationLevel: 7,
  progressive: true,
  multipass: true
};

const VULCANIZE_OPTIONS = {
  dest: 'build',
  inlineCss: true,
  stripExcludes: false,
  excludes: ['//fonts.googleapis.com/*'],
  inlineScripts: true
};

const MINIFY_INLINE_OPTIONS = {
  css: false // Shit's broken yo
};

const MINIFY_HTML_OPTIONS = {
  quotes: true,
  empty: true,
  spare: true
};

// Compile Assets (html/css/js)
gulp.task('compileAssets', ['copy'], () => {
  return getFolders(path.join('app', 'elements')).concat('').map((folder) => {
    var elementsFilter = $.filter(path.join('app', 'elements'));
    var src = path.join.apply(this, (folder ? ['app', 'elements', folder, '*.html'] : ['app', 'index.html']));
    var dest = path.join.apply(this, (folder ? ['build', 'elements', folder] : ['build']));

    var useminOptions = {};

    ['inlinecss', 'css', 'inlinesass', 'sass'].forEach((name) => {
      useminOptions[name] = [
        $.sourcemaps.init(),
        $.cached(name + '|compile|' + folder),
        $.plumber(),
        $.if($._.contains(name, 'sass'), $.sass(SASS_OPTIONS).on('error', $.sass.logError)),
        $.autoprefixer(AUTOPREFIXER_OPTIONS),
        $.plumber.stop(),
        $.remember(name + '|compile|' + folder),
        $.csslint(),
        $.csslint.reporter($.csslintStylish),
        'concat',
        $.cached(name + '|minify|' + folder),
        $.if(PROD, $.minifyCss(MIN_CSS_OPTIONS)),
        $.remember(name + '|minify|' + folder),
        $.sourcemaps.write()
      ];
    });

    ['js', 'js1'].forEach((name) => {
      useminOptions[name] = [
        elementsFilter,
        $.jshint(),
        $.jshint.reporter($.jshintStylish),
        elementsFilter.restore(),
        $.sourcemaps.init(),
        $.cached(name + '|babel|' + folder),
        $.plumber(),
        $.babel(BABEL_OPTIONS),
        $.plumber.stop(),
        $.remember(name + '|babel|' + folder),
        'concat',
        $.cached(name + '|uglify|' + folder),
        $.if(PROD, $.uglify(UGLIFY_OPTIONS)),
        $.remember(name + '|uglify|' + folder),
        $.sourcemaps.write()
      ];
    });

    return gulp.src(src)
      .pipe($.usemin(useminOptions))
      .pipe(gulp.dest(dest));
  });
});

gulp.task('vulcanize', ['copy', 'copyBowerComponents', 'compileAssets'], () => {
  return gulp.src(path.join('build', 'index.html'))
    .pipe($.cached('vulcanize'))
    .pipe($.vulcanize(VULCANIZE_OPTIONS))
    .pipe($.remember('vulcanize'))
    .pipe($.cached('vulcanize|minify'))
    .pipe($.if(PROD, $.minifyInline(MINIFY_INLINE_OPTIONS)))
    .pipe($.if(PROD, $.minifyHtml(MINIFY_HTML_OPTIONS)))
    .pipe($.remember('vulcanize|minify'))
    .pipe($.if(PROD, $.size()))
    .pipe(gulp.dest('build'));
});

// Copy everything over
// Do this before any other compilation passes because it copies EVERYTHING
// This is to ensure that nothing that isn't compiled isn't missed
gulp.task('copy', () => {
  return gulp.src(path.join('app', '**', '*'), {
      base: 'app'
    })
    .pipe($.cached('copy'))
    .pipe($.if(PROD, $.imagemin(IMAGEMIN_OPTIONS)))
    .pipe(gulp.dest(path.join('build')));
});

gulp.task('copyBowerComponents', () => {
  return gulp.src(path.join('bower_components', '**', '*'))
    .pipe($.cached('copyBower'))
    .pipe($.if(PROD, $.imagemin(IMAGEMIN_OPTIONS)))
    .pipe(gulp.dest(path.join('build', 'bower_components')));
});

gulp.task('serve', ['build'], () => {
  $.browserSync({
    notify: false,
    https: true,
    server: {
      baseDir: 'build',
      routes: {
        '/bower_components': 'bower_components',
        '/app': 'app'
      }
    }
  });

  gulp.watch(path.join('app', '**', '*'), ['build', $.browserSync.reload]);
});

gulp.task('serve:dist', ['build:dist'], () => {
  $.browserSync({
    notify: false,
    https: true,
    server: {
      baseDir: 'build'
    }
  });

  gulp.watch(path.join('app', '**', '*'), ['build:dist', $.browserSync.reload]);
});

gulp.task('clean', del.bind(null, ['build']));
gulp.task('production', () => {
  PROD = true;
});
gulp.task('build', ['compileAssets', 'copy']);
gulp.task('build:dist', [
  'production',
  'compileAssets',
  'copy',
  'copyBowerComponents',
  'vulcanize'
]);




function getFolders(dir) {
  return fs.readdirSync(dir)
    .filter((file) => {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

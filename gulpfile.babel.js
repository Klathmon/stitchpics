/*jslint node: true */
'use strict';

import fs from 'fs';
import del from 'del';
import _ from 'lodash';
import path from 'path';
import gulp from 'gulp';
import merge from 'merge-stream';
import bourbon from 'node-bourbon';
import glp from 'gulp-load-plugins';
import browserSync from 'browser-sync';
var $ = glp();

var PROD = false;

const SASS_OPTIONS = {
  outputStyle: 'expanded',
  includePaths: bourbon.includePaths
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
  //loose: 'all'
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
  css: false
};

const MINIFY_HTML_OPTIONS = {
  quotes: true,
  empty: true,
  spare: true
};

// Compile Assets (html/css/js)
gulp.task('compileAssets', ['copy'], () => {
  return merge(getFolders(path.join('app', 'elements')).concat('').map((folder) => {
    var src = path.join.apply(folder ? ['app', 'index.html'] : ['app', 'elements', folder, '*.html']);
    var dest = path.join.apply(folder ? ['build'] : ['build', 'elements', folder]);

    var cssOptions = ['inlinecss', 'css', 'inlinesass', 'sass'].reduce((obj, name) => {
      obj[name] = [
        $.sourcemaps.init(),
        $.cached(name + '|compile|' + folder),
        $.if(name.indexOf('sass') > -1, $.sass(SASS_OPTIONS).on('error', $.sass.logError)),
        $.autoprefixer(AUTOPREFIXER_OPTIONS),
        $.remember(name + '|compile|' + folder),
        'concat',
        $.cached(name + '|minify|' + folder),
        $.if(PROD, $.minifyCss(MIN_CSS_OPTIONS)),
        $.remember(name + '|minify|' + folder),
        $.sourcemaps.write()
      ];
      return obj;
    }, {});

    var jsOptions = ['js', 'js1'].reduce((obj, name) => {
      obj[name] = [
        $.sourcemaps.init(),
        $.cached(name + '|babel|' + folder),
        $.babel(BABEL_OPTIONS),
        $.remember(name + '|babel|' + folder),
        'concat',
        $.cached(name + '|uglify|' + folder),
        $.if(PROD, $.uglify(UGLIFY_OPTIONS)),
        $.remember(name + '|uglify|' + folder),
        $.sourcemaps.write()
      ];
      return obj;
    }, {});

    console.log(_.keys(_.merge(cssOptions, jsOptions)));

    return gulp.src(src)
      .pipe($.plumber())
      .pipe($.usemin(_.merge(cssOptions, jsOptions)))
      .pipe($.plumber.stop())
      .pipe(gulp.dest(dest));
  }));
});

gulp.task('vulcanize', ['copy', 'copyBowerComponents', 'compileAssets'], () => {
  return gulp.src(path.join('build', 'index.html'))
    .pipe($.vulcanize(VULCANIZE_OPTIONS))
    .pipe($.cached('vulcanize'))
    .pipe($.if(PROD, $.minifyInline(MINIFY_INLINE_OPTIONS)))
    .pipe($.if(PROD, $.minifyHtml(MINIFY_HTML_OPTIONS)))
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
    .pipe(gulp.dest(path.join('build')));
});

// Compile all images
gulp.task('compileImages', ['copy'], () => {
  // For now just copy the images, add in a compression and optimization step later
  return gulp.src(path.join('app', '**', '*.{ico,jpeg,jpg,gif,png,webp,svg}'), {
      base: 'app'
    })
    .pipe($.cached('images'))
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
  browserSync({
    notify: true,
    https: true,
    server: {
      baseDir: 'build',
      routes: {
        '/bower_components': 'bower_components',
        '/app': 'app'
      }
    }
  });

  gulp.watch(path.join('app', '**', '*'), ['build', browserSync.reload]);
});

gulp.task('serve:dist', ['build:dist'], () => {
  browserSync({
    notify: true,
    https: true,
    server: {
      baseDir: 'build'
    }
  });

  gulp.watch(path.join('app', '**', '*'), ['build:dist', browserSync.reload]);
});

gulp.task('clean', del.bind(null, ['build']));
gulp.task('production', () => {
  PROD = true;
});
gulp.task('build', ['compileImages', 'compileAssets', 'copy']);
gulp.task('build:dist', [
  'production',
  'compileAssets',
  'copyBowerComponents',
  'compileImages',
  'copy',
  'vulcanize'
]);




function getFolders(dir) {
  return fs.readdirSync(dir)
    .filter((file) => {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

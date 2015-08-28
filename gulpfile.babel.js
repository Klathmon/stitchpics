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

$.webComponentTester.gulp.init(gulp);

var PROD = false;

const SASS_OPTIONS = {
  outputStyle: 'expanded',
  includePaths: [$.nodeBourbon.includePaths, path.join('app', 'styles')]
};

const AUTOPREFIXER_OPTIONS = {
  cascade: true,
  remove: true,
  browsers: [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 35',
    'chrome >= 40',
    'opera >= 26',
    'safari >= 7',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ]
};

const PLUMBER_OPTIONS = {
  errorHandler: (error)=>{
    cache.caches = {};  // jshint ignore:line
    $.notify.onError("Error: <%= error.message %>");
  }
};

const BABEL_OPTIONS = {
  compact: false,
  blacklist: [
    'strict',
    'jscript',
  ],
  optional: [
    'es7.functionBind'
  ]
  //loose: 'all'
};

const COFFEE_OPTIONS = {
  bare: true
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

const CSSLINT_OPTIONS = {
  ids: false,
  'box-sizing': false,
  'fallback-colors': false
};

const MIN_CSS_OPTIONS = {
  keepSpecialComments: 0
};

const IMAGEMIN_OPTIONS = {
  optimizationLevel: 7,
  progressive: true,
  multipass: true,
  use: [
    $.imageminMozjpeg({
      quality: 100,
    }),
    $.imageminPngcrush({
      reduce: true
    })
  ]
};

const VULCANIZE_OPTIONS = {
  dest: 'build',
  inlineCss: true,
  inlineScripts: true,
  stripExcludes: false,
  excludes: [
    '//fonts.googleapis.com/*',
    '//pagead2.googlesyndication.com/*'
  ]
};

const MINIFY_INLINE_OPTIONS = {
  css: false, // Shit's broken yo
  jsSelector: 'script[type!="text/markdown"]'
};

const MINIFY_HTML_OPTIONS = {
  quotes: true,
  cdata: true,
  empty: true,
  spare: true
};

var compileCss = function compileCss(name, folder){
  return [
    $.plumber(PLUMBER_OPTIONS),
    $.if(!PROD, $.sourcemaps.init()),
    $.cached(name + '|css|' + folder),
    $.if('*.sass', $.sass(SASS_OPTIONS).on('error', $.sass.logError)),
    $.autoprefixer(AUTOPREFIXER_OPTIONS),
    $.csslint(CSSLINT_OPTIONS),
    $.csslint.reporter($.csslintStylish),
    $.remember(name + '|css|' + folder),
    'concat',
    $.if(PROD, $.cached(name + '|minifycss|' + folder)),
    $.if(PROD, $.minifyCss(MIN_CSS_OPTIONS)),
    $.if(PROD, $.remember(name + '|minifycss|' + folder)),
    $.if(!PROD, $.sourcemaps.write()),
    $.plumber.stop()
  ];
};

var compileJs = function compileJs(name, folder){
  return [
    $.plumber(PLUMBER_OPTIONS),
    $.if(!PROD, $.sourcemaps.init()),
    $.if('*.coffee', $.cached(name + '|coffeescript|' + folder)),
    $.if('*.coffee', $.coffee(COFFEE_OPTIONS)),
    $.if('*.coffee', $.remember(name + '|coffeescript|' + folder)),
    $.if('*/elements/*', $.cached(name + '|jshint|' + folder)),
    $.if('*/elements/*', $.jshint()),
    $.if('*/elements/*', $.jshint.reporter($.jshintStylish)),
    $.if('*/elements/*', $.remember(name + '|jshint|' + folder)),
    $.cached(name + '|babel|' + folder),
    $.babel(BABEL_OPTIONS),
    $.remember(name + '|babel|' + folder),
    'concat',
    $.if(PROD, $.cached(name + '|uglify|' + folder)),
    $.if(PROD, $.uglify(UGLIFY_OPTIONS)),
    $.if(PROD, $.remember(name + '|uglify|' + folder)),
    $.stripComments({safe: false, line: true}),
    $.if(!PROD, $.sourcemaps.write()),
    $.plumber.stop()
  ];
};


gulp.task('compileAssets', ['copy'], () => {
  return merge(getFolders(path.join('app', 'elements')).concat('').map((folder) => {
    var src = path.join(...(folder ? ['app', 'elements', folder, '*.html'] : ['app', 'index.html']));
    var dest = path.join(...(folder ? ['build', 'elements', folder] : ['build']));

    var useminOptions = {};
    buildUseminLoops(['css', 'sass', 'scss'], 1).forEach((name) => useminOptions[name] = compileCss(name, folder));
    buildUseminLoops(['js', 'coffee'], 2).forEach((name) => useminOptions[name] = compileJs(name, folder));

    return gulp.src(src)
      .pipe($.plumber(PLUMBER_OPTIONS))
      .pipe($.cached('htmlAutoprefixer|' + folder))
      .pipe($.htmlAutoprefixer(AUTOPREFIXER_OPTIONS))
      .pipe($.remember('htmlAutoprefixer|' + folder))
      .pipe($.usemin(useminOptions))
      .pipe($.cached('writeHtml|' + folder))
      .pipe($.size())
      .pipe(gulp.dest(dest))
      .pipe($.plumber.stop());
  }));
});

gulp.task('minifyIndex', ['copy', 'copyBowerComponents', 'compileAssets', 'vulcanize'], () => {
  return gulp.src(path.join('build', 'index.html'))
    .pipe($.cached('minifyIndex'))
    .pipe($.if(PROD, $.minifyInline(MINIFY_INLINE_OPTIONS)))
    .pipe($.if(PROD, $.minifyHtml(MINIFY_HTML_OPTIONS)))
    .pipe($.size())
    .pipe(gulp.dest('build'));
});

gulp.task('vulcanize', ['copy', 'copyBowerComponents', 'compileAssets'], () => {
  return gulp.src(path.join('build', 'elements', 'elements.html'))
    .pipe($.cached('vulcanize'))
    .pipe($.if(PROD, $.vulcanize(VULCANIZE_OPTIONS)))
    .pipe($.if(PROD, $.minifyInline(MINIFY_INLINE_OPTIONS)))
    //.pipe($.if(PROD, $.minifyHtml(MINIFY_HTML_OPTIONS)))
    .pipe($.size())
    .pipe(gulp.dest(path.join('build', 'elements')));
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
    .pipe($.cached('copyBowerComponents'))
    .pipe($.if(PROD, $.imagemin(IMAGEMIN_OPTIONS)))
    .pipe(gulp.dest(path.join('build', 'bower_components')));
});

gulp.task('serve', ['build'], () => {
  $.browserSync({
    notify: false,
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
    server: {
      baseDir: 'build'
    }
  });

  gulp.watch(path.join('app', '**', '*'), ['build:dist', $.browserSync.reload]);
});


gulp.task('production', ()=> PROD = true);
gulp.task('clean', del.bind(null, ['build']));
gulp.task('uninstall', ['clean'], del.bind(null, ['node_modules', 'bower_components']));
gulp.task('build', ['compileAssets']);
gulp.task('build:dist', ['production','build','copyBowerComponents','vulcanize','minifyIndex']);
gulp.task('deploy', ['build:dist'], ()=> gulp.src(path.join('build', '**', '*')).pipe($.ghPages()));


// Below this are just helper functions...


// Recursively gets all folders in the directory given and returns them in an array
var getFolders = function getFolders(dir, rootDir = dir) {
  let folderArray = [];
  fs.readdirSync(dir).forEach((file) => {
    let dirName = path.join(dir, file);
    if(fs.statSync(dirName).isDirectory()){
      [].push.apply(folderArray, getFolders(dirName, rootDir).concat(dirName));
    }
  });
  return folderArray.map((filePath)=> filePath.replace(rootDir + '\\', ''));
};

// Builds the usemin arrays fn(['js', 'coffee'], 2) becomes ['js', 'coffee', 'inlinejs', 'inlinecoffee', 'js2', 'coffee2']
var buildUseminLoops = function buildUseminLoops(types, number){
  return $._.flattenDeep($._.map(new Array(number), (value, index)=>{
    return $._.map(types, (type)=> {
      return $._.map(['', 'inline'], (inline)=> {
        if(index > 0 && inline === 'inline'){
          return null;
        }else{
          return inline + type + (index > 0 ? index : '');
        }
      });
    });
  })).filter((item)=> item);
};

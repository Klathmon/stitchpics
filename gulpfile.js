/*jslint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var del = require('del');
var browserSync = require('browser-sync');
var gulp = require('gulp');
var _ = require('lodash');
var $ = require('gulp-load-plugins')();

var PROD = false;

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var BABEL_OPTIONS = {
  compact: false,
  blacklist: [
    'strict',
    'jscript',
  ]
};

var UGLIFY_OPTIONS = {
  'screw-ie8': true,
  compress: {
    unsafe: true
  },
  // Enable these when support for them drops in gulp-uglify
  //'mangle-props': true,
  //'mangle-regex': '/^_/'
};

var MIN_CSS_OPTIONS = {
  keepSpecialComments: 0
};

var IMAGEMIN_OPTIONS = {
  optimizationLevel: 7,
  progressive: true,
  multipass: true
};

// Compile Assets (html/css/js)
gulp.task('compileAssets', ['copy'], function() {

  var elements = getFolders('app/elements').concat('').map(function(folder) {
    var src, prodName, dest;
    if (folder === '') {
      src = path.join('app', 'index.html');
      dest = path.join('build');
    } else {
      src = path.join('app', 'elements', folder, '*.html');
      dest = path.join('build', 'elements', folder);
    }

    var useminOptions = {
      inlinecss: [
        $.cached('inlinecss|' + folder),
        $.autoprefixer(AUTOPREFIXER_BROWSERS),
        $.remember('inlinecss|' + folder),
        'concat',
        $.if(PROD, $.minifyCss(MIN_CSS_OPTIONS))
      ],
      css: [
        $.cached('css|' + folder),
        $.autoprefixer(AUTOPREFIXER_BROWSERS),
        $.remember('css|' + folder),
        'concat',
        $.if(PROD, $.minifyCss(MIN_CSS_OPTIONS))
      ]
    };

    // Because of a 'bug' in usemin that doesn't look like it's going to get fixed, i need to
    // add all of the js blocks like this...
    _.times(2, function(x) {
      var catX = '';
      if (x !== 0) {
        catX = x;
      }

      useminOptions['js' + catX] = [
        $.sourcemaps.init(),
        $.cached('js' + catX + '|' + folder),
        $.babel(BABEL_OPTIONS),
        $.remember('js' + catX + '|' + folder),
        'concat',
        $.if(PROD, $.uglify(UGLIFY_OPTIONS)),
        $.sourcemaps.write('.')
      ];
    });

    return gulp.src(src)
      .pipe($.usemin(useminOptions))
      .pipe(gulp.dest(dest));
  });

  return merge(elements);
});

gulp.task('vulcanize', ['copy', 'copyBowerComponents', 'compileAssets'], function() {
  return gulp.src(path.join('build', 'index.html'))
    .pipe($.vulcanize({
      dest: 'build',
      inlineCss: true,
      stripExcludes: false,
      excludes: ['//fonts.googleapis.com/*'],
      inlineScripts: true
    }))
    .pipe($.cached('vulcanize'))
    .pipe($.if(PROD, $.minifyInline({
      css: false
    })))
    .pipe($.if(PROD, $.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    .pipe($.if(PROD, $.size()))
    .pipe($.if(PROD, $.size({
      gzip: true
    })))
    .pipe(gulp.dest('build'));
});

// Copy everything over
// Do this before any other compilation passes because it copies EVERYTHING
// This is to ensure that nothing that isn't compiled isn't missed
gulp.task('copy', function() {
  return gulp.src(path.join('app', '**', '*'), {
      base: 'app'
    })
    .pipe($.cached('copy'))
    .pipe(gulp.dest(path.join('build')));
});

// Compile all images
gulp.task('compileImages', ['copy'], function() {
  // For now just copy the images, add in a compression and optimization step later
  return gulp.src(path.join('app', '**', '*.{ico,jpeg,jpg,gif,png,webp,svg}'), {
      base: 'app'
    })
    .pipe($.cached('images'))
    .pipe($.if(PROD, $.imagemin(IMAGEMIN_OPTIONS)))
    .pipe(gulp.dest(path.join('build')));
});

gulp.task('copyBowerComponents', function() {
  return gulp.src(['bower_components/**/*'])
    .pipe($.cached('copyBower'))
    .pipe($.if(PROD, $.imagemin(IMAGEMIN_OPTIONS)))
    .pipe(gulp.dest('build/bower_components'));
});

gulp.task('removeBowerComponents', ['vulcanize'], del.bind(null, [path.join('build', 'bower_components')]));


gulp.task('serve', ['build'], function() {
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

gulp.task('serve:dist', ['build:dist'], function() {
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
gulp.task('production', function() {
  PROD = true;
  // Only Babel loose mode in production
  // This is to prevent me from actually "using" any of the not-correct "optimizations" in my real
  // code. If any of them cause issues in the output, it (or all of loose mode) can be removed.
  BABEL_OPTIONS.loose = 'all';
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
    .filter(function(file) {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

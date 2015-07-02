/*jslint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var prod = false;

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

function getFolders(dir) {
  return fs.readdirSync(dir)
    .filter(function(file) {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

// Compile Assets (html/css/js)
gulp.task('compileAssets', ['copy'], function(){
  var elements = getFolders('app/elements').concat('').map(function(folder){
    var src, prodName, dest;
    if(folder === ''){
      src = path.join('app', 'index.html');
      dest = path.join('build');
    }else{
      src = path.join('app', 'elements', folder, '*.html');
      dest = path.join('build', 'elements', folder);
    }

    return gulp.src(src)
      .pipe($.usemin({
          inlinecss: [
            'concat',
            $.autoprefixer(AUTOPREFIXER_BROWSERS),
            $.if(prod, $.minifyCss())
          ],
          css: [
            'concat',
            $.autoprefixer(AUTOPREFIXER_BROWSERS),
            $.if(prod, $.minifyCss())
          ],
          js: [
            $.sourcemaps.init(),
            'concat',
            $.babel({compact: false, blacklist: 'strict'}),
            $.if(prod, $.uglify()),
            $.sourcemaps.write('.')
          ],
          // Because of a bug in gulp-usemin, i need to do this once for each block in each element...
          js1: [
            $.sourcemaps.init(),
            'concat',
            $.babel({compact: false, blacklist: 'strict'}),
            $.if(prod, $.uglify()),
            $.sourcemaps.write('.')
          ]
        }))
      .pipe(gulp.dest(dest));
  });

  return merge(elements);
});

gulp.task('vulcanize', ['copy', 'copyBowerComponents', 'compileAssets'], function(){
  return gulp.src(path.join('build', 'index.html'))
    .pipe($.vulcanize({
      dest: 'build',
      inlineCss: true,
      stripExcludes: false,
      excludes: ['//fonts.googleapis.com/*'],
      inlineScripts: true
    }))
    .pipe($.if(prod, $.minifyInline({css: false})))
    .pipe($.if(prod, $.minifyHtml({quotes: true, empty: true, spare: true})))
    .pipe($.if(prod, $.size()))
    .pipe($.if(prod, $.size({gzip: true})))
    .pipe(gulp.dest('build'));
});

// Copy everything over
// Do this before any other compilation passes because it copies EVERYTHING
// This is to ensure that nothing that isn't compiled isn't missed
gulp.task('copy', function(){
  return gulp.src(path.join('app', '**', '*'), {base: 'app'})
      .pipe(gulp.dest(path.join('build')));
});

// Compile all images
gulp.task('compileImages', ['copy'], function(){
  // For now just copy the images, add in a compression and optimization step later
  return gulp.src(path.join('app', '**', '*.{ico,jpeg,jpg,gif,png,webp,svg}'), {base: 'app'})
    .pipe($.if(prod, $.imagemin({
        optimizationLevel: 7,
        progressive: true,
        multipass: true
      })))
    .pipe(gulp.dest(path.join('build')));
});

gulp.task('copyBowerComponents', function(){
  return gulp.src(['bower_components/**/*'])
    .pipe($.if(prod, $.imagemin({

    })))
    .pipe(gulp.dest('build/bower_components'));
});

gulp.task('removeBowerComponents', ['vulcanize'], del.bind(null, [path.join('build', 'bower_components')]));


gulp.task('serve', ['build'], function(){
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

gulp.task('serve:dist', ['build:dist'], function(){
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
gulp.task('production', function(){prod = true;});
gulp.task('build', ['compileImages', 'compileAssets', 'copy']);
gulp.task('build:dist', [
  'production',
  'compileAssets',
  'copyBowerComponents',
  'compileImages',
  'copy',
  'vulcanize',
  'removeBowerComponents'
]);

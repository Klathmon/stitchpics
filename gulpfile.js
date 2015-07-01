'use strict'

var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var gulp = require('gulp');
var glob = require('glob');
var debug = require('gulp-debug');
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

// Compile all CSS
gulp.task('compileCss', function() {
  return merge(getFolders('app/elements').concat('').map(function(folder){
    var src, prodName, dest;
    if(folder === ''){
      src = path.join('app', 'styles', '*.css');
      prodName = 'app';
      dest = path.join('build', 'styles');
    }else{
      src = path.join('app', 'elements', folder, '*.css');
      prodName = folder;
      dest = path.join('build', 'elements', folder);
    }

    return gulp.src(src)
      .pipe($.if(prod, $.concat(prodName + '.css')))
      .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
      .pipe($.if(prod, $.cssmin()))
      .pipe(gulp.dest(dest))
      .pipe(browserSync.stream());
  }));
});

// Compile all javascript
gulp.task('compileJs', function() {
  return merge(getFolders('app/elements').concat('').map(function(folder){
    var src, prodName, dest;
    if(folder === ''){
      src = path.join('app', 'scripts', '*.js');
      prodName = 'app';
      dest = path.join('build', 'scripts');
    }else{
      src = path.join('app', 'elements', folder, '*.js');
      prodName = folder;
      dest = path.join('build', 'elements', folder);
    }

    return gulp.src(src)
      //.pipe($.if(prod, $.concat(prodName + '.js'))) //Don't concat for now
        // It breaks the web worker stuff and i don't feel like dealing with it
        // right now, so i'm disabling it.
      .pipe($.babel({compact: false}))
      .pipe($.if(prod, $.uglify({preserveComments: 'some'})))
      .pipe(gulp.dest(dest));
  }));
});


//Copy everything else...
gulp.task('copy', function(){
  return merge(
    gulp.src(path.join('app', '{elements,scripts,styles}', '**', '*!(.js|.css)'), {base: 'app'})
      .pipe(gulp.dest(path.join('build'))),
    gulp.src(path.join('app', '*.*'))
      .pipe(gulp.dest(path.join('build')))
    );
});

// Compile all images
gulp.task('compileImages', function(){
  // For now just copy the images, add in a compression and optimization step later
  return gulp.src(path.join('app', 'images', '**', '*'))
    .pipe(gulp.dest(path.join('app', 'images')));
});

gulp.task('copyBowerComponents', function(){
  return gulp.src(['bower_components/**/*'])
    .pipe(gulp.dest('build/bower_components'));
});

gulp.task('serve', ['build'], function(){
  browserSync({
    notify: true,
    https: true,
    server: {
      baseDir: 'build',
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch(path.join('app', '**', '*.html'), browserSync.reload);
  gulp.watch(path.join('app', '**', '*.css'), ['compileCss']);
  gulp.watch(path.join('app', '**', '*.js'), ['compileJs', browserSync.reload]);
  gulp.watch(path.join('app', 'images', '**', '*'), ['compileImages', browserSync.reload]);
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
gulp.task('build', ['copy', 'compileCss', 'compileJs', 'compileImages']);
gulp.task('build:dist', ['production', 'copyBowerComponents', 'build', 'copy']);

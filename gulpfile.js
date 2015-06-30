'use strict'

var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var gulp = require('gulp');
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
      .pipe($.if(prod, $.concat(prodName + '.js')))
      .pipe($.babel({compact: false}))
      .pipe($.if(prod, $.uglify({preserveComments: 'some'})))
      .pipe(gulp.dest(dest));
  }));
});

// Compile all HTML
gulp.task('compileHtml', function() {
  return merge(
    gulp.src('app/elements/*.html')
      .pipe(gulp.dest('build/elements')),

    gulp.src('app/styles/*.html')
      .pipe(gulp.dest('build/styles')),

    getFolders('app/elements').concat('app').map(function(folder){
    var src, dest;
    if(folder === 'app'){
      src = path.join('app', 'index.html');
      dest = 'build';
    }else{
      src = path.join('app', 'elements', folder, folder + '.html');
      dest = path.join('build', 'elements', folder);
    }

    return gulp.src(src)
      .pipe($.if(prod, $.htmlReplace({js: folder + '.js', css: folder + '.css'})))
      .pipe(gulp.dest(dest));
  }));
});

// Compile all images
gulp.task('compileImages', function(){
  // For now just copy the images, add in a compression and optimization step later
  return gulp.src(path.join('app', 'images', '**', '*'))
    .pipe(gulp.dest(path.join('app', 'images')));
});

gulp.task('vulcanize', ['copyBowerComponents', 'compileHtml'], function(){
  return gulp.src(path.join('build', 'index.html'))
    .pipe($.vulcanize({
      dest: 'build',
      inlineCss: false, /* This is broken on windows, so don't use it until
                           the vulcanize team fixes it...
                           https://github.com/Polymer/vulcanize/issues/203 */
      inlineScripts: true
    }))
    .pipe($.if(prod, $.minifyHtml({quotes: true, empty: true, spare: true})))
    .pipe($.if(prod, $.size({showFiles: true})))
    .pipe(gulp.dest('build'));
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

  gulp.watch(path.join('app', '**', '*.html'), ['compileHtml', browserSync.reload]);
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

gulp.task('clean', del.bind(null, ['build', 'dist']));
gulp.task('production', function(){prod = true;});
gulp.task('build', ['compileHtml', 'compileCss', 'compileJs', 'compileImages']);
gulp.task('build:dist', ['production', 'vulcanize', 'build']);

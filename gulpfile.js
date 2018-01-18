'use strict';
const fs = require('fs');
const os = require('os');
const gulp = require('gulp');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const csso = require('gulp-csso');
const imagemin = require('gulp-imagemin');
const open = require('gulp-open');
const pump = require('pump');
const browserify = require('browserify');
const babelify = require('babelify');
const watchify = require('watchify');
const runSequence = require('run-sequence');
const del = require('del');
const ractiveify = require('ractiveify');
const sass = require('node-sass');
const plumber = require('gulp-plumber');
const haml = require('gulp-ruby-haml');
const prettify = require('gulp-prettify');
const ext_replace = require('gulp-ext-replace');
ractiveify.extensions.push('ractive');
ractiveify.extensions = ['ract', 'haml']
ractiveify.compilers['text/sass'] = function(filename, scriptSource) {
    return sass.renderSync({ data: scriptSource }).css.toString();
}

const _src = './src/';
const _dst_html = './dst_html/';
const _dst = './dst/';

gulp.task('build-js', function () {
  console.log(`Server listening?`);
  if (!fs.existsSync(_dst)) {
    fs.mkdir(_dst, function () { });
  }
  var bundler = watchify(browserify(_dst_html + 'pages/calendar.js', { debug: true }));
  bundler
    .transform(babelify.configure({ presets: ['es2015'] }))
    .transform(ractiveify);
  var bund = function () {
    return bundler
      .bundle()
      .on('error', function (err) { console.log('Error : ' + err.message); })
      .pipe(fs.createWriteStream(_dst + 'main.js'));
  };
  return bund();
});

gulp.task('clean', function (cb) {
  return del([_dst_html, _dst], cb);
});

gulp.task('build-haml', () => {
    return gulp.src([_src + '**/*.haml'], { base: _src })
        .pipe(plumber())
        .pipe(haml({
            escapeHtml: false,
            noEscapeAttrs: true,
        }))
        .pipe(ext_replace('.haml'))
        .pipe(gulp.dest(_dst_html));
});

gulp.task('copy-not-haml', () => {
    return gulp.src([_src + '**/*[^.haml]'], { base: _src })
        .pipe(gulp.dest(_dst_html))
});

gulp.task('haml-to-html', function (cb) {
  runSequence('build-haml', 'copy-not-haml', cb);
});

gulp.task('compile', function (cb) {
  runSequence('haml-to-html', 'build-js', cb);
});

gulp.task('default', function (cb) {
  runSequence('clean', 'compile', function () {
    const server = require('./server');
    gulp.watch(['./src/components/*', './src/pages/*', 'index.html'], ['compile']);
    cb();
  });
});

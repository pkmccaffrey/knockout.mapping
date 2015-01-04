'use strict';
/*jshint node:true*/

var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var qunit = require('gulp-qunit');
var plumber = require('gulp-plumber');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var header = require('gulp-header');
var sourceMaps = require('gulp-sourcemaps');
var n = {
    path: require('path')
};

var buildConfig = {
    outputPath: 'dist',
    pkg: require('./package.json'),
    banner: [
        '/*!',
        ' * Knockout Mapping plugin v<%= pkg.version %>',
        ' * (c) 2013 Steven Sanderson, Roy Jacobs - http://knockoutjs.com/',
        ' * License: MIT (http://www.opensource.org/licenses/mit-license.php)',
        ' */\n'
    ].join('\n')
};


gulp.task('clear', function() {
    gutil.log('cleaning output directory', gutil.colors.magenta(n.path.resolve(buildConfig.outputPath)));
    del.sync('*', {cwd: 'dist'});
});

gulp.task('build', function() {
    return gulp.src('knockout.mapping.js')
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(header(buildConfig.banner, {pkg: buildConfig.pkg}))
        .pipe(gulp.dest(buildConfig.outputPath))
        .pipe(rename('knockout.mapping.min.js'))
        .pipe(replace(/(:?var\s*?DEBUG\s*?=\s*?true)/, 'const DEBUG=false'))
        .pipe(sourceMaps.init())
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(sourceMaps.write('./'))
        .pipe(gulp.dest(buildConfig.outputPath));
});

gulp.task('test', ['test-jshint'], function() {
    return gulp.src('spec/spec-runner.htm')
        .pipe(plumber())
        .pipe(qunit());
});

gulp.task('test-ci', function() {
    return gulp.src('spec/spec-runner-*.htm', {read:false})
        .pipe(qunit());
});

gulp.task('test-jshint', function() {
    return gulp.src('spec/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('default', ['clear', 'build', 'test']);

gulp.task('watch', function() {
    gulp.watch('knockout.mapping.js', ['clear', 'build']);
    gulp.watch(['spec/spec-runner.htm', 'spec/*.js'], ['test']);
});

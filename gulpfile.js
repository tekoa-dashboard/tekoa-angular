'use strict';

var gulp = require('gulp'),
$ = require('gulp-load-plugins')(),
openURL = require('openurl'),
runSequence = require('run-sequence'),
puglint = require('gulp-pug-lint'),
cssComb = require('gulp-csscomb'),
cssBeautify = require('gulp-cssbeautify'),
cssCombLint = require('gulp-csscomb-lint'),
jsValidate = require('gulp-jsvalidate'),
gls = require('gulp-live-server');

var appName = "tekoa"

var appPaths = {
    debug: 'dev/',
    production: 'dist/'
};

var filesPaths = {
    js: {
        src: appPaths.debug + 'js/**/*.js',
        dest: appPaths.production + 'js',
        debug: appPaths.debug + 'js/**',
        production: appPaths.production + 'js/' + appName + '.min.js',
    },
    less: {
        src: appPaths.debug + 'less/' + appName + '.less',
        dest: appPaths.production + 'css',
        debug: appPaths.debug + 'less/*.less',
        production: appPaths.production + 'css/' + appName + '.min.css',
    },
    templates: {
        src: appPaths.debug + 'pug/index.pug',
        dest: appPaths.production + 'templates',
        debug: appPaths.debug + 'pug/**',
        production: appPaths.production + 'index.html'
    },
    modules: {
        spectre: {
            src: 'node_modules/spectre.css/spectre.less',
            dest: appPaths.production + 'css',
            debug: 'node_modules/spectre.css/src',
            production: appPaths.production + 'css/spectre.min.css'
        }
    },
    libs: {
        src: appPaths.debug + 'libs/**',
        dest: appPaths.production + 'libs',
        debug: appPaths.debug + 'libs/**',
        production: appPaths.production + 'libs/**'
    },
    extras: {
        css: {
            src: appPaths.debug + 'css/**/**',
            dest: appPaths.production + 'css'
        },
        design: {
            src: appPaths.debug + 'design/**',
            dest: appPaths.production + 'design',
            debug: appPaths.debug + 'design/**',
            production: appPaths.production + 'design/**'
        }
    }
};

var pugPattern = [appPaths.debug + 'pug/**/*.pug', '!' + appPaths.debug + 'pug/index.pug', '!' + appPaths.debug + 'pug/includes/**'];
var server = gls.static(appPaths.production, 8081);






///////////
// SERVE //
///////////
gulp.task('serve', function (cb) {
    runSequence(['start:server'], cb);
});

gulp.task('start:server', function(done) {
    server.start();
    openURL.open('http://localhost:8081');

    gulp.watch([filesPaths.templates.debug], function (file) {
        runSequence('make:pug');

        gulp.watch([filesPaths.templates.production], function (file) {
            server.notify.apply(server, [file]);
        });
    });

    gulp.watch([filesPaths.less.debug], function (file) {
        runSequence('make:less', 'build:spectre');

        gulp.watch([filesPaths.less.production], function (file) {
            server.notify.apply(server, [file]);
        });
    });

    gulp.watch([filesPaths.modules.spectre.debug], function (file) {
        runSequence('build:spectre');

        gulp.watch([filesPaths.modules.spectre.production], function (file) {
            server.notify.apply(server, [file]);
        });
    });

    gulp.watch([filesPaths.js.debug], function (file) {
        runSequence('make:js');

        gulp.watch([filesPaths.js.production], function (file) {
            server.notify.apply(server, [file]);
        });
    });

    gulp.watch([filesPaths.design.debug], function (file) {
        runSequence('copy:design');

        gulp.watch([filesPaths.design.production], function (file) {
            server.notify.apply(server, [file]);
        });
    });

    if (filesPaths.libs.debug) {
        gulp.watch([filesPaths.libs.debug], function (file) {
            runSequence('copy:libs');

            gulp.watch([filesPaths.libs.production], function (file) {
                server.notify.apply(server, [file]);
            });
        });
    }
});

gulp.task('server:reload', function (file) {
    server.notify.apply(server, [file]);
});





///////////
// TASKS //
///////////
gulp.task('make:pug', function() {
    gulp.src(filesPaths.templates.src)
    .pipe(puglint())
    .pipe($.pug())
    .pipe(gulp.dest(appPaths.production));
    gulp.src(pugPattern)
    .pipe(puglint())
    .pipe($.pug())
    .pipe(gulp.dest(filesPaths.templates.dest));
});

gulp.task('make:less', function() {
    return gulp.src(filesPaths.less.src)
    .pipe($.less())
    .pipe($.concatCss(appName + '.css'))
    .pipe(cssComb())
    .pipe(cssBeautify({
        indent: '  ',
        openbrace: 'end-of-line',
        autosemicolon: true
    }))
    .pipe($.autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe($.cleanCss({
        compatibility: 'ie8',
        keepSpecialComments: 0
    }))
    .pipe($.rename(function (path) {
        path.basename += '.min';
    }))
    .pipe(cssCombLint())
    .pipe(gulp.dest(filesPaths.less.dest));
});

gulp.task('make:js', function () {
    return gulp.src(filesPaths.js.src)
    .pipe($.concat(appName + '.js'))
    .pipe(jsValidate())
    .pipe($.minify({
        ext:{
            min:'.min.js'
        },
        noSource: true,
        preserveComments: ['some'],
        mangle: false
    }))
    .pipe(gulp.dest(filesPaths.js.dest));
});

gulp.task('build:spectre', function () {
    gulp.src(filesPaths.modules.spectre.src)
    .pipe($.less())
    .pipe(cssComb())
    .pipe(cssBeautify({
        indent: '  ',
        openbrace: 'end-of-line',
        autosemicolon: true
    }))
    .pipe($.autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe($.cleanCss({
        compatibility: 'ie8',
        keepSpecialComments: 0
    }))
    .pipe($.rename(function (path) {
        path.basename += '.min';
    }))
    .pipe(cssCombLint())
    .pipe(gulp.dest(filesPaths.modules.spectre.dest));
});

gulp.task('copy:design', function () {
  return gulp.src(filesPaths.extras.design.src)
  .pipe(gulp.dest(filesPaths.extras.design.dest));
});

gulp.task('copy:css', function () {
    return gulp.src(filesPaths.extras.css.src)
    .pipe(gulp.dest(filesPaths.extras.css.dest));
});

gulp.task('copy:libs', function () {
  return gulp.src(filesPaths.libs.src)
  .pipe(gulp.dest(filesPaths.libs.dest));
});




///////////
// BUILD //
///////////
gulp.task('default', ['build']);

gulp.task('build', function () {
    runSequence('make:js', 'make:pug', 'make:less', 'build:modules', 'copy:design', 'copy:libs', 'copy:extras');
});

gulp.task('build:modules', function () {
    runSequence('build:spectre');
});

gulp.task('copy:extras', function () {
    runSequence('copy:css');
});

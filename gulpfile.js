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

var app = {
    name: "tekoa"
};

var paths = {
    debug: 'dev/',
    production: 'dist/'
};

var server = {
    folder: paths.production,
    port: 8000,
    address: 'http://localhost:8000'
};

var files = {
    js: {
        src: paths.debug + 'js/**/*.js',
        dest: paths.production + 'js',
        debug: paths.debug + 'js/**',
        production: paths.production + 'js/' + app.name + '.min.js',
    },
    less: {
        src: paths.debug + 'less/' + app.name + '.less',
        dest: paths.production + 'css',
        debug: paths.debug + 'less/*.less',
        production: paths.production + 'css/' + app.name + '.min.css',
    },
    templates: {
        src: paths.debug + 'pug/index.pug',
        dest: paths.production + 'templates',
        debug: paths.debug + 'pug/**',
        production: paths.production + 'index.html'
    },
    modules: {
        spectre: {
            src: 'node_modules/spectre.css/spectre.less',
            dest: paths.production + 'css',
            debug: 'node_modules/spectre.css/src/**',
            production: paths.production + 'css/spectre.min.css'
        }
    },
    libs: {
        src: paths.debug + 'libs/**',
        dest: paths.production + 'libs',
        debug: paths.debug + 'libs/**',
        production: paths.production + 'libs/**'
    },
    extras: {
        css: {
            src: paths.debug + 'css/**/**',
            dest: paths.production + 'css'
        },
        design: {
            src: paths.debug + 'design/**',
            dest: paths.production + 'design',
            debug: paths.debug + 'design/**',
            production: paths.production + 'design/**'
        }
    }
};

var pugPattern = [paths.debug + 'pug/**/*.pug', '!' + paths.debug + 'pug/index.pug', '!' + paths.debug + 'pug/includes/**'];
var liveServer = gls.static(server.folder, server.port);





///////////
// SERVE //
///////////
gulp.task('serve', function (cb) {
    runSequence(['start:server'], cb);
});

gulp.task('start:server', function(done) {
    liveServer.start();
    runSequence(['watch']);
    openURL.open(server.address);
});





///////////
// WATCH //
///////////
gulp.task('watch', function () {
    gulp.watch([files.templates.debug], function (file) {
        runSequence('make:pug');

        gulp.watch([files.templates.production], function (file) {
            liveServer.notify.apply(liveServer, [file]);
        });
    });

    gulp.watch([files.less.debug], function (file) {
        runSequence('make:less', 'build:spectre');

        gulp.watch([files.less.production], function (file) {
            liveServer.notify.apply(liveServer, [file]);
        });
    });

    gulp.watch([files.modules.spectre.debug], function (file) {
        runSequence('build:spectre');

        gulp.watch([files.modules.spectre.production], function (file) {
            liveServer.notify.apply(liveServer, [file]);
        });
    });

    gulp.watch([files.js.debug], function (file) {
        runSequence('make:js');

        gulp.watch([files.js.production], function (file) {
            liveServer.notify.apply(liveServer, [file]);
        });
    });

    if (files.libs.debug) {
        gulp.watch([files.libs.debug], function (file) {
            runSequence('copy:libs');

            gulp.watch([files.libs.production], function (file) {
                liveServer.notify.apply(liveServer, [file]);
            });
        });
    }

    if (files.extras) {
        gulp.watch([files.extras.design.debug], function (file) {
            runSequence('copy:design');

            gulp.watch([files.extras.design.production], function (file) {
                liveServer.notify.apply(liveServer, [file]);
            });
        });

        gulp.watch([files.extras.css.src], function (file) {
            runSequence('copy:css');

            gulp.watch([files.extras.css.dest], function (file) {
                liveServer.notify.apply(liveServer, [file]);
            });
        });
    }
});





///////////
// TASKS //
///////////
gulp.task('make:pug', function() {
    gulp.src(files.templates.src)
    .pipe(puglint())
    .pipe($.pug())
    .pipe(gulp.dest(paths.production));
    gulp.src(pugPattern)
    .pipe(puglint())
    .pipe($.pug())
    .pipe(gulp.dest(files.templates.dest));
});

gulp.task('make:less', function() {
    return gulp.src(files.less.src)
    .pipe($.less())
    .pipe($.concatCss(app.name + '.css'))
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
    .pipe(gulp.dest(files.less.dest));
});

gulp.task('make:js', function () {
    return gulp.src(files.js.src)
    .pipe($.concat(app.name + '.js'))
    .pipe(jsValidate())
    .pipe($.minify({
        ext:{
            min:'.min.js'
        },
        noSource: true,
        preserveComments: ['some'],
        mangle: false
    }))
    .pipe(gulp.dest(files.js.dest));
});

gulp.task('build:spectre', function () {
    gulp.src(files.modules.spectre.src)
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
    .pipe(gulp.dest(files.modules.spectre.dest));
});

gulp.task('copy:design', function () {
    return gulp.src(files.extras.design.src)
    .pipe(gulp.dest(files.extras.design.dest));
});

gulp.task('copy:css', function () {
    return gulp.src(files.extras.css.src)
    .pipe(gulp.dest(files.extras.css.dest));
});

gulp.task('copy:libs', function () {
    return gulp.src(files.libs.src)
    .pipe(jsValidate())
    .pipe($.minify({
        ext:{
            min:'.min.js'
        },
        noSource: true,
        preserveComments: ['some'],
        mangle: false
    }))
    .pipe(gulp.dest(files.libs.dest));
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

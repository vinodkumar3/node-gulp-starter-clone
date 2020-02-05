'use strict';

// A Simple Node.js gulpfile

// Motivation
//
// A few template languages in the Node.js ecosystem are not supersets of HTML.
// Depending on the template engine used, it can be tricky to automatically wire
// the compiled scripts and styles to our view templates. Because of this, this
// gulpfile leaves that responsiblity to the app developer. Much can still be
// automated though. This gulpfile aims to:

// - Automate CoffeeScript and SASS compilation
// - Automate JavaScript linting, minification, concatenation and source-mapping
// - Automate CSS vendor-prefixing, minification, concatenation and
//   source-mapping
// - Automate image optimization
// - Ease local development by working with structured source static assets,
//   but test against compiled, source-mapped static assets
// - Restart the local server automatically whenever Node.js scripts are
//   modified
// - Live reload the app whenever static assets are recompiled

// The Default Task
//
// Use `gulp` to clean the destination directory and compile source static
// assets there. Use `gulp --production` for a production-ready assets build.

// Style Compilation & Optimization
//
// Use `gulp styles` to compile source styles into one concatenated stylesheet
// in the destination directory. Both CSS and SASS sources are supported. CSS
// vendor prefixes are added automatically, using data from
// <http://caniuse.com>. The `AUTOPREFIXER_BROWSERS` constant determines what
// browser versions should be supported.
//
// Use `gulp styles --production` to also minify the styles and exclude
// source-maps.
//
// Script Compilation & Optimization
//
// Use `gulp scripts` to compile source scripts into one concatenated script in
// the destination directory. Both JavaScript and CoffeeScript sources are
// supported. JavaScript goes through a linter and CoffeeScript is compiled to
// JavaScript.
//
// Use `gulp scripts --production` to also minify the scripts and exclude
// source-maps.
//
// Asset Concatenation Order
//
// Script or style concatenation is done in alphabetical order of the filenames
// by default. If the order in which styles or scripts are concatenated is
// important, a simple solution is to list the files explicitly in the source
// globs.
//
// A more advanced solution is to bundle scripts using a module loader like
// RequireJS or Browserify and use SASS to import partials in the order needed.
//
// Image Optimization and Fonts
//
// Use `gulp images` to optimize images and output them in the destination
// directory. Use `gulp fonts` to copy fonts over to the destination directory.

// Automatic Static Assets Compilation
//
// Use `gulp watch &` in bash or `Start-Process gulp watch` in Powershell to
// start a background file watcher that will recompile source static assets
// automatically whenever they change.

// Local Testing
//
// Use `gulp serve` to test the Node.js app using the compiled static assets.
// By default the app's environment is set to `'development'`. To test the app
// in production mode, use `gulp serve --production`.

// Live Reload
//
// While serving the app locally, changes to Node.js scripts restart the server
// automatically but require a manual browser refresh. Static asset
// compilations are detected and will inject the changes in the browser. No
// browser extension is required for live reloading to work.

// What this gulpfile **does not provide** out of the box
//
// - Bower component compilation
// - Parsing of HTML files and view templates to replace references to
//   non-compiled source scripts, stylesheets or Bower components.
// - Script bundling using a module loader
// - HTML & view template minification
// - Asset Versioning
// - Unit testing and continous integration tasks

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var nodemon = require('nodemon');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
var argv = require('yargs').argv;

var PATHS = {
  staticRoot: 'dist', // The public static asset directory
  styles: {
    src: 'assets/styles/**/*.@(css|scss)',
    dest: 'dist/styles',
    concat: 'main.css'
  },
  scripts: {
    src: 'assets/scripts/**/*.@(js|coffee)',
    dest: 'dist/scripts',
    concat: 'main.js'
  },
  images: {
    src: 'assets/images/**/*',
    dest: 'dist/images'
  },
  fonts: {
    src: 'assets/fonts/**/*',
    dest: 'dist/fonts'
  },
  // Locations for files that should restart the server when modified
  appFiles: ['app.js', 'api/**/*.js', 'routes/**/*.js', 'models/**/*.js'],
  server: 'server.js', // The Node.js server
};

var SERVER_URL = 'http://localhost:3000'; // Where the local server is hosted
var PROXY_PORT = 5000; // The port for the BrowserSync middleware proxy
var PRODUCTION = argv.production // Whether to run/build the app for production
  ? true
  : false;

// Browsers to support, which determines what CSS vendor prefixes are added by
// the style compilation task
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

// Clean the public static asset directory
gulp.task('clean', del.bind(null, PATHS.staticRoot));

// Compile development and production static assets, the default task
gulp.task('default', ['clean'], function (cb) {
  runSequence('styles', ['scripts', 'images', 'fonts'], cb);
});

// Compile SASS, add CSS vendor prefixes and concatenate all styles. In
// development, create source-maps. In production, minify.
gulp.task('styles', function () {
  var concatPath = PATHS.styles.dest + '/' + PATHS.styles.concat;
  return gulp.src(PATHS.styles.src)
    .pipe($.if(!PRODUCTION, $.newer(concatPath)))
    .pipe($.if(!PRODUCTION, $.sourcemaps.init()))
    .pipe($.sass())
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe($.concat(PATHS.styles.concat))
    .pipe($.if(PRODUCTION, $.csso()))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.styles.dest))
    .pipe($.size({title: 'styles'}));
});

// Lint JavaScript, compile CoffeeScript and concatenate all scripts. In
// development, create source-maps. In production, minify.
gulp.task('scripts', function () {
  var concatPath = PATHS.scripts.dest + '/' + PATHS.scripts.concat;
  return gulp.src(PATHS.scripts.src)
    .pipe($.if(!PRODUCTION, $.newer(concatPath)))
    .pipe($.if('*.js', $.jshint()))
    .pipe($.if('*.js', $.jshint.reporter('jshint-stylish')))
    .pipe($.if(!PRODUCTION, $.sourcemaps.init()))
    .pipe($.if('*.coffee', $.coffee()))
    .pipe($.concat(PATHS.scripts.concat))
    .pipe($.if(PRODUCTION, $.uglify()))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.scripts.dest))
    .pipe($.size({title: 'scripts'}));
});

// Optimize images
gulp.task('images', function () {
  return gulp.src(PATHS.images.src)
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(PATHS.images.dest))
    .pipe($.size({title: 'images'}));
});

// Copy web fonts
gulp.task('fonts', function () {
  return gulp.src(PATHS.fonts.src)
    .pipe(gulp.dest(PATHS.fonts.dest))
    .pipe($.size({title: 'fonts'}));
});

// Recompile source static assets automatically whenever they change.
gulp.task('watch', function(cb) {
  gulp.watch(PATHS.styles.src, ['styles']);
  gulp.watch(PATHS.scripts.src, ['scripts']);
  gulp.watch(PATHS.images.src, ['images']);
  gulp.watch(PATHS.fonts.src, ['fonts']);
  console.log('Watching source assets... To stop watching, simply abort Gulp.');
});

// Serve the app using the compiled static assets. When they are recompiled,
// live reload the page in the browser. When Node scripts or views change,
// restart the server.
gulp.task('serve', function() {
    // Start a localhost that restarts itself when Node scripts or views change
    nodemon({
      script: PATHS.server, // The Node.js server to start
      env: {
        NODE_ENV: PRODUCTION
          ? 'production'
          : 'development'
      },
      // The files that should restart the server when modified
      watch: PATHS.appFiles.concat([PATHS.server])
    })
    .once('start', function () {
      // Start a proxy that reacts to static asset recompilations
      browserSync.init({
        proxy: SERVER_URL, // The local server we are proxying
        port: PROXY_PORT, // The port for the proxy
        files: PATHS.staticRoot, // The files to watch and reload
        browser: 'google chrome'
      });
    })
    .on('restart', function(files) {
      console.log('Restarting the server due to change in: ' + files);
    })
    .on('crash', function(err) {
      throw err;
    });
});

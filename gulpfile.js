//Todo: refactor this code!
var gulp            = require('gulp');
var webserver       = require('gulp-webserver');
var ngAnnotate      = require('gulp-ng-annotate');
var templateCache   = require('gulp-angular-templatecache');
var concat          = require('gulp-concat');
var plumber         = require('gulp-plumber');
var uglify          = require('gulp-uglify');
var del             = require('del');
var browserify      = require('browserify');
var watchify        = require('watchify');
var babelify        = require('babelify'); //Babelify need package: babel-preset-es2015
var source          = require('vinyl-source-stream');
var buffer          = require('vinyl-buffer');
var rename          = require('gulp-rename');
var sourcemaps      = require('gulp-sourcemaps');
var gutil           = require('gulp-util');
var minifyHTML      = require('gulp-minify-html');

var dest      = {
  preDirectory      : 'pre',
  directory         : 'dist',
  bundle            : '/' + 'all.js'
};

var src       = {
  webserver         : '.',
  angularModules    : 'src/js/*.js',
  angularTemplates  : 'src/js/templates/*.htm',
  alljs : [
              dest.preDirectory + '/*.js'
          ]
};

//Webserver
gulp.task('webserver', function() {
  gulp.src(src.webserver)
    .pipe(webserver({
      livereload: true,
      directoryListing: true,
      open: true
    }));
});

//Correct Angular for correct minification
gulp.task('annotate', ['clean'], function () {
    return gulp.src(src.angularModules)
        .pipe(ngAnnotate())
        .pipe(gulp.dest(dest.preDirectory));
});


//Concat all Angular Templates
gulp.task('templates', ['clean'], function () {
  return gulp.src(src.angularTemplates)
    .pipe(templateCache({standalone: true}))
    .pipe(gulp.dest(dest.preDirectory));
});

//Concat all angular javascript files
gulp.task('scripts',['annotate', 'templates'], function(ok) {
  // plumber(del(['pre/all.js'], ok));
  return gulp.src(src.alljs)
    .pipe(plumber())
    .pipe(concat(dest.bundle))
    .pipe(gulp.dest(dest.preDirectory));
});

//Minimify javascript file
gulp.task('compress', ['scripts'], function() {
  return gulp.src(dest.preDirectory + dest.bundle)
    .pipe(uglify())
    .pipe(gulp.dest(dest.directory));
});

//Delete files preprocessed
gulp.task('clean', function () {
  return del.sync(['pre'])
});

//Delete files of dist
gulp.task('clean_dist', function () {
  return del.sync(['dist'])
});

//Watch for changes in angular and its templates
gulp.task("watcher", function (){
  gulp.watch(['./src/*.htm', './src/*.html'], ['minify-html']);
  gulp.watch(src.angularModules, ['clean', 'annotate', 'templates', 'scripts', 'browserify']);
  gulp.watch(src.angularTemplates, ['clean', 'annotate' , 'templates', 'scripts', 'browserify'])
});

// Watchify
gulp.task('watchify',['scripts'], function () {
  var bundler   = watchify(
                    browserify('pre/all.js', { debug: true }))
                          // .transform(debowerify)
                          // .transform(browserifyShim)
                          // .transform(
                          //     babelify, {
                          //       presets: ['es2015']
                          //     }
                          // )
  bundle_js(bundler)

  bundler.on('update', function () {
    console.log("event");
    bundle_js(bundler)
  })
})

function bundle_js(bundler) {
  return bundler.bundle()
    .pipe(source('all.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps:true}))
    .pipe(rename('bundle.min.js'))
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/js'))
}

// Browserify without watchify
gulp.task('browserify',['scripts'], function () {
  var bundler   = browserify('pre/all.js', { debug: true })
                            // .transform(debowerify)
                            // .transform(browserifyShim)
                            // .transform(
                            //   babelify, {
                            //   presets: ['es2015']
                            // });
  return bundle_js(bundler);
})

var spawn = require('child_process').spawn;

gulp.task('php_server', function(){
    phpserver   = spawn('php', ['-S', 'localhost:8080'],{
      cwd : "../server/",
      detached : true,
      stdio: [ 'ignore', 'ignore', 'ignore' ]
    });

  phpserver.unref();
});

var exec = require('child_process').execSync;

gulp.task('php_server_stop', function() {
  try{
    exec('killall php');
  }catch(e){
    // console.log(e);
  }
});

gulp.task('default', ['copy', 'annotate', 'templates', 'scripts', 'watcher', 'watchify', 'webserver']);
gulp.task('finish', ['clean']);
gulp.task('finish_all', ['finish', 'clean_dist']);

gulp.task('copy', ['copy_images', 'copy_lib', 'copy_css', 'minify-html']);

gulp.task('copy_images', function(){
  return gulp.src('src/img/*.png')
    .pipe(gulp.dest('dist/img'))
});

gulp.task('copy_lib', function(){
  return gulp.src(['src/lib/*.js', 'src/lib/*.css', 'src/lib/*.map'])
    .pipe(gulp.dest('dist/lib'))
});

gulp.task('copy_css', function(){
  return gulp.src(['src/css/*.css'])
    .pipe(gulp.dest('dist/css'))
});

var wiredep = require('wiredep');

gulp.task('minify-html', function() {
  var opts = {
    conditionals: true,
    spare:true
  };

  return gulp.src(['./src/*.htm', './src/*.html'])
    .pipe(wiredep.stream({
      fileTypes: {
        html: {
          replace: {
            js: function(filePath) {
              return '<script src="' + filePath + '"></script>';
            },
            css: function(filePath) {
              return '<link rel="stylesheet" href="' + filePath + '"/>';
            }
          }
        }
      }
    }))
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('./dist/'));
});

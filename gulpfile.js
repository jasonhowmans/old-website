var gulp    = require( 'gulp' );
var rename  = require( 'gulp-rename' );
var sass    = require( 'gulp-sass' );
var uglify  = require( 'gulp-uglify' );
var concat  = require( 'gulp-concat' );
var prefix  = require( 'gulp-autoprefixer' );


// TASK: SASS
gulp.task('sass', function() {
  return gulp.src( 'assets/scss/main.scss' )
             .pipe( sass({ 'outputStyle': 'compressed' }) )
             .pipe( prefix('last 2 versions') )
             .pipe( rename('site.min.css') )
             .pipe( gulp.dest('assets/css') );
});


// TASK: Scripts
gulp.task('scripts', function() {
  return gulp.src( 'assets/js/lib/**/*.js' )
             .pipe( concat('site.min.js') )
             .pipe( uglify() )
             .pipe( gulp.dest('assets/js') );
});


// TASK: Vendor scripts
gulp.task('vendor', function() {
  return gulp.src( 'assets/js/vendor/**/*.js' )
             .pipe( concat('vendor.min.js') )
             .pipe( uglify() )
             .pipe( gulp.dest('assets/js') );
});

// TASK: Watch
gulp.task('watch', function() {
  gulp.watch( 'assets/scss/**/*.scss', ['sass'] );
  gulp.watch( ['assets/js/lib/**/*.js', 'assets/js/vendor/**/*.js'], ['scripts', 'vendor'] );
});


// TASK: Default
gulp.task('default', ['sass', 'scripts', 'vendor', 'watch']);

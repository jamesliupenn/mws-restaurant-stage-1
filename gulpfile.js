var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
// var browserSync = require('browser-sync').create();

gulp.task('default', function() {
	// Watches the sass folder for any scss file changes, if change,
	// execute the array of tasks
	gulp.watch('sass/**/*.scss', ['styles']);
});

gulp.task('styles', function() {
	gulp.src('sass/**/*.scss')
		// Listen to the error, and logs it to the terminal
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		// Save the gulp into css
		.pipe(gulp.dest('./css'));
});

// browserSync.init({
// 	server: "./"
// });
// browserSync.stream();
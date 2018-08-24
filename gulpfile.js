/*eslint-env node */

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var jasmine = require('gulp-jasmine-phantom');

gulp.task('default', ['styles', 'lint'], function() {
	// Watches the sass folder for any scss file changes, if change,
	// execute the array of tasks
	gulp.watch('sass/**/*.scss', ['styles']);
	gulp.watch('js/**/*.js', ['lint']);
	gulp.watch('index.html').on('change', browserSync.reload);

	browserSync.init({
		server: "./"
	});
});

gulp.task('lint', function() {
	return gulp.src(['js/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('styles', function() {
	gulp.src('sass/**/*.scss')
		// Listen to the error, and logs it to the terminal
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		// Save the gulp into css
		.pipe(gulp.dest('./css'))
		.pipe(browserSync.stream());

});

gulp.task('test', function() {
	gulp.src('tests/spec/extraSpec.js')
		.pipe(jasmine({
			integration: true,
			vendor: 'js/**/*.js'
		}));
});

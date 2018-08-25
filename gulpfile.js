/*eslint-env node */

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const jasmine = require('gulp-jasmine-phantom');
const imagemin = require('gulp-imagemin');
const imageResize = require('gulp-image-resize');
const rename = require('gulp-rename');

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

// The image compression task - imageMagick required (brew install imageMagick)
gulp.task('image', function() {
	gulp.src('img/*')
	// Create progressive jpeg for a smaller width
		.pipe(imagemin([imagemin.jpegtran({progressive: true})]))
		.pipe(imageResize({
			width: 400,
			imageMagick: true
		}))
		.pipe(rename(function(path){
			path.basename += '-400';
		}))
		.pipe(gulp.dest('imagemin-img'));
	// Create progressive jpeg for original width
	gulp.src('img/*')
		.pipe(imagemin([imagemin.jpegtran({progressive: true})]))
		.pipe(rename(function(path){
			path.basename += '-800';
		}))
		.pipe(gulp.dest('imagemin-img'));
});

gulp.task('test', function() {
	gulp.src('tests/spec/extraSpec.js')
		.pipe(jasmine({
			integration: true,
			vendor: 'js/**/*.js'
		}));
});

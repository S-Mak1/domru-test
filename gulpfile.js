var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglifyjs');
var watch = require('gulp-watch');
var csso = require('gulp-csso');
var streamqueue  = require('streamqueue');
var svgSprite = require("gulp-svg-sprites");
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var argv = require('yargs').argv;
var shell = require('gulp-shell')
var jade = require('gulp-jade');


var src = {
    scss: 'src/**/*.scss',
    html: '**/*.html',
    script:"src/js/**/*.js",
    jade: "src/**/*.jade",
};

// Компиляция Sass файлов в файл style.css
gulp.task('sass', function () {
  return gulp.src('./src/**/*.scss')
    .pipe(sass({outputStyle: 'normal'}).on('error', sass.logError))
    .pipe(autoprefixer({
            browsers: ['last 2 versions', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
            cascade: false
        }))
    .pipe(gulp.dest('./dist'))
});

//сборка всех файлов в единый bunlde.css
gulp.task('css-build', function() {
  return gulp.src(["./dist/**/*.css", "!./dist/css/bundle.css"])
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('./dist/'))
    .pipe(reload({stream: true}));
});

//сборка всех файлов из jslib в единый all.js
gulp.task('scripts', function() {
  return streamqueue({ objectMode: true },
        gulp.src('./src/js/jquery-3.2.1.js'),
        gulp.src('./src/js/snap.svg.js'),
        gulp.src('./src/js/svg-animation.js')
    )
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./dist/js/'))
});

//сборка SVG спрайта
gulp.task('svg-sprites', function () {
    return gulp.src('./src/blocks/**/img/*.svg')
        .pipe(svgSprite({
        	mode: "symbols",
            preview: false
        }))
        .pipe(concat('svg.php'))
        .pipe(gulp.dest("./dist/img/sprites"));
});

gulp.task('jade', function() {

  return gulp.src('./src/**/*.jade')
  .pipe(jade())
  .pipe(gulp.dest('./dist/'))
});

//gulp wath - функция которая смотрит за изменениями всех используемых в проекте фейлов и если какой-либо файл был изменен, то перезапускает необходимую gulp задачу для сборки этого файла
gulp.task('watch',['sass', 'scripts', 'css-build'], function() {
 gulp.watch('./src/**/*.scss', ['sass']);
  gulp.watch('./src/**/*.html');
   gulp.watch('./src/js/**/*.js', ['scripts']);
    gulp.watch('./dist/blocks/css/**/*.css', ['css-build']);
     gulp.watch('./src/img/*.svg', ['svg-sprites']);
      gulp.watch('./src/**/*.jade', ['jade']);

});

// сервер browser-sync

gulp.task('server', ['sass', 'scripts', 'css-build', 'watch', 'svg-sprites', 'jade'], function() {

    browserSync.init({
        proxy:'localhost/snapjs',
        port:3000
    });

    gulp.watch(src.scss, ['sass']);
    gulp.watch(src.html).on('change', reload);
});

//сжатие всех js файлов для запуска в продакшн, не добавлено в dev, потому-что занимает значительное время
gulp.task('js-prod', function() {
  return streamqueue({ objectMode: true },
        gulp.src('./src/js/jquery-3.2.1.js'),
        gulp.src('./src/js/snap.svg.js'),
        gulp.src('./src/js/svg-animation.js')
    )
  	.pipe(uglify())
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./js/'));
});

//сжатие всех css файлов для запуска в продакшн, не добавлено в dev, потому-что занимает значительное время
gulp.task('css-prod', function () {
     return gulp.src(["./dist/**/*.css", "!./dist/css/bundle.css"])
        .pipe(csso())
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('./css/'));
});

gulp.task('bem', function () {
     if (argv.create) {
        return gulp.src('./src/blocks')
          .pipe(shell([
            'cd ./src/blocks&&mkdir '+argv.create+
            '&&cd '+argv.create+
            '&&touch '+argv.create+'.jade &&touch '+argv.create+'.scss &&mkdir img'
          ]))
      console.log('Блок ' +argv.create+ ' создан')
    }
     if (argv.remove) {
        return gulp.src('./src/blocks')
          .pipe(shell([
            'cd ./src/blocks&&rm -rf '+argv.remove+'',
            'cd ./dist/blocks&&rm -rf '+argv.remove+''
          ]))
      console.log('Блок ' +argv.remove+ ' удалён')
    }
});

gulp.task('dev', ['sass', 'scripts', 'css-build', 'watch', 'svg-sprites', 'jade']);

gulp.task('build', ['sass', 'js-prod', 'css-prod', 'svg-sprites', 'jade' ]);

gulp.task('default', ['dev']);

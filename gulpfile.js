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
var spritesmith = require('gulp.spritesmith');


var src = {
    scss: 'src/**/*.scss',
    html: '**/*.html',
    script:"src/js/**/*.js",
    jade: "src/**/*.jade",
};

// Компиляция Sass файлов в файл style.css
gulp.task('sass', function () {
  return gulp.src(['./src/**/*.scss', './src/img/sprite-jpg.scss'])
    .pipe(sass({outputStyle: 'normal'}).on('error', sass.logError))
    .pipe(autoprefixer({
            browsers: ['last 2 versions', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
            cascade: false
        }))
    .pipe(csso())
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('./dist'))
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

//jade компилятор
gulp.task('jade', function() {

  return gulp.src('./src/**/*.jade')
  .pipe(jade())
  .pipe(gulp.dest('./dist/'))
});

//сборка png спрайта
gulp.task('sprite-png', function () {
  var spriteData = gulp.src('./src/blocks/**/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite-png.scss'
  }));
  return spriteData.pipe(gulp.dest('./src/img'));
});

gulp.task('sprite-jpg', function () {
  var spriteData = gulp.src(['./src/blocks/**/*.jpg','./src/blocks/**/*.jpeg']).pipe(spritesmith({
    imgName: 'sprite.jpg',
    cssName: 'sprite-jpg.scss',
    imgOpts: {quality: 95}
  }));
  return spriteData.pipe(gulp.dest('./src/img'));
});

gulp.task('font-transfer', function () {
  return gulp.src('./src/fonts/**/*.*')
  .pipe(gulp.dest('./dist/fonts'))
});

gulp.task('img-transfer', function () {
  return gulp.src(['./src/img/*.jpg', './src/img/*.jpeg', './src/img/*.png', './src/img/*.gif'])
  .pipe(gulp.dest('./dist/img'))
});



//gulp wath - функция которая смотрит за изменениями всех используемых в проекте файлов и если какой-либо файл был изменен, то перезапускает необходимую gulp задачу для сборки этого файла
gulp.task('watch',['sass', 'scripts', 'jade'], function() {
 gulp.watch('./src/**/*.scss', ['sass']);
   gulp.watch('./src/js/**/*.js', ['scripts']);
    gulp.watch('./src/img/*.svg', ['svg-sprites']);
     gulp.watch('./src/**/*.jade', ['jade']);
      gulp.watch('./src/blocks/**/*.png', ['sprite-png']);
       gulp.watch('./src/blocks/**/*.jpg', ['sprite-jpg']);

});

// сервер browser-sync

gulp.task('server', ['sass', 'scripts', 'watch', 'svg-sprites', 'jade', 'sprite-png', 'sprite-jpg', 'font-transfer', 'img-transfer'], function() {

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
// gulp.task('css-prod', function () {
//      return gulp.src(["./dist/**/*.css", "!./dist/css/bundle.css"])
//         .pipe(csso())
//         .pipe(concat('bundle.css'))
//         .pipe(gulp.dest('./css/'));
// });

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

gulp.task('dev', ['sass', 'scripts', 'watch', 'svg-sprites', 'jade', 'sprite-png', 'sprite-jpg', 'font-transfer', 'img-transfer']);

gulp.task('build', ['sass', 'js-prod', 'svg-sprites', 'jade', 'sprite-png', 'sprite-jpg', 'font-transfer', 'img-transfer']);

gulp.task('default', ['dev']);

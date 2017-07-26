var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    watch = require('gulp-watch'),
    csso = require('gulp-csso'),
    streamqueue  = require('streamqueue'),
    svgSprite = require("gulp-svg-sprites"),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    argv = require('yargs').argv,
    shell = require('gulp-shell'),
    jade = require('gulp-jade'),
    svgo = require('gulp-svgo'),
    spritesmith = require('gulp.spritesmith');


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
    .pipe(csso())
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('./dist'))
});

//сборка всех файлов из jslib в единый all.js
gulp.task('scripts', function() {
  return streamqueue({ objectMode: true },
        gulp.src('./src/js/*.js')
    )
    .pipe(uglify())
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./dist/js/'))
});

//сборка SVG спрайта
gulp.task('svg-sprites', function () {
    return gulp.src(['./src/blocks/**/*.svg', './src/img/**/*.svg'])
        .pipe(svgSprite({
        	mode: "symbols",
            preview: false
        }))
        .pipe(concat('sprite.svg'))
        //.pipe(svgo())
        .pipe(gulp.dest("./dist/img"));
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
    cssName: 'sprite-png.css',
    imgOpts: {quality: 95},
    algorithm: 'left-right'
  }));
  return spriteData.pipe(gulp.dest('./src/img'));
});

gulp.task('sprite-jpg', function () {
  var spriteData = gulp.src(['./src/blocks/**/*.jpg','./src/blocks/**/*.jpeg']).pipe(spritesmith({
    imgName: 'sprite.jpg',
    cssName: 'sprite-jpg.css',
    imgOpts: {quality: 95},
    algorithm: 'left-right'
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

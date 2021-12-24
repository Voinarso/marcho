const { src, dest, watch, parallel, series } = require('gulp');
const concat = require('gulp-concat');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const gulpuglify = require('gulp-uglify');
const del = require('del');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');

function browsersync() {
   browserSync.init({
      server: {
         baseDir: 'app/'
      }
   })
}

function images() {
   return src('app/images/**/*.*')
      .pipe(imagemin([
         imagemin.gifsicle({ interlaced: true }),
         imagemin.mozjpeg({ quality: 75, progressive: true }),
         imagemin.optipng({ optimizationLevel: 5 }),
         imagemin.svgo({
            plugins: [
               { removeViewBox: true },
               { cleanupIDs: false }
            ]
         })
      ]))
      .pipe(dest('dist/images'))
}


function styles() {
   return src('app/scss/style.scss')
      .pipe(scss({ outputStyle: 'compressed' }))
      .pipe(concat('style.min.css'))
      .pipe(autoprefixer({
         overrideBrowserslist: ['last 10 versions'],
         grid: true
      }))
      .pipe(dest('app/css'))
      .pipe(browserSync.stream())
}

function scripts() {
   return src([
      'node_modules/jquery/dist/jquery.js',
      'app/js/main.js'
   ])
      .pipe(concat('main.min.js'))
      .pipe(gulpuglify())
      .pipe(dest('app/js/'))
      .pipe(browserSync.stream())
}


function build() {
   return src([
      'app/**/*.html',
      'app/css/style.min.css',
      'app/js/main.min.js',
   ], { base: 'app' })
      .pipe(dest('dist'))
}

function cleanDist() {
   return del('dist')
}

function watching() {
   watch(['app/scss/**/*.scss'], styles);
   watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
   watch(['app/**/*.html']).on('change', browserSync.reload);
}

exports.cleanDist = cleanDist;
exports.images = images;
exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;
exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching);


var gulp = require("gulp");
var sass = require("gulp-sass");
var slim = require("gulp-slim");
var babel = require("gulp-babel");
var plumber = require("gulp-plumber");
var extender = require('gulp-html-extend');
var autoprefixer = require("gulp-autoprefixer");
var concat = require("gulp-concat");
var rename = require('gulp-rename');
var less = require('gulp-less');
var uglify = require("gulp-uglify");
var gulpFilter = require('gulp-filter');
var bower = require('main-bower-files');
var changed  = require('gulp-changed');
var imagemin = require("gulp-imagemin");
var watch = require("gulp-watch");
var browserSync = require('browser-sync');
var slimpath = "";

gulp.task('browser-sync', function(){
  browserSync({
    server: {
      baseDir: './public/'
    },
    port: 4040
  });
});

// slim
gulp.task('slim', function() {
  gulp.src("./app/views/**/*.slim")
    .pipe(plumber())
    .pipe(slim({
      pretty: true,
      require: 'slim/include',
      options: 'include_dirs=["./app/views/partial"]'
    }))
    .pipe(gulp.dest('./public/'))
});

gulp.task('slim-posts', function() {
  gulp.src(slimpath)
    .pipe(plumber())
    .pipe(slim({
      pretty: true,
      require: 'slim/include',
      options: 'include_dirs=["./app/views/partial"]'
    }))
    .pipe(gulp.dest('./public/posts/'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('slim-cases', function() {
  gulp.src(slimpath)
    .pipe(plumber())
    .pipe(slim({
      pretty: true,
      require: 'slim/include',
      options: 'include_dirs=["./app/views/partial"]'
    }))
    .pipe(gulp.dest('./public/cases/'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('slim-dhw', function() {
  gulp.src(slimpath)
    .pipe(plumber())
    .pipe(slim({
      pretty: true,
      require: 'slim/include',
      options: 'include_dirs=["./app/views/partial"]'
    }))
    .pipe(gulp.dest('./public/digital-hollywood/'))
    .pipe(browserSync.reload({stream:true}));
});

// sass
gulp.task("sass", function() {
  gulp.src("./app/stylesheets/application.sass")
    .pipe(plumber())
    .pipe(sass({pretty: true}))
    .pipe(autoprefixer())
    .pipe(gulp.dest("./public/css/"));
});

// image
gulp.task("imagemin", function() {
  gulp.src("./app/images/**/*.+(jpg|jpeg|png|gif|svg|ico)")
    .pipe(changed( './public/img/' ))
    .pipe(imagemin())
    .pipe(gulp.dest("./public/img/"));
});

// javascript
gulp.task("jsmin", function() {
  gulp.src("./app/javascript/*.js")
    .pipe(changed( 'jsmin' ))
    .pipe(plumber())
    .pipe(uglify())
    .pipe( rename({
      extname: '.min.js'
    }) )
    .pipe(gulp.dest("./public/js/"))
});

// bower
gulp.task('bower', function() {
  var jsDir = './app/javascript/', // jsを出力するディレクトリ
      jsFilter = gulpFilter('**/*.js', {restore: true}); // jsファイルを抽出するフィルター
  return gulp.src( bower({
      paths: {
        bowerJson: 'bower.json'
      }
    }) )
    .pipe( jsFilter )
    .pipe( concat('_bundle.js') )
    // jsを1つにしたものを出力
    .pipe( gulp.dest(jsDir) )
    .pipe( uglify({
      // !から始まるコメントを残す
      preserveComments: 'some'
    }) )
    .pipe( rename({
      extname: '.min.js'
    }) )
    // jsを1つにしてmin化したものを出力
    .pipe( gulp.dest('./public/js/') )
    .pipe( jsFilter.restore );
});

// default
gulp.task('default', ['watch', 'bower', 'imagemin', 'slim', 'sass', 'jsmin','browser-sync'] );
gulp.task('deploy', ['bower', 'imagemin', 'slim', 'sass', 'jsmin'] );

// watch
gulp.task('watch', function() {
  watch(["./app/views/**/*.slim"], function(event){
    slimpath = event.path
    slimpath_split = slimpath.split('/')
    slim_dir = slimpath_split[slimpath_split.length - 2]
    if(slim_dir == "posts"){
      gulp.start("slim-posts");
    } else if(slim_dir == "cases"){
      gulp.start("slim-cases");
    }else if(slim_dir == "digital-hollywood"){
      gulp.start("slim-dhw");
    }
  });
  watch(["./app/stylesheets/**/*.sass"], function(event){
    gulp.start("sass");
  });
  gulp.watch(['./app/views/*.slim', './app/views/partial/*.slim'],['slim']);
  gulp.watch(['./app/stylesheets/*.sass', './app/stylesheets/**/*.sass'], ['sass']);
  gulp.watch("./app/javascript/*.js", ['jsmin']);
});

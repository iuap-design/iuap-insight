var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// 压缩 js 文件
// 在命令行使用 gulp script 启动此任务
gulp.task('script', function() {
    // 1. 找到文件
    gulp.src('src/*.js')
    // 2. 压缩文件
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
    // 3. 另存压缩后的文件
        .pipe(gulp.dest('dist'))

})

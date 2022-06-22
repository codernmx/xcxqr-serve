var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')//导入post请求的中间件
var expressip = require('express-ip'); //查看IP
var indexRouter = require('./routes/index'); //小程序二维码登录
var bjcxRouter = require('./routes/bjcx'); //NJCX 数据库相关
var uploadRouter = require('./routes/upload'); //上传附件
var gzhRouter = require('./routes/gzh'); //公众号部分
var app = express();

app.use(expressip().getIpInfoMiddleware);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// post中间件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const loggerProxy = require('./config/logConfig');//redis使用

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 开放public
app.use(express.static(path.join(__dirname, 'public')));
// 开放upload
app.use('/upload', express.static(path.join(__dirname, '/upload')));


/* 这玩意不能放在开放静态资源之前 */
// 允许跨域访问  使用的是cors解决跨域问题，当我们再本地直接请求该接口的时候，可以直接请求
app.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", ' 3.2.1')
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});


/* 使用导入的router */
app.use('/api/', indexRouter);
app.use('/api/gzh', gzhRouter);
app.use('/api/bjcx', bjcxRouter);
app.use('/api/upload', uploadRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	loggerProxy.info(req.path)
	res.send({
		msg: '接口未定义',
		code: 404
	})
});


// apidoc  api文档
app.use('./apidoc', express.static('./apidoc'));


// error handler
/* 初步判定不抛出异常是这里的问题先屏蔽掉 */
// app.use(function (err, req, res, next) {
// 	// set locals, only providing error in development
// 	res.locals.message = err.message;
// 	res.locals.error = req.app.get('env') === 'development' ? err : {};

// 	// render the error page
// 	res.status(err.status || 500);
// 	res.render('error');
// });

module.exports = app;

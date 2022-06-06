
var express = require('express');
var router = express.Router();

var fs = require('fs'); //文件
var multer = require('multer');   //上传文件中间件
var moment = require('silly-datetime'); //格式化时间

const { execsql } = require('../utils/coon');//数据库sql函数
const { createCode, success, fail, createFileName } = require('../utils/index');//成功失败


// 创建文件夹  使用此代码就是为了让我们查找磁盘中是否有该文件夹，如果没有，可以自动创建，而不是我们提前手动创建好。如果不使用此代码，则我们再使用该文件夹之前，需要手动创建好当前文件夹
var createFolder = function (folder) {
	try {
		// 测试 path 指定的文件或目录的用户权限,我们用来检测文件是否存在
		// 如果文件路径不存在将会抛出错误"no such file or directory"
		fs.accessSync(folder);
	} catch (e) {
		// 文件夹不存在，以同步的方式创建文件目录。
		fs.mkdirSync(folder);
	}
};


// 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const time = moment.format(new Date(), 'YYYY-MM-DD') //这里是按照日期通过文件夹归类文件
		// 接收到文件后输出的保存路径（若不存在则需要创建）
		// const time = moment.format(new Date(), 'YYYY-MM-DD')
		var uploadFolder = './upload/' + time;   //文件按照日期分割创建文件夹
		createFolder(uploadFolder);
		cb(null, 'upload/' + time);
	},
	filename: function (req, file, cb) {
		// 将保存文件名设置为 时间戳 + 文件原始名，比如 151342376785-123.jpg
		// file.originalname   是文件名+后缀
		// file.originalname.substring(file.originalname.lastIndexOf("."))  这里是拿到文件的后缀
		cb(null, createFileName(6) + file.originalname.substring(file.originalname.lastIndexOf(".")));  //对当前时间戳 加文件名取MD5 加上后缀名
		// 之前文件名 md5(Date.now() + file.originalname)
		// cb(null, Date.now() + "-" + file.originalname);
	}
});


// 创建 multer 对象
var upload = multer({ storage });


router.post('/file', upload.single('file'), function (req, response, next) {
	const time = moment.format(new Date(), 'YYYY-MM-DD')
	const file = req.file;
	const usePath = file.path.substring(7)
	const suffix = file.originalname.substring(file.originalname.lastIndexOf("."))
	console.log(usePath, 'usePath')
	let sql = `INSERT INTO FILE (OLD_NAME,NAME,SIZE,FOLDER,PATH,SUFFIX) VALUES ('${file.originalname}','${file.filename}','${file.size}','${file.destination}','${time + '/' + file.filename}','${suffix}')`
	/* 存数据库 */
	execsql(sql).then(res => {
		// 接收文件成功后返回数据给前端
		response.send(success({ ...file, usePath }))
	}).catch((err) => {
		response.send(err)
	})
	console.log('文件类型：%s', file.mimetype);
	console.log('原始文件名：%s', file.originalname);
	console.log('文件大小：%s', file.size);
	console.log('文件保存路径：%s', file.path);
});

module.exports = router;

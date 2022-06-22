var express = require('express');
var router = express.Router();
const fs = require('fs')
const requests = require('../utils/request');//使用封装的requests
var mysql = require('mysql');
const { success, fail } = require('../utils/index');//成功失败
const loggerProxy = require('../config/logConfig');//导入日志log4
var moment = require('silly-datetime'); //格式化时间
/* 共用文件名 */
const tokenFileName = 'access_token_info.json'

//连接数据库//创建连接
var connection = mysql.createConnection({
	host: '101.43.108.49',  //新服务器
	user: 'root',
	password: 'SPwd@8809',
	port: 3307,
	database: 'RXX',
	timezone: "08:00",  //(解决时区问题)
	wait_timeout: 28800,
	connect_timeout: 10,
	connectionLimit: 100,
});
//连接数据库
connection.connect();

//避免数据库超时断开
function keepAlive () {
	connection.query('select 1', [], function (err, result) {
		if (err) return loggerProxy.info(err);
		// Successul keepalive
	});
}


/* 保持数据库 */
setInterval(keepAlive, 1000 * 60);


/* 共用获取token */
async function getToken () {
	const time = moment.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
	loggerProxy.info('定时重新获取access_token---------------->>',time)
	/* 获取token */
	const getTokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx6f877428ac5ee3f2&secret=5be7b51e5f4e96b6dcb7b8fcacb79ada'
	const tokenRes = await requests(getTokenUrl, 'GET')
	const access_token = JSON.parse(tokenRes).access_token
	/* 存储 */
	const tokenInfo = {
		access_token,
		create_time: time,
		remark: '公众号的access_token'
	}
	fs.writeFileSync(tokenFileName, JSON.stringify(tokenInfo))
	return 0
}

/* 启动项目获取token */
getToken ()
/* 保证文件中token  一直有效 一个小时获取一次 */
setInterval(getToken, 1000 * 3600);


//执行语句sql
function execsql (sql) {
	return promise = new Promise((resolve, reject) => {
		connection.query(sql, (err, res) => {
			if (err) {
				reject(err)
				return
			}
			resolve(res)
		})
	})
}

/* ----------------------------------公众号后台管理------------------------------- */
/* ----------------------------------公众号后台管理------------------------------- */
/* ----------------------------------公众号后台管理------------------------------- */


/* 获取城市列表 */
router.get('/city/list', async (req, response, next) => {
	const { appid } = req.query
	const sql = `select count(*) as total from LIMIT_CONFIG where delete_time is null and app_id like '%${appid}%'`
	let pageNum = 0
	let pageSize = 10
	if (req.query.pageSize) {
		pageSize = req.query.pageSize
	}
	if (req.query.pageNum) {
		pageNum = req.query.pageNum * pageSize - pageSize
	}
	try {
		const totalAll = await execsql(sql)
		let total = totalAll[0].total  //获取到的分页总数
		const sqlNew = `select * from LIMIT_CONFIG where delete_time is null and app_id LIKE '%${appid}%' order by id desc limit ${pageNum},${pageSize}`
		const res = await execsql(sqlNew)
		response.send(success(res, total));
	} catch (error) {
		response.send(fail(error))
	}
});


/* 获取配置客户列表 */
router.get('/city/customer/list', async (req, response, next) => {
	loggerProxy.info(req.body, '请求参数')
	let sql = 'select title,appid,remarks from CUSTOMER'
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});


/* 发送模板通知 */
router.post('/notice/send', async (req, response, next) => {
	try {
		const { params } = req.body
		loggerProxy.info(params, 'params')
		// loggerProxy.info(req.body, '请求参数')
		/* 从文件中获取token  */
		const access_token = JSON.parse(fs.readFileSync(tokenFileName, 'utf-8')).access_token
		/* 请求发送模板消息接口 */
		const url = 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + access_token
		const resJson = await requests(url, 'POST', params)
		const res = JSON.parse(resJson)
		if (res.errcode == 0) {
			response.send(success({
				...res,
				openid: params.touser
			}))
		} else {
			response.send(fail(resJson))
		}
	} catch (error) {
		response.send(fail(error))
	}
});


/* 新增城市 */
router.post('/city/insert', async (req, response, next) => {
	loggerProxy.info(req.body, '请求参数')
	const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, appid, city_name, remarks } = req.body
	const sql = `insert into LIMIT_CONFIG (monday, tuesday, wednesday, thursday, friday, saturday, sunday,app_id,city_name,remarks) values ('${monday}','${tuesday}','${wednesday}','${thursday}','${friday}','${saturday}','${sunday}','${appid}','${city_name}','${remarks}')`
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});


/* 修改城市的限行规则 */
router.post('/city/update', async (req, response, next) => {
	try {
		loggerProxy.info(req.body, '请求参数')
		const { id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, appid, city_name, remarks } = req.body
		let sql = `update LIMIT_CONFIG set monday = '${monday}', tuesday = '${tuesday}', wednesday = '${wednesday}', thursday = '${thursday}', friday = '${friday}', saturday = '${saturday}', sunday = '${sunday}', app_id = '${appid}', city_name = '${city_name}', remarks = '${remarks}' where id = ${id}`
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});



/* 删除城市限行规则（直接删除） */
router.get('/city/delete', async (req, response, next) => {
	loggerProxy.info(req.body, '请求参数')
	const { id } = req.query
	let sql = `delete from LIMIT_CONFIG where id = '${id}'`
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});


module.exports = router;

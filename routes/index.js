var express = require('express');
var router = express.Router();
const requests = require('../utils/request');//使用封装的requests

const fs = require('fs')
const request = require('request');
const { appConfig } = require('../config/index')

const client = require('../utils/redis');//redis使用
const { sendCode, sendEmail } = require('../utils/nodemailer');//发送邮件
const { execsql } = require('../utils/coon');//数据库操作方法
const { createCode, success, fail } = require('../utils/index');//成功失败


/* /api */
router.get('/', async (req, res, next) => {
	res.send(success('Hello 大冤种，接口调用成功了~~~'))
});

/* 共用文件名 */
const tokenFileName = 'mp_token_info.json'


/* 共用获取token */
async function getToken () {
	/* 检测文件中token是否过期 */
	console.log('重新获取access_token')
	/* 获取 */
	const getTokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appConfig.appId + '&secret=' + appConfig.appSecret
	const tokenRes = await requests(getTokenUrl, 'GET')
	const access_token = JSON.parse(tokenRes).access_token
	/* 存储 */
	const expires_time = parseInt(Date.now() / 1000)
	const tokenInfo = {
		access_token,
		expires_time,
		remark: '这是用于生成小程序二维码的access_token'
	}
	fs.writeFileSync(tokenFileName, JSON.stringify(tokenInfo))
	return 0
}

/* 保证文件中token  一直有效 */
setInterval(getToken, 1000 * 7100);



//发送验证码邮件
router.post('/send/code', async (req, response, next) => {
	let code = createCode() //随机生成验证码
	const mail = req.body.username //请求携带的邮件
	const res = await client.set(mail, code)
	client.expire(mail, 60 * 1000);//设置过期时间 60s 前端六十秒可以重新获取
	sendCode(mail, code)
	response.send(success())
});



/* 发送邮件 */
router.post('/send/email', async (req, response, next) => {
	console.log(req.body, '请求参数')
	// 	const ip = req.ipInfo.ip.replace('::ffff:','')
	// 	console.log(req.ipInfo)
	const { email, subject, content } = req.body
	sendEmail(email, subject, content)  /* 发送邮件 */
	// 	let address = JSON.parse(body).address
	let sql = `INSERT INTO LOG (IP,ADDRESS,ACTION) VALUES ('本机地址','${email}','${'发送了邮件，内容为：' + content}')`
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
	// 	request({
	// 		url: 'https://api.map.baidu.com/location/ip?ak=Z2mZbxYsOQllRq7MqFspSrYNqG9uPa20&ip=' + ip,
	// 		method: "GET",
	// 	}, function (error, res, body) {
	// 		if (!error && res.statusCode == 200) {
	// 			console.log(body,'百度地图置换ip',JSON.parse(body)) // 请求成功的处理逻辑
	// 			let address = JSON.parse(body).address
	// 			let sql = `INSERT INTO LOG (IP,ADDRESS,ACTION) VALUES ('${ip}','${address}','${'发送了邮件，内容为：' + content}')`
	// 			execsql(sql).then(r => {
	// 				response.send(success(r))
	// 			}).catch((err) => {
	// 				response.send(err)
	// 			})
	// 		} else {
	// 			response.send(fail(error))
	// 		}
	// 	})

});

//登录
router.post('/code/login', async (req, response, next) => {
	/* 这里 用户名就是 邮件 临时密码就是code */
	const { username, password } = req.body
	const redisRes = await client.get(username)
	if (password == redisRes) {
		console.log('验证成功')
		let sql = `SELECT * FROM  USER WHERE EMAIL = '${username}' AND DELETE_TIME IS NULL`
		const res = await execsql(sql)
		console.log(res, 'res')
		/* 直接登录成功 */
		if (res[0]) {
			if (res[0].STATUS == 0) {
				response.send(success({
					name: username,
					code: password,
					...res[0],
					token: username
				}))
			} else {
				response.send(fail('当前账号被停用，请及时联系管理员！'))
			}
		} else {
			try {
				/* 这一块后期优化 */
				/* 先创建用户 */
				let sql = `INSERT INTO USER (NICK_NAME,EMAIL,AVATAR_URL) VALUES ('user_${createCode()}','${username}','https://thirdwx.qlogo.cn/mmopen/vi_32/xCIc7U9YzawpxOjH89Prg1LyQtgicbA8WVPOgMgibU35icXjDrdlzQvq5VicQy3TzxgNh0GdtVibhFCibibZ65E1uOMdw/132')`
				const res = await execsql(sql)
				/* 拿到创建用户的id */
				let selectInsertSql = `SELECT * FROM USER WHERE EMAIL = '${username}' AND DELETE_TIME IS NULL`
				const resLogin = await execsql(selectInsertSql)
				/* 创建角色 */
				let insertRoleSql = `INSERT INTO USER_ROLE (USER_ID,ROLE_ID) VALUES ('${resLogin[0].ID}','2')`
				let insertRoleRes = await execsql(insertRoleSql)
				/* 创建角色 */
				response.send(success({
					name: username,
					code: password,
					...resLogin[0],
					token: username
				}))
			} catch (error) {
				response.send(fail(error))
			}
		}
	} else {
		response.send(fail('验证失败'))
	}
});


/* 获取角色信息 */
router.get('/get/user/info', async (req, response, next) => {
	const { ID } = req.query
	/* 获取角色 */
	const sql = `SELECT * FROM ROLE JOIN USER_ROLE ON ROLE.ID = USER_ROLE.ROLE_ID WHERE USER_ROLE.USER_ID = '${ID}' AND USER_ROLE.DELETE_TIME IS NULL`
	try {
		const roles = await execsql(sql)
		let sqlUser = `SELECT * FROM USER WHERE ID = ${ID}`
		const res = await execsql(sqlUser)
		response.send(success({
			roles,
			...res[0]
		}))
	} catch (error) {
		response.send(fail(error))
	}
});


/* 获取配置信息 */
router.get('/get/config', async (req, response, next) => {
	let sql = 'SELECT * FROM CONFIG WHERE ID = 1'
	try {
		const res = await execsql(sql)
		response.send(success(res[0]))
	} catch (error) {
		response.send(fail(error))
	}
});




// 登录uuid
router.get('/uuid', async (req, res, next) => {
	let uuid = req.query.uuid
	const access_token = JSON.parse(fs.readFileSync(tokenFileName, 'utf-8')).access_token

	/* 后期换成自己封装的 */
	request({
		url: 'https://api.weixin.qq.com/tcb/databasequery?access_token=' + access_token,
		method: "POST",
		json: true,
		headers: {
			"content-type": "application/json",
		},
		body: {
			env: appConfig.env, query: 'db.collection("uuids").where({uuid:"' + uuid + '"}).get()',
		},
		encoding: null,
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			let uuids = body
			let data = uuids.data && uuids.data.length > 0 ? JSON.parse(uuids.data[0]) : {}
			let nickname = data.userInfo ? data.userInfo.nickName || '' : ''
			let avatar = data.userInfo ? data.userInfo.avatarUrl || '' : ''
			let openid = data.openid ? data.openid : ''
			res.send(
				{
					code: 200,
					msg: '成功',
					data: {
						nickname: nickname,
						avatar,
						openid,
						timestemp: new Date().getTime(),
						token: new Date().getTime() //假的token 后期更换
					}
				})
		}
	})
});


// 获取小程序二维码
router.get('/getCode', async (req, res, next) => {
	const access_token = JSON.parse(fs.readFileSync(tokenFileName, 'utf-8')).access_token
	console.log(access_token, '获取access_token')
	let useAuth = req.query.useAuth
	// 获取随机uuid
	let scene = 'uuid=' + (req.query.uuid || 9999) + '&auth=' + useAuth
	// 获取小程序码配置
	request({
		url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + access_token,
		method: "POST",
		json: true,
		headers: {
			"content-type": "application/json",
		},
		body: {
			width: 230, scene: scene
			// env_version:'trial' //体验版本
		},
		encoding: null,
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body, '获取二维') // 请求成功的处理逻辑
			res.setHeader("Content-Type", 'image/png');
			res.send(body)
		} else {
			res.send(fail(error))
		}
	})
});

module.exports = router;

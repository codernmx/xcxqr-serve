var express = require('express');
var router = express.Router();


const fs = require('fs')
const request = require('request');
const { appConfig } = require('../config/index')

const client = require('../utils/redis');//redis使用
const { sendCode, sendEmail } = require('../utils/nodemailer');//发送邮件
const { execsql } = require('../utils/coon');//数据库操作方法
const { createCode, success, fail } = require('../utils/index');//成功失败




/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});




//发送验证码邮件
router.post('/send/code', function (req, response, next) {
	let code = createCode() //随机生成验证码
	const mail = req.body.username //请求携带的邮件
	client.set(mail, code).then(res => {   //存入redis
		//设置成功发送邮件
		sendCode(mail, code)
		response.send(success())
	})
	client.expire(mail, 60 * 1000);//设置过期时间 60s 前端六十秒可以重新获取
});
/* 发送邮件 */
router.post('/send/email', function (req, response, next) {
	console.log(req.body, 'req.body')
// 	const ip = req.ipInfo.ip.replace('::ffff:','')
// 	console.log(req.ipInfo)
	const { email, subject, content } = req.body
	sendEmail(email, subject, content)  /* 发送邮件 */
// 	let address = JSON.parse(body).address
	let sql = `INSERT INTO LOG (IP,ADDRESS,ACTION) VALUES ('本机地址','${email}','${'发送了邮件，内容为：' + content}')`
	execsql(sql).then(r => {
		response.send(success(r))
	}).catch((err) => {
		response.send(err)
	})
			
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

		//do something
		let sql = `SELECT * FROM  USER WHERE EMAIL = '${username}'`
		const res = await execsql(sql)
		console.log(res, 'res')
		/* 直接登录成功 */
		if (res[0]) {
			response.send(success({
				name: username,
				code: password,
				...res[0],
				token: username
			}))
		} else {
			try {
				// response.send(fail('非管理员账号，请等待后续开发~'))
				/* 先创建用户 */
				let sql = `INSERT INTO USER (NICK_NAME,EMAIL,AVATAR_URL) VALUES ('user_${createCode()}','${username}','https://thirdwx.qlogo.cn/mmopen/vi_32/xCIc7U9YzawpxOjH89Prg1LyQtgicbA8WVPOgMgibU35icXjDrdlzQvq5VicQy3TzxgNh0GdtVibhFCibibZ65E1uOMdw/132')`
				const res = await execsql(sql)
				/* 拿到创建用户的id */
				let selectInsertSql = `SELECT * FROM USER WHERE EMAIL = '${username}'`
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
		console.log('验证失败')
		response.send(fail('验证失败'))
	}
});


/* 获取角色信息 */
router.get('/get/user/info', function (req, response, next) {
	const { ID } = req.query
	/* 获取角色 */
	let sql = `SELECT * FROM ROLE JOIN USER_ROLE ON ROLE.ID = USER_ROLE.ROLE_ID WHERE USER_ROLE.USER_ID = '${ID}' AND USER_ROLE.DELETE_TIME IS NULL`
	execsql(sql).then(res => {
		let sqlUser = `SELECT * FROM USER WHERE ID = ${ID}`
		execsql(sqlUser).then(r => {
			response.send(success({
				roles: res,
				...r[0]
			}))
		}).catch((errUser) => {
			response.send(errUser)
		})
	}).catch((err) => {
		response.send(err)
	})
});

/* 获取配置信息 */
router.get('/get/config', function (req, response, next) {
	console.log(req.path)
	let sql = 'SELECT * FROM CONFIG WHERE ID = 1'
	execsql(sql).then(res => {
		response.send(success(res[0]))
	}).catch((err) => {
		response.send(err)
	})
});




// 登录uuid
router.get('/uuid', function (req, res, next) {
	let uuid = req.query.uuid, token = JSON.parse(fs.readFileSync('mp_token_info.json', 'utf-8')).access_token || ''

	request({
		url: 'https://api.weixin.qq.com/tcb/databasequery?access_token=' + token,
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
			// console.log(body) // 请求成功的处理逻辑
			let uuids = body
			console.log(uuids, 'uuids')
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
router.get('/getCode', function (req, res, next) {
	let token = JSON.parse(fs.readFileSync('mp_token_info.json', 'utf-8')).access_token || ''

	let useAuth = req.query.useAuth
	// 获取随机uuid
	let scene = 'uuid=' + (req.query.uuid || 9999) + '&auth=' + useAuth
	// 获取小程序码配置
	request({
		url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + token,
		method: "POST",
		json: true,
		headers: {
			"content-type": "application/json",
		},
		body: {
			width: 230, scene: scene
			// ,env_version:'trial' //体验版本
		},
		encoding: null,
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			// console.log(body) // 请求成功的处理逻辑
			res.setHeader("Content-Type", 'image/png');
			res.send(body)
		}
	})
});
// 获取全局token
router.get('/getToken', function (req, res, next) {
	let tokenFileName = 'mp_token_info.json'
	let tokenInfo = fs.existsSync(tokenFileName) ? JSON.parse(fs.readFileSync(tokenFileName, 'utf-8')) : null
	let expires_time = tokenInfo ? tokenInfo.expires_time : ''
	let cache_access_token = tokenInfo && tokenInfo.access_token ? tokenInfo.access_token : ''
	if (parseInt(Date.now() / 1000) > expires_time + 3600 || tokenInfo == null || cache_access_token == '') {
		let tokenForUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appConfig.appId + '&secret=' + appConfig.appSecret
		request(tokenForUrl, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log(body) // 请求成功的处理逻辑
				let tokenInfoNew = body
				tokenInfoNew = JSON.parse(tokenInfoNew)
				cache_access_token = tokenInfoNew.access_token
				expires_time = parseInt(Date.now() / 1000)
				fs.writeFileSync(tokenFileName, JSON.stringify({
					access_token: cache_access_token, expires_time,
				}))
				res.send({
					// token: cache_access_token,
					expires_time,
					code: 200
				})

			}
		});
	} else {
		res.send({ expires_time: tokenInfo.expires_time, code: 200 })
	}
});



// 会影响其他的模块
// router.get('*', function (req, res){
//     console.log('404 handler..')
//     res.send({
//         msg:'接口未定义',
//         code:404
//     });
// });



module.exports = router;

var express = require('express');
var router = express.Router();

const request = require('request');
const config = require('../config/index')

const fs = require('fs')

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
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
			env: config.env, query: 'db.collection("uuids").where({uuid:"' + uuid + '"}).get()',
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


// const codeOptions = {
// 	method: 'POST', url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + token, body: , json: true, encoding: null,
// }

// // 获取小程序码图片Buffer
// let imgBuffer = await rp(codeOptions)
// console.log('console.log(imgBuffer)')
// ctx.mimeType = 'image/png'
// ctx.data = imgBuffer
// });



// 获取全局token
router.get('/getToken', function (req, res, next) {
	let tokenFileName = 'mp_token_info.json'
	let tokenInfo = fs.existsSync(tokenFileName) ? JSON.parse(fs.readFileSync(tokenFileName, 'utf-8')) : null
	let expires_time = tokenInfo ? tokenInfo.expires_time : ''
	let cache_access_token = tokenInfo && tokenInfo.access_token ? tokenInfo.access_token : ''
	if (parseInt(Date.now() / 1000) > expires_time + 3600 || tokenInfo == null || cache_access_token == '') {
		let tokenForUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.appId + '&secret=' + config.appSecret
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
					token: cache_access_token,
					expires_time,
					code: 200
				})

			}
		});
	} else {
		res.send({ token: tokenInfo.access_token, expires_time: tokenInfo.expires_time, code: 200 })
	}
});



module.exports = router;

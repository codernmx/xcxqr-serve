// 生成验证码
function createCode () {
	return parseInt(Math.random() * 1000000)
	// return 'xxxxxx'.replace(/[xy]/g, function (c) {
	// 	var r = (Math.random() * 16) | 0
	// 	var v = c == 'x' ? r : (r & 0x3) | 0x8
	// 	return v.toString(16)
	// })
}
//code  生成附件名称
function createFileName (length) {
	var str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	var result = ''
	for (var i = length; i > 0; --i)
		result += str[Math.floor(Math.random() * str.length)]
	return result
}

//成功返回参数
function success (res, total = null) {
	if (total) {
		return {
			code: 200,
			data: res,
			msg: '成功',
			total
		}
	} else {
		return {
			code: 200,
			data: res,
			msg: '成功'
		}
	}
}

//失败参数
function fail (msg) {
	return {
		code: 500,
		msg
	}
}

module.exports = {
	createCode,
	success,
	fail,
	createFileName
}
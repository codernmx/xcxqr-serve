var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
	res.send('respond with a resource');
});



/**
 * @apiDefine CODE_200
 * @apiSuccess (Reponse 200) {Number} code 0 为成功，-1位异常
 * @apiSuccess (Reponse 200) {Json/Array/Null} data 数组或null，需要根据情况判断，一般有值时为数据类型，没有值时为[]或null
 * @apiSuccess (Reponse 200) {String} msg 请求成功/失败描述信息
 * @apiSuccess (Reponse 200) {String} [error_code] 错误码，有时没有
 * @apiSuccessExample {json} Response 200 Example
 *    HTTP/1.1 200 OK
 *    {
 *      "code": 0,
 *      "data": [],
 *      "msg": "操作成功"
 *    }
 */


/**
 * 通过用户编码查询用户信息
 * @api {get} admin/getUserInfo 通过用户编码查询用户信息
 * @apiName getUserInfo
 * @apiDescription 通过用户编码查询用户信息
 * @apiGroup admin
 * @apiVersion 1.0.0
 * @apiParam {String} user_code 用户编码
 * @apiParamExample  {type} Request-Example:
 *    {
 *      "user_code": "001"
 *    }
 * @apiSuccessExample {type} Success-Response
 *    HTTP/1.1 200 OK
 *    {
 *      "code": 0,
 *      "data": [
 *        {
 *         "user_img": "",
 *         "user_name": "",
 *         "user_code": "",
 *         "sex": "",
 *         "national": "",
 *         "idcard": "",
 *         "age": ""
 *        }
 *      ],
 *      "msg": "返回成功"
 *    }
 * @apiSampleRequest http://localhost:3000/admin/getUserInfo
 * @apiUse CODE_200
 */
router.get('/admin/getUserInfo', function (req, res, next) {
	res.json({
		code: 0,
		data: [{
			"user_img": "",
			"user_name": "",
			"user_code": "",
			"sex": "",
			"national": "",
			"idcard": "",
			"age": ""
		}],
		msg: "返回成功"
	});
});
module.exports = router;

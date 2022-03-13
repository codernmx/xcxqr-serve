var express = require('express');
var router = express.Router();


const { execsql } = require('../utils/coon');//数据库sql函数


//成功返回参数
function success (res, total = null) {
	return {
		code: 200,
		data: res,
		msg: '成功',
		total
	}
}


// 获取用户列表（分页）
router.get('/user/list', function (req, response, next) {
	const sql = 'select count(*) as total from USER where DELETE_TIME is null'
	let pageNum = 1
	if (req.query.pageNum) {
		pageNum = req.query.pageNum * 10 - 10
	}
	execsql(sql).then((r1) => {
		let total = r1[0].total  //获取到的分页总数
		const sqlNew = `select * from USER where DELETE_TIME is null LIMIT ${pageNum},10`
		execsql(sqlNew).then((r2) => {
			response.send(success(r2, total));
		}).catch((err) => {
			res.send(err)
		})
	}).catch((err) => {
		res.send(err)
	})
});

















//ip

// 获取用户行为列表（ip表）（分页）
router.get('/log/list', function (req, response, next) {
	const sql = 'select count(*) as total from LOG where DELETE_TIME is null'
	let pageNum = 1
	if (req.query.pageNum) {
		pageNum = req.query.pageNum * 10 - 10
	}
	execsql(sql).then((r1) => {
		let total = r1[0].total  //获取到的分页总数
		const sqlNew = `select * from LOG where DELETE_TIME is null LIMIT ${pageNum},10`
		execsql(sqlNew).then((r2) => {
			response.send(success(r2, total));
		}).catch((err) => {
			res.send(err)
		})
	}).catch((err) => {
		res.send(err)
	})
});




















module.exports = router;

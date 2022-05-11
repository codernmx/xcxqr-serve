var express = require('express');
var router = express.Router();


const { execsql } = require('../utils/coon');//数据库sql函数
const { createCode, success, fail } = require('../utils/index');//成功失败


/**
 * @api {get} /api/bjcx/user/list 通过用户编码查询用户信息
 * 获取用户列表（分页）
 */
router.get('/user/list', function (req, response, next) {
	const { nickName } = req.query
	const sql = 'select count(*) as total from USER where DELETE_TIME is null'
	let pageNum = 1
	let pageSize = 10
	if (req.query.pageSize) {
		pageSize = req.query.pageSize
	}
	if (req.query.pageNum) {
		pageNum = req.query.pageNum * pageSize - pageSize
	}
	execsql(sql).then((r1) => {
		let total = r1[0].total  //获取到的分页总数
		const sqlNew = `select * from USER where DELETE_TIME is null AND nickName LIKE '%${nickName}%' ORDER BY CREATE_TIME DESC LIMIT ${pageNum},${pageSize}`
		execsql(sqlNew).then((r2) => {
			response.send(success(r2, total));
		}).catch((err) => {
			response.send(err)
		})
	}).catch((err) => {
		response.send(err)
	})
});
/* 获取详细信息 */
router.get('/user/detail', function (req, response, next) {
	console.log(req.body, 'req.body')
	const { ID } = req.query
	let sql = `SELECT * FROM USER  WHERE ID = ${ID}`
	execsql(sql).then(res => {
		response.send(success(res))
	}).catch((err) => {
		response.send(err)
	})
});


/* 新增用户 */
router.post('/user/insert', function (req, response, next) {
	console.log(req.body, 'req.body')
	const { nickName } = req.body
	const sql = `INSERT INTO USER (nickName) VALUES ('${nickName}')`
	execsql(sql).then(res => {
		response.send(success(res))
	}).catch((err) => {
		response.send(err)
	})
});


/* 修改用户 */
router.post('/user/update', function (req, response, next) {
	console.log(req.body, 'req.body')
	const { id, nickName } = req.body
	let sql = `UPDATE USER SET nickName = '${nickName}' WHERE id = ${id}`
	execsql(sql).then(res => {
		response.send(success(res))
	}).catch((err) => {
		response.send(err)
	})
});


/* 删除用户 */
router.get('/user/delete', function (req, response, next) {
	console.log(req.body, 'req.body')
	const { id } = req.query
	let sql = `DELETE FROM USER  WHERE id = ${id}`
	execsql(sql).then(res => {
		response.send(success(res))
	}).catch((err) => {
		response.send(err)
	})
});



/* 日志表 */

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


/* 获取附件列表 */
router.get('/file/list', function (req, response, next) {
	const { NAME } = req.query
	const sql = 'select count(*) as total from FILE where DELETE_TIME is null'
	let pageNum = 1
	if (req.query.pageNum) {
		pageNum = req.query.pageNum * 10 - 10
	}
	execsql(sql).then((r1) => {
		let total = r1[0].total  //获取到的分页总数
		const sqlNew = `select * from FILE where DELETE_TIME is null AND OLD_NAME LIKE '%${NAME}%' LIMIT ${pageNum},10`
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

var express = require('express');
var router = express.Router();


const { execsql } = require('../utils/coon');//数据库sql函数
const { createCode, success, fail } = require('../utils/index');//成功失败


/**
 * @api {get} /api/bjcx/user/list 通过用户编码查询用户信息
 * 获取用户列表（分页）
 */
router.get('/user/list', function (req, response, next) {
	const { NICK_NAME } = req.query
	const sql = `select count(*) as total from USER where DELETE_TIME is null AND NICK_NAME LIKE '%${NICK_NAME}%'`
	let pageNum = 0
	let pageSize = 10
	if (req.query.pageSize) {
		pageSize = req.query.pageSize
	}
	if (req.query.pageNum) {
		pageNum = req.query.pageNum * pageSize - pageSize
	}
	execsql(sql).then((r1) => {
		let total = r1[0].total  //获取到的分页总数
		const sqlNew = `SELECT * FROM USER WHERE DELETE_TIME IS NULL AND NICK_NAME LIKE '%${NICK_NAME}%' ORDER BY ID DESC LIMIT ${pageNum},${pageSize}`
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
	const { NICK_NAME } = req.body
	const sql = `INSERT INTO USER (NICK_NAME) VALUES ('${NICK_NAME}')`
	execsql(sql).then(res => {
		response.send(success(res))
	}).catch((err) => {
		response.send(err)
	})
});


/* 修改用户 */
router.post('/user/update', function (req, response, next) {
	console.log(req.body, 'req.body')
	const { ID, NICK_NAME } = req.body
	let sql = `UPDATE USER SET NICK_NAME = '${NICK_NAME}' WHERE ID = ${ID}`
	execsql(sql).then(res => {
		response.send(success(res))
	}).catch((err) => {
		response.send(err)
	})
});


/* 删除用户 */
router.get('/user/delete', function (req, response, next) {
	console.log(req.body, 'req.body')
	const { ID } = req.query
	let sql = `DELETE FROM USER  WHERE ID = ${ID}`
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
	let pageNum = 0
	if (req.query.pageNum) {
		pageNum = req.query.pageNum * 10 - 10
	}
	execsql(sql).then((r1) => {
		let total = r1[0].total  //获取到的分页总数
		const sqlNew = `select * from LOG where DELETE_TIME is null ORDER BY CREATE_TIME DESC LIMIT ${pageNum},10`
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
	const sql = `select count(*) as total from FILE where DELETE_TIME is null AND OLD_NAME LIKE '%${NAME}%'`
	let pageNum = 0
	if (req.query.pageNum) {
		pageNum = req.query.pageNum * 10 - 10
	}
	execsql(sql).then((r1) => {
		let total = r1[0].total  //获取到的分页总数
		const sqlNew = `select * from FILE where DELETE_TIME is null AND OLD_NAME LIKE '%${NAME}%' ORDER BY CREATE_TIME DESC LIMIT ${pageNum},10`
		console.log(sqlNew, 'sqlNew')
		execsql(sqlNew).then((r2) => {
			response.send(success(r2, total));
		}).catch((err) => {
			res.send(err)
		})
	}).catch((err) => {
		res.send(err)
	})
});

/* 修改附件 */
router.post('/file/update', function (req, response, next) {
	console.log(req.body, 'req.body')
	const { ID, OLD_NAME } = req.body
	let sql = `UPDATE FILE SET OLD_NAME = '${OLD_NAME}' WHERE ID = ${ID}`
	execsql(sql).then(res => {
		response.send(success(res))
	}).catch((err) => {
		response.send(err)
	})
});

/* 附件假删除 */
router.post('/file/del', function (req, response, next) {
	const { ID } = req.body
	let sql = `UPDATE FILE SET DElETE_TIME = now() WHERE ID = ${ID}`
	execsql(sql).then(res => {
		response.send(success(res))
	}).catch((err) => {
		response.send(err)
	})
});


router.get('*', function (req, res) {
	console.log('404 handler..')
	res.send({
		msg: '接口未定义',
		code: 404
	});
});


module.exports = router;

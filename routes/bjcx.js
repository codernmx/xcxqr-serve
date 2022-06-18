var express = require('express');
var router = express.Router();
const { execsql } = require('../utils/coon');//数据库sql函数
const { success, fail } = require('../utils/index');//成功失败


/**
 * @api {get} /api/bjcx/user/list 通过用户编码查询用户信息
 * 获取用户列表（分页）
 */

/* ----------------------------------用户------------------------------- */
/* ----------------------------------用户------------------------------- */
/* ----------------------------------用户------------------------------- */

router.get('/user/list', function (req, response, next) {
	const { NICK_NAME } = req.query
	const sql = `SELECT count(*) as total from USER where DELETE_TIME is null AND NICK_NAME LIKE '%${NICK_NAME}%'`
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
router.get('/user/detail', async (req, response, next) => {
	try {
		console.log(req.body, 'req.body')
		const { ID } = req.query
		const sql = `SELECT * FROM USER  WHERE ID = ${ID}`
		const res = await execsql(sql)
		const roleSql = `SELECT ROLE_ID FROM USER_ROLE WHERE USER_ID = ${ID} AND DELETE_TIME IS NULL`
		const roleRes = await execsql(roleSql)
		const newArr = []
		roleRes.forEach(v => {
			newArr.push(v.ROLE_ID)
		});
		response.send(success({
			...res[0],
			role: newArr
		}))
	} catch (error) {
		response.send(error)
	}
});


/* 新增用户 */
router.post('/user/insert', async (req, response, next) => {
	console.log(req.body, 'req.body')
	const { NICK_NAME } = req.body
	const sql = `INSERT INTO USER (NICK_NAME) VALUES ('${NICK_NAME}')`
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});


/* 修改用户 */
router.post('/user/update', async (req, response, next) => {
	console.log(req.body, 'req.body')
	const { ID, NICK_NAME, ROLE, EMAIL } = req.body
	const sql = `UPDATE USER SET NICK_NAME = '${NICK_NAME}',EMAIL = '${EMAIL}' WHERE ID = ${ID}`
	try {
		const result = await execsql(sql)
		if (ROLE.length > 0) {
			/* 清空角色 设置新的角色 */
			const sql = `DELETE FROM USER_ROLE WHERE USER_ID = ${ID}`
			// const sql = `UPDATE USER_ROLE SET DElETE_TIME = now() WHERE USER_ID = ${ID}`
			const res = await execsql(sql)
			ROLE.forEach(v => {
				const insertNewRoleSql = `INSERT INTO USER_ROLE (USER_ID,ROLE_ID) VALUES ('${ID}','${v}')`
				execsql(insertNewRoleSql).then(res => {
					console.log(res)
				})
			});
			response.send(success(result))
		} else {
			response.send(success(result))
		}
	} catch (error) {
		response.send(fail(error))
	}
});


/* 修改用户状态 */
router.post('/user/updateStatus', async (req, response, next) => {
	console.log(req.body, 'req.body')
	const { ID, STATUS } = req.body
	const sql = `UPDATE USER SET STATUS = '${STATUS}' WHERE ID = ${ID}`
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});


/* 删除用户（软删除） */
router.get('/user/delete', async (req, response, next) => {
	console.log(req.body, 'req.body')
	const { ID } = req.query
	let sql = `UPDATE USER SET DElETE_TIME = now() WHERE ID = ${ID}`
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});



/* ----------------------------------角色------------------------------- */
/* ----------------------------------角色------------------------------- */
/* ----------------------------------角色------------------------------- */

/* 角色列表 */
router.get('/role/list', function (req, response, next) {
	const { NAME } = req.query
	const sql = `SELECT COUNT(*) as total FROM ROLE WHERE DELETE_TIME IS NULL AND NAME LIKE '%${NAME}%'`
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
		const sqlNew = `SELECT * FROM ROLE WHERE DELETE_TIME IS NULL AND NAME LIKE '%${NAME}%' ORDER BY ID DESC LIMIT ${pageNum},${pageSize}`
		execsql(sqlNew).then((r2) => {
			response.send(success(r2, total));
		}).catch((err) => {
			response.send(err)
		})
	}).catch((err) => {
		response.send(err)
	})
});
/* 获取角色详细信息 */
router.get('/role/detail', async (req, response, next) => {
	console.log(req.body, 'req.body')
	const { ID } = req.query
	let sql = `SELECT * FROM ROLE  WHERE ID = ${ID}`
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});


/* 新增角色 */
router.post('/role/insert', async (req, response, next) => {
	console.log(req.body, 'req.body')
	const { NAME, REMARKS } = req.body
	const sql = `INSERT INTO ROLE (NAME,REMARKS) VALUES ('${NAME}','${REMARKS}')`
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});


/* 修改角色 */
router.post('/role/update', async (req, response, next) => {
	console.log(req.body, 'req.body')
	const { ID, NAME, REMARKS } = req.body
	let sql = `UPDATE ROLE SET NAME = '${NAME}', REMARKS = '${REMARKS}' WHERE ID = ${ID}`
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});


/* 删除角色（软删除） */
router.get('/role/delete', async (req, response, next) => {
	console.log(req.body, 'req.body')
	const { ID } = req.query
	let sql = `UPDATE ROLE SET DElETE_TIME = now() WHERE ID = ${ID}`
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});


/* ----------------------------------日志------------------------------- */
/* ----------------------------------日志------------------------------- */
/* ----------------------------------日志------------------------------- */


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



/* ----------------------------------附件------------------------------- */
/* ----------------------------------附件------------------------------- */
/* ----------------------------------附件------------------------------- */

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
router.post('/file/update', async (req, response, next) => {
	console.log(req.body, 'req.body')
	const { ID, OLD_NAME } = req.body
	let sql = `UPDATE FILE SET OLD_NAME = '${OLD_NAME}' WHERE ID = ${ID}`
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});

/* 附件假删除 */
router.post('/file/del', async (req, response, next) => {
	const { ID } = req.body
	let sql = `UPDATE FILE SET DElETE_TIME = now() WHERE ID = ${ID}`
	try {
		const res = await execsql(sql)
		response.send(success(res))
	} catch (error) {
		response.send(fail(error))
	}
});


/* 通过关联表查询用户的角色一起返回 */
router.get('/test', async (req, response, next) => {
	const sql = 'SELECT * FROM USER LIMIT 0,10'
	const result = await execsql(sql)
	Promise.all(result.map(function (elem) {
		return new Promise(async (resolve, reject) => {
			/* 关联查询 */
			const sql = `SELECT * FROM ROLE JOIN USER_ROLE ON USER_ROLE.ROLE_ID = ROLE.ID WHERE USER_ROLE.USER_ID = '${elem.ID}'`
			const res = await execsql(sql)
			elem.USER = [...res]
			resolve(res);
		})
	})).then((data) => {
		//在这就可以等所有的返回结果可以得到
		response.send(success(result))
	})
});


module.exports = router;

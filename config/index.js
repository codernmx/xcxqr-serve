// 数据库配置文件
const dbConfig = {
	host: '49.232.153.152',  //新服务器
	user: 'root',
	password: '137928',
	database: 'BJCX',
	timezone: "08:00",  // 在原来基础上增加这一行(解决时区问题)
	wait_timeout: 28800,
	connect_timeout: 10,
	connectionLimit: 100,
}


module.exports = {
	dbConfig,
	appId: 'wx285a242d191f9226', // 小程序appid
	appSecret: '9a2df59bab8c6b744cf699749d5d6263', // 小程序secrect
	env: 'codernmx-5gyxmux49f98c8b2' // 小程序云开发环境ID
}
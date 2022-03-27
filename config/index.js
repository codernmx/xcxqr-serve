/* 数据库配置 */
const dbConfig = {
	host: '49.232.153.152',  //新服务器
	user: 'root',
	password: '137928',
	database: 'BJCX',
	timezone: "08:00",  //(解决时区问题)
	wait_timeout: 28800,
	connect_timeout: 10,
	connectionLimit: 100,
}
/* 邮件配置信息  */
const mailConfig = {
	//其他需要修改的去 nodemail 文件修改
	user: 'nmxgzs@foxmail.com', //注册的邮箱账号
	pass: 'dnjuvraksaacdijc' //邮箱的授权码，不是注册时的密码,等你开启的stmp服务自然就会知道了
}
/* 小程序配置 */
const appConfig = {
	appId: 'wx285a242d191f9226', // 小程序appid
	appSecret: '9a2df59bab8c6b744cf699749d5d6263', // 小程序secrect
	env: 'codernmx-5gyxmux49f98c8b2' // 小程序云开发环境ID
}



module.exports = {
	dbConfig,
	mailConfig,
	appConfig
}
const redis = require('redis');
const client = redis.createClient(); //默认没有密码 127.0.0.1  端口也是默认

//如果连接远程的话
// redis[s]://[[username][:password]@][host][:port][/db-number]:
// const client = createClient({
// 	url: 'redis://alice:foobared@awesome.redis.server:6380'
// });
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();


module.exports = client;
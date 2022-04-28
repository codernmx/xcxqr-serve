var fs = require('fs'); //文件
var qr = require('qr-image');

const AlipaySdk = require('alipay-sdk').default;
const alipaySdk = new AlipaySdk({
	appId: '2018012102012259',
	privateKey: 'MIIEowIBAAKCAQEAsNOdEkEWQbosPou73hBVrmon+XSPM0m+xfC+FFRH7YyPX0Yy56k/VoLXFZJWcVups1XmPO2HuVdvdMRmET5bmWjp/WesvxkkUBIQY+Uo7mg/H0PSR6YvT6Q0nuNhDpcDdt/ZjUT33cexo+No7qXJdoWYnyoAVQ5lz5a4Zf0I06wWJJ6sdThAlIKqvu2VLB3bNA6J2GU18T+ZLrBz+m7lvzNTZQBsPrxClIzZ+k6Agm/soTClPKDW4j41kDGnXQuAyEXUBK+gzdlffBkNYMIrgWyiM+EtSlU0kockXp7EXNspwg2NdW5VdjZcYyK4iY0zfK5wASRNkJWzBbcHL71wgQIDAQABAoIBAQCWTSkjzQM4FyFogKnNlaDewgj8duEJvVNVOM64xPLmriVn3GmElE3sIQblpR+o9zsF3qv3egd1uSZZ4F7JpXGCsrTB2o/xV1OQY+penvjtvNp6ntFsaYupbG/15lwnZKFjN97Zv5fYgdcy8SfOQkk+X0xdbfweUECl9P0EY9JO6HugV3WE7JECT2PwbguDqeuX0zZsrOuklf1XX4/dP9Z8XWFOeuqIMnrO6JRDIoWeF/Glrjn6QSnXes28EjHTk6zrdVJK0ueyHMDf8d/pehHSftwQVOjGkfiS5qtLw/PCHMefFLKYGxxDWhPP2U9WMT0HqarSfKbD/wGVNrz6bQABAoGBANidKe+VGcOyMRQiRetn4aael8W+MM2w4brZMSCWwiVQwNroEe5s2XW0470ZwAtIlX1aK7f6ZaO24+bBnFTrqrzg4bY243WagtjLxk9o1Y6LmIItG8BY38IjSaGIiwEHNfg/Mf8CF7vcnlsfuDHXO7EPYA6VPkm1cjH+/wWN+m4BAoGBAND6cz/di5F31n2ajzcNutpm3thSxRLnsUmPdigRY17+28ZUAwK1giH8dYuYOAVw3TPQCnh5aNCeir+kZ9Xw7zv/uAXxb2aGRG749QVeM/njlMSpTWTNYVc+Q6sQUMabNdglifDdgZNwlzWK76nDT2PRAhU5+YyzEQXKc4EPsAKBAoGAAiNzEYlwSq1MrL014YASCzoPl4UsKCux3s1cHc0/N20XqlGWM7thXjcd9HT3n2TlDOrB+bwAGuCoWVPZ/kChW+IAeHMMRdHzrr48Q/Zt/U1FgSt+1aRK+Tit9mlJrgXrM3s0PCdCIrmn2pBymhNc5H+ZXCt/BO1Eple1HtHrAgECgYBgn8x19Ru5MO2tua8KR4Djxri20N5qNVKVro11TUTjAXfgpauWrxHyYOaAmuscKOk+Ma0Fsy0xeHyyy3NvSi1zUnNl3BIkF2TA4r93sezaV83LeHRebU/apOFo0OxoSA+HVyQGiISHBYIEsa7KkZG9l0AdTGcEFS+Du+3X+MbrAQKBgF1B/mX8+xNC3WhwzEUQmdI64TEc0z56Tg2DZQJIX/WKCU7bw7emwWTQGGFWql2ZteOOpv/O6PfdYLdjKe4wmGxZjvPUuV7Wz+1Sm09uVr8faHynuZl10KXg7yZxxVqDVqjkjAoQ1E5juLXNBd13B8ZfnDIrwLAY4HkGOIXv2YC1'
});

// const result = await alipaySdk.exec(method, params, options);   //调用接口参数例子

alipaySdk.exec('alipay.trade.precreate', {  //生成订单信息
	bizContent: {
		out_trade_no: time, //商户订单号 （最好保证唯一）
		total_amount: '0.01', //订单总金额，
		subject: '柠檬♥工作室', // 订单标题。
	}
}).then(result => {
	console.log(result);
	let Buffer = qr.imageSync(result.qrCode, { type: 'png' });  //生成的文件流
	fs.writeFile('../upload/ewm/' + time + '.png', Buffer, function (err) {
		if (err) {
			console.log(err);
		} else {
			console.log("ok");
		}
	})

})



const createOrder = function ({ title, money }) {
	return new Promise((resolve, reject) => {

		alipaySdk.exec('alipay.trade.precreate', {  //生成订单信息
			bizContent: {
				out_trade_no: new Date().getTime(), //商户订单号 （最好保证唯一）
				total_amount: money, //订单总金额，
				subject: title, // 订单标题。
			}
		}).then(result => {
			console.log(result);
			// let Buffer = qr.imageSync(result.qrCode, { type: 'png' });  //生成的文件流 //创建二维码
			// fs.writeFile('../upload/ewm/' + time + '.png', Buffer, err => {    //存入upload文件夹
			// 	if (err) {
			// 		console.log(err);
			// 	} else {
			// 		console.log("ok");
			// 	}
			// })
			resolve(result)

		}).catch(err => {
			reject(err)
		})
	})
}

module.exports = {
	createOrder
}
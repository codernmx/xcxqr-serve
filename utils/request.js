
var request = require('request');


/* 
  url:请求路径
  method：请求方式
  data：参数
  isForm：是否是表单格式
*/
const requests =  (url, method = 'POST', data, isForm = false) => {
  return new Promise((resolve, reject) => {
    if (method == 'GET') {
      /* 一般GET请求 */
      request({ url, method: 'GET', qs: data }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body) // 请求成功的处理逻辑
          resolve(body)
        } else {
          reject(error)
        }
      });
    } else {
      /* 提交form表单 */
      if (isForm) {
        request.post({ url, form: data }, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body) // 请求成功的处理逻辑
            resolve(body)
          } else {
            reject(error)
          }
        })
      } else {
        console.log('一般POST')
        /* 一般POST请求 */
        request({
          url, method: "POST", json: false,
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(data)
        }, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body) // 请求成功的处理逻辑
            resolve(body)
          } else {
            reject(error)
          }
        });
      }
    }
  })
}



module.exports = requests;
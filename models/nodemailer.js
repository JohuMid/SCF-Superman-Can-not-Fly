/*
Johu 2019/4/17 10:24:31.
*/
var nodemailer = require('nodemailer');

//创建一个smtp服务器
var config = {
    host: 'smtp.163.com',
    port: 465,
    auth: {
        user: '17782161804@163.com', //注册的163邮箱账号
        pass: '1997919Ly' //邮箱的授权码，不是注册时的密码,等你开启的stmp服务自然就会知道了
    }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);



//发送邮件
module.exports = function (mail) {
    transporter.sendMail(mail, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('mail sent:', info.response);
    });
};

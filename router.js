var express = require('express')

var url = require('url')
var User = require('./models/user')
var Article = require('./models/article')

//加密信息
//npm i blueimp-md5
var md5 = require('blueimp-md5')

var nodemail = require('./models/nodemailer')

var router = express.Router()

router.get('/', function (req, res) {

    res.render('index.html', {
        user: req.session.user
    });
})
router.post('/', function (req, res) {

    //查询数据库发送给前端
    Article.find().sort({'last_modified_time': -1}).exec(function (err, aa, count) {
        res.send({
            aa: aa
        });
    });
})

router.get('/login', function (req, res) {
    res.render('login.html')
})

router.post('/login', function (req, res, next) {
    // 1. 获取表单数据
    // 2. 查询数据库用户名密码是否正确
    // 3. 发送响应数据
    var body = req.body;


    User.findOne({
        email: body.email,
        password: md5(md5(body.password))
    }, function (err, user) {
        if (err) {
            // return res.status(500).json({
            //   err_code: 500,
            //   message: err.message
            // })
            return next(err)
        }

        // 如果邮箱和密码匹配，则 user 是查询到的用户对象，否则就是 null
        if (!user) {
            return res.status(200).json({
                err_code: 1,
                message: 'Email or password is invalid.'
            })
        }

        // 用户存在，登陆成功，通过 Session 记录登陆状态
        //服务器端的数据记录
        req.session.user = user

        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    })
})

router.get('/register', function (req, res, next) {
    res.render('register.html')
});
//用来存验证码的数组
var arr = [];

router.post('/register', function (req, res, next) {
    // 1. 获取表单提交的数据
    //    req.body
    // 2. 操作数据库
    //    判断改用户是否存在
    //    如果已存在，不允许注册
    //    如果不存在，注册新建用户
    // 3. 发送响应
    var body = req.body;
    //用户输入的验证码
    // console.log(body.vecode);
    //正确的验证码
    // console.log(Number(arr[0]));

    User.findOne({
        $or: [{
            email: body.email
        },
            {
                nickname: body.nickname
            }
        ]
    }, function (err, data) {
        if (err) {

            return next(err)
        }
        // console.log(data)
        if (data) {
            // 邮箱或者昵称已存在
            return res.status(200).json({
                err_code: 1,
                message: 'Email or nickname aleady exists.'
            })
            // return res.send(`邮箱或者昵称已存在，请重试`)
        }
        if (Number(body.vecode) !== Number(arr[0])) {
            return res.status(200).json({
                err_code: 2,
                message: 'Incorrect verification code.'
            })
        }
        //获取用户输入的验证码
        // var ivecode = body.vecode;
        // body.vecode = vecode;


        // 对密码进行 md5 重复加密
        body.password = md5(md5(body.password))

        new User(body).save(function (err, user) {
            if (err) {
                return next(err)
            }


            // 注册成功，使用 Session 记录用户的登陆状态
            req.session.user = user;

            // Express 提供了一个响应方法：json
            // 该方法接收一个对象作为参数，它会自动帮你把对象转为字符串再发送给浏览器
            res.status(200).json({
                err_code: 0,
                message: 'OK'
            })

            // 服务端重定向只针对同步请求才有效，异步请求无效
            // res.redirect('/')
        })
    });

});
router.get('/email', function (req, res) {
    //发送验证码
    var email = req.query.email;
    var nickname = req.query.nickname;

    // var date = new Date();//获取当前时间
    // var isLive = "no";

    //系统生成的验证码
    var vecode = createSixNum();
    arr = [];
    arr.push(vecode);


    var mail = {
        // 发件人
        from: '<17782161804@163.com>',
        // 主题
        subject: 'cast验证码',
        // 收件人
        to: email,
        // 邮件内容，HTML格式
        text: '你好' + nickname + '，用' + vecode + '作为你的登录验证码'//发送验证码
    };
    nodemail(mail);

    res.status(200).json({
        err_code: 2,
        message: 'OK'
    })
});
router.get('/logout', function (req, res) {
    // 清除登陆状态
    req.session.user = null

    // 重定向到登录页
    res.redirect('/')
});

router.get('/forgetpsd', function (req, res, next) {
    res.render('forgot-password.html');
});

//密码修改验证码数组
var rearr = [];

router.get('/repsd', function (req, res, next) {
    var revecode = createSixNum();

    rearr.push(revecode);
    var email = req.query.email;

    var mail = {
        // 发件人
        from: '<17782161804@163.com>',
        // 主题
        subject: 'cast密码修改验证码',
        // 收件人
        to: email,
        // 邮件内容，HTML格式
        text: '你好' + '，用' + revecode + '作为你的密码修改验证码'//发送验证码
    };
    nodemail(mail);

    res.status(200).json({
        err_code: 0,
        message: 'OK'
    })

});
router.post('/repsd', function (req, res, next) {

    var body = req.body;
    //用户输入的验证码
    var irevecode = body.irevecode;
    // console.log(irevecode);

    var email = body.email;


    //系统生成的验证码
    // console.log(rearr[0]);

    //验证码不正确
    if (Number(rearr[0]) !== Number(irevecode)) {
        res.status(200).json({
            err_code: 1,
            message: 'Incorrect verification code.'
        })
    }
    var repsd = body.repsd;


    User.findOne({"email": email}, function (err, data) {
        if (err) {
            return next(err)
        }
        if (!data) {
            // 邮箱未注册
            return res.status(200).json({
                err_code: 2,
                message: 'Your email is not registered.'
            });
        } else if (data) {
            // console.log(data);
        }
    });


    User.update(
        {email: email},
        {
            $set:
                {
                    password: md5(md5(repsd))
                }
        },
        function (err, data, next) {
            if (err) {
                return next(err)
            } else {
                return res.status(200).json({
                    err_code: 0,
                    message: 'OK.'
                })

            }
        })

});

router.get('/publish', function (req, res, next) {
    res.render('publish.html');
});
router.post('/publish', function (req, res, next) {

    var body = req.body;
    var theme = body.theme;
    var text = body.text;
    var nickname = {'nickname': req.session.user.nickname};

    //js 将多个对象合并成一个对象 assign方法
    var obj = (Object.assign(body, nickname));

    new Article(obj).save(
        function (err) {
            if (err) {
                return next(err)
            }
            res.status(200).json({
                err_code: 0,
                message: 'OK',
            })
        });

});

router.get('/article', function (req, res, next) {

    res.render('article.html');
});

var idArr = [];
router.get('/art', function (req, res, next) {
    idArr = [];
    idArr.push(req.query.id);
});

router.post('/art', function (req, res, next) {
    var id = idArr[0];

    Article.findOne({
        _id: id,
    }).exec(function (err, data, count) {
        // console.log(data);
        res.send({
            data: data
        });
    });
})

router.get('/chat', function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;

    var jsonstr = `{"content": "` + req.query.chatbox + `","up": 0,"down": 0}`;

    Article.update(
        {_id: id},
        {
            $push: {
                chat: jsonstr
            },
        }, function (err) {
            if (err) {
                console.log(err);
            }
            res.status(200).json({
                err_code: 0,
                message: 'OK',
            })
        });

})

router.get('/user', function (req, res, next) {
    res.render('user.html')
});

router.get('/userdata', function (req, res, next) {
    res.send({user: req.session.user})
});

//六位数字验证码生成函数
function createSixNum() {
    var Num = "";
    for (var i = 0; i < 6; i++) {
        Num += Math.floor(Math.random() * 10);
    }
    return Num;
}


module.exports = router;

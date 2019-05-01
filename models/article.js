var mongoose = require('mongoose')

// 连接数据库
mongoose.connect('mongodb://localhost/test', {useMongoClient: true})

var Schema = mongoose.Schema

var articleSchema = new Schema({
    nickname: {
        type: String,
        required: true
    },
    theme: {
        type: String,
        required: true
    },
    article: {
        type: String,
        required: true
    },
    chat: {
        type: Array,
        required: false,
    },
    created_time: {
        type: Date,
        // 注意：这里不要写 Date.now() 因为会即刻调用
        // 这里直接给了一个方法：Date.now
        // 当你去 new Model 的时候，如果你没有传递 create_time ，则 mongoose 就会调用 default 指定的Date.now 方法，使用其返回值作为默认值
        default: Date.now
    },
    //最后修改时间
    last_modified_time: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Number,
        // 0 没有权限限制
        // 1 不可以评论
        // 2 不可以登录
        enum: [0, 1, 2],
        default: 0
    }
})

module.exports = mongoose.model('Article', articleSchema)

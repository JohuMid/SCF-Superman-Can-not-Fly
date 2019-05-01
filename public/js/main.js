/*
Johu 2019/4/28 11:08:01.
*/
//返回多少时间以前

function timeago(dateTimeStamp) {
    // stringTime = stringTime.replace(/T/g,' ').replace(/Z/g,' ');


    // stringTime = new Date(Date.parse(stringTime.replace(/-/g, "/")));

    // dateTimeStamp是一个时间毫秒，注意时间戳是秒的形式，在这个毫秒的基础上除以1000，就是十位数的时间戳。13位数的都是时间毫秒。
    var minute = 1000 * 60;      //把分，时，天，周，半个月，一个月用毫秒表示
    var hour = minute * 60;
    var day = hour * 24;
    var week = day * 7;
    var halfamonth = day * 15;
    var month = day * 30;

    var now = new Date().getTime();   //获取当前时间毫秒
    var diffValue = now - dateTimeStamp;//时间差

    if (diffValue < 0) {
        return;
    }

    var minC = diffValue / minute;  //计算时间差的分，时，天，周，月
    var hourC = diffValue / hour;
    var dayC = diffValue / day;
    var weekC = diffValue / week;
    var monthC = diffValue / month;

    if (monthC >= 1) {
        result = "" + parseInt(monthC) + "月前";
    } else if (weekC >= 1) {
        result = "" + parseInt(weekC) + "周前";
    } else if (dayC >= 1) {
        result = "" + parseInt(dayC) + "天前";
    } else if (hourC >= 1) {
        result = "" + parseInt(hourC) + "小时前";
    } else if (minC >= 1) {
        result = "" + parseInt(minC) + "分钟前";
    } else
        result = "刚刚";
    return result;
}
/**
 *
 * @param stringTime 当前字符串时间，从数据库取出
 * @returns {Date}
 *
 * 一个大坑：mongoDB对时间的处理ISODate与我们时区相差8小时
 *
 * 函数用来转换当地时间
 */
function now(stringTime) {
    var timezone = 8; //目标时区时间，东八区
    var offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
    var nowDate = new Date(stringTime).getTime(); // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
    var targetDate = new Date(nowDate + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000);

    targetDate = timeago(targetDate);


    return targetDate;
}

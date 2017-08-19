/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var mysql = require('mysql');
var request = require("request");
var cheerio = require("cheerio");
var linebot = require('linebot');
var express = require('express');
var fs = require('fs');
var schedule = require('node-schedule');
var timer, timer2, timer3; //各項時程發送
var my_robot = require('./MyRobot.js'); //爬蟲智慧庫
var wallet = require('./wallet.js'); //錢包
var member = require('./Member.js'); //會員

var host_ip = "127.0.0.1"; //資料庫IP

var bus_stop_254 = "TPE17606";
var url_254 = "http://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/Taipei/254?$top=100&$format=JSON";
var bus_stop_913 = "NWT19549";
var url_913 = "http://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/NewTaipei/913?$top=100&$format=JSON";
var bot = linebot({
    channelId: '1530553288',
    channelSecret: 'e3706264cb1f29efc1139468825b3482',
    channelAccessToken: 'b3opydEiDWolKryUMs7STk0rsSKkb+23DtyoRI058FuPyhXXRzTzStDFJZOqlF7ut1wv5V7Zb9UDGAJZuQb8nq2Ng2P/xXwSyJiXMZ4RzAkO9z1uF9EVaOtByhFGpeoMZnUeVSdKM5DAxzclGzlOZwdB04t89/1O/w1cDnyilFU='
});
bot.on('message', function (event) {
    console.log(event); //把收到訊息的 event 印出來看看
    try {
        var user_id = event.source.userId;
        if (event.message.type === 'text') {
            var msg = event.message.text;
            if (msg.indexOf("天氣") !== -1) {
                //傳送天氣資訊
                my_robot.send_weather(event);
            } else if (msg.indexOf("ETH") !== -1 || msg.indexOf("以太") !== -1) {
                //傳送以太幣資訊
                my_robot.send_ETH(event);
            } else if (msg.indexOf("開燈") !== -1) {
                //開燈
                my_robot.set_light(event, 1);
            } else if (msg.indexOf("關燈") !== -1) {
                //關燈
                my_robot.set_light(event, 0);
            } else if (msg.indexOf("+") !== -1) {
                //存錢
                var money = msg.substring(1);
                wallet.set_Money(user_id, money, 1, event);
            } else if (msg.indexOf("-") !== -1) {
                //扣錢
                var money = msg.substring(1);
                wallet.set_Money(user_id, money, 0, event);
            } else if (msg.indexOf("錢") !== -1) {
                //顯示錢
                wallet.show_Money(user_id, event);
            } else if (msg.indexOf("儲存") !== -1) {
                //儲存
                member.saveMember(user_id, event);
            } else if (msg.indexOf("913") !== -1) {
                //913
                timer = setInterval(getBus(url_913, bus_stop_913), 30000);
                sendMsg(event, '913-->啟動');
                bot.push(user_id, {type: 'sticker', packageId: '1', stickerId: '12'});
            } else if (msg.indexOf("254") !== -1) {
                //254
                timer = setInterval(getBus(url_254, bus_stop_254), 30000);
                sendMsg(event, '254-->啟動');
                bot.push(user_id, {type: 'sticker', packageId: '1', stickerId: '12'});
            } else if (msg.indexOf("公車停") !== -1) {
                //stop
                clearTimeout(timer);
                sendMsg(event, '公車-->停止');
                bot.push(user_id, {type: 'sticker', packageId: '1', stickerId: '1'});
            } else if (msg.indexOf("清除") !== -1) {
                //重新計算
                wallet.reset(user_id, event);
            } else if (msg.indexOf("預報") !== -1) {
                //預報
                clearTimeout(timer2);
                clearTimeout(timer3);
                var weather_sec = 3600 * 1000;
                var news_sec = 7200 * 1000;
                showURL_DATA();
                timer2 = setInterval(getWeather(), weather_sec);
                timer3 = setInterval(getNew(), news_sec);
                sendMsg(event, '預報-->啟動');
            } else if (msg.indexOf("停止") !== -1) {
                //預報
                clearTimeout(timer2);
                clearTimeout(timer3);
                sendMsg(event, '預報停止');
                bot.push(user_id, {type: 'sticker', packageId: '1', stickerId: '1'});
            } else if (msg.indexOf("通知") !== -1) {
                //通知
                sendAll(msg, 2);
            } else {
                var robot_msg = '抱歉，我聽不懂你說什麼：\n';
                fs.readFile('help.txt', function (error, content) { //讀取file.txt檔案的內容
                    if (error) { //如果有錯誤就列印訊息並離開程式
                        console.log('檔案讀取錯誤。');
                    } else {
                        //把檔案的內容輸出
                        //注意content變數的類型不是一個字串（String）
                        //而是一個Buffer物件，所以要用 Buffer.toString() 方法來
                        //把這Buffer物件的內容變成一個字串，以作輸出。
                        //下回教學會解釋Buffer物件是用來幹什麼的                   
                        sendMsg(event, robot_msg + content.toString());
                        bot.push(user_id, {type: 'sticker', packageId: '1', stickerId: '9'}); //9
                    }
                });
            }
        } else if (event.message.type === 'location') {
            sendMsg(event, '幫你查詢附近的YouBike~:D');
            var la = event.message.latitude;
            var lo = event.message.longitude;
            sendYouBike(user_id, la, lo);
            //sendMsg(event, la + ',' + lo);
        }
    } catch (err) {
        console.log(err);
    }
});
        const app = express();
        const linebotParser = bot.parser();
        app.post('/', linebotParser);
//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});
//傳送訊息
function sendMsg(event, msg) {
    event.reply(msg).then(function (data) {
        // success 
        console.log('send_ok');
    }).catch(function (error) {
        // error 
        console.log('error');
    });
}


//傳給大家
function sendAll(msg, count) {
    var connection = mysql.createConnection({
        host: host_ip,
        user: 'root',
        password: 'x22122327',
        database: 'wallet'
    });
    connection.connect();
    var sql = "SELECT uuid FROM member";
    connection.query(sql, function (err, result, fields) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        for (var i = 0; i < result.length; i++) {
            var uuid = result[i].uuid;
            console.log('sending:' + uuid);
            if (count !== 0) {
                bot.push(uuid, {type: 'sticker', packageId: '1', stickerId: count});
            }
        }
        setTimeout(function () {
            console.log('sending:text');
            for (var i = 0; i < result.length; i++) {
                var uuid = result[i].uuid;
                console.log('sending:' + uuid);
                bot.push(uuid, msg);
            }
        }, 1500);
    });
    connection.end();
}

//-------------------------------------------顯示資料 
//天氣
function getWeather() {
    return function () {
        var url2 = "https://works.ioa.tw/weather/api/weathers/4.json";
        request(url2, function (error, response, body) {
            if (!error) {
                var obj = JSON.parse(body);
                var obj = JSON.parse(body);
                var desc = obj.desc;
                var temperature = obj.temperature;
                var felt_air_temp = obj.felt_air_temp;
                var rainfall = obj.rainfall;
                var sunset = obj.sunset;
                var w_msg = desc + '\n溫度:' + temperature + '\n體感:' + felt_air_temp + '\n降雨機率:' + rainfall + '\n日落時間:' + sunset;
                var connection = mysql.createConnection({
                    host: host_ip,
                    user: 'root',
                    password: 'x22122327',
                    database: 'wallet'
                });
                connection.connect();
                var sql = "SELECT uuid FROM member";
                connection.query(sql, function (err, result, fields) {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        return;
                    }
                    for (var i = 0; i < result.length; i++) {
                        var uuid = result[i].uuid;
                        bot.push(uuid, w_msg);
                        console.log('uuid:' + uuid);
                    }
                });
                connection.end();
            } else {
                console.log('weather_error');
            }
        });
        console.log('weather_check');
    };
}

//新聞
function getNew() {
    return function () {
        var url = "http://www.chinatimes.com/hotnews/click";
        request(url, function (error, response, body) {
            if (!error) {
                // 用 cheerio 解析 html 資料
                var $ = cheerio.load(body);
                // 篩選有興趣的資料
                var NowDate = new Date();
                var y = NowDate.getFullYear();
                var mm = NowDate.getMonth() + 1;
                var d = NowDate.getDate();
                var h = NowDate.getHours();
                var m = NowDate.getMinutes();
                var time = y + '年' + mm + '月' + d + '日 ' + h + ':' + m;
                var msg_result = time + '\n';
                var count = 0;
                $('.ga-list ul li h2').each(function (i, elem) {
                    count++;
                    msg_result += count + '. ' + String($(this).text()).trim() + '\n';
                });
                msg_result += url;
                var connection = mysql.createConnection({
                    host: host_ip,
                    user: 'root',
                    password: 'x22122327',
                    database: 'wallet'
                });
                connection.connect();
                var sql = "SELECT uuid FROM member";
                connection.query(sql, function (err, result, fields) {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        return;
                    }
                    for (var i = 0; i < result.length; i++) {
                        var uuid = result[i].uuid;
                        bot.push(uuid, msg_result);
                        console.log('uuid:' + uuid);
                    }
                });
                connection.end();
            } else {
                console.log('news_error');
            }
        });
        console.log('news_check');
    };
}

//公車
function getBus(bus_url, stop_uid) {
    return function () {
        request(bus_url, function (error, response, body) {
            if (!error) {
                var obj = JSON.parse(body);
                for (var i = 0; i < obj.length; i++) {
                    var obj_s = obj[i];
                    if (obj_s.StopUID === stop_uid) {
                        var stop = obj_s.StopName;
                        var time = obj_s.EstimateTime;
                        var min = parseInt(time / 60);
                        var sec = time % 60;
                        var result = min + '分' + sec + '秒';
                        var stop_name = stop.Zh_tw;
                        var msg = result + '將到站\n' + stop_name;
                        var connection = mysql.createConnection({
                            host: host_ip,
                            user: 'root',
                            password: 'x22122327',
                            database: 'wallet'
                        });
                        connection.connect();
                        var sql = "SELECT uuid FROM member where bus = 1";
                        connection.query(sql, function (err, result, fields) {
                            if (err) {
                                console.log('[SELECT ERROR] - ', err.message);
                                return;
                            }
                            for (var i = 0; i < result.length; i++) {
                                var uuid = result[i].uuid;
                                bot.push(uuid, msg);
                                console.log('uuid:' + uuid);
                            }
                        });
                        console.log('bus_check');
                        connection.end();
                    }
                }
            } else {
                console.log('bus_error');
            }
        });
    };
}

//顯示預報資料
function showURL_DATA() {
    sendNews();
    sendWeather();
}

//------------------------------------------送出訊息
//新聞
function sendNews() {
    var url = "http://www.chinatimes.com/hotnews/click";
    request(url, function (error, response, body) {
        if (!error) {
            // 用 cheerio 解析 html 資料
            var $ = cheerio.load(body);
            // 篩選有興趣的資料
            var NowDate = new Date();
            var y = NowDate.getFullYear();
            var mm = NowDate.getMonth() + 1;
            var d = NowDate.getDate();
            var h = NowDate.getHours();
            var m = NowDate.getMinutes();
            var time = y + '年' + mm + '月' + d + '日 ' + h + ':' + m;
            var msg_result = time + '\n';
            var count = 0;
            $('.ga-list ul li h2').each(function (i, elem) {
                count++;
                msg_result += count + '. ' + String($(this).text()).trim() + '\n';
            });
            msg_result += url;
            var connection = mysql.createConnection({
                host: host_ip,
                user: 'root',
                password: 'x22122327',
                database: 'wallet'
            });
            connection.connect();
            var sql = "SELECT uuid FROM member";
            connection.query(sql, function (err, result, fields) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }
                for (var i = 0; i < result.length; i++) {
                    var uuid = result[i].uuid;
                    bot.push(uuid, msg_result);
                    console.log('uuid:' + uuid);
                }
            });
            connection.end();
        } else {
            console.log('news_error');
        }
    });
    console.log('news_check');
}

//氣象
function sendWeather() {
    var url2 = "https://works.ioa.tw/weather/api/weathers/4.json";
    request(url2, function (error, response, body) {
        if (!error) {
            var obj = JSON.parse(body);
            var desc = obj.desc;
            var temperature = obj.temperature;
            var felt_air_temp = obj.felt_air_temp;
            var rainfall = obj.rainfall;
            var sunset = obj.sunset;
            var w_msg = desc + '\n溫度:' + temperature + '\n體感:' + felt_air_temp + '\n降雨機率:' + rainfall + '\n日落時間:' + sunset;
            var connection = mysql.createConnection({
                host: host_ip,
                user: 'root',
                password: 'x22122327',
                database: 'wallet'
            });
            connection.connect();
            var sql = "SELECT uuid FROM member";
            connection.query(sql, function (err, result, fields) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }
                for (var i = 0; i < result.length; i++) {
                    var uuid = result[i].uuid;
                    bot.push(uuid, w_msg);
                    console.log('uuid:' + uuid);
                }
            });
            connection.end();
        } else {
            console.log('weather_error');
        }
    });
    console.log('weather_check');
}

//Youbike
function sendYouBike(uuid, m_la, m_lo) {
    var url2 = "http://data.ntpc.gov.tw/od/data/api/54DDDC93-589C-4858-9C95-18B2046CC1FC;jsessionid=D51FCCA45AEB241C6F902E6E9AB6B219?$format=json";
    request(url2, function (error, response, body) {
        if (!error) {
            var obj = JSON.parse(body);
            var d_array = [];
            for (var i = 0; i < obj.length; i++) {
                var d_lat = obj[i].lat;
                var d_lng = obj[i].lng;
                d_array.push(distance(m_la, m_lo, d_lat, d_lng));
            }

            //比大小
            var result_t = 0;
            var min = 100000;
            for (var i = 0; i < d_array.length; i++) {
                if (d_array[i] < min) {
                    min = d_array[i];
                    result_t = i;
                }
            }

            //result
            var result_bike = obj[result_t];
            var sna_b = result_bike.sna;
            var ar_b = result_bike.ar;
            var lat_b = result_bike.lat;
            var lng_b = result_bike.lng;
            var sbi_b = result_bike.sbi;
            var bemp = result_bike.bemp;
            bot.push(uuid,
                    '幫你查到YouBike資訊如下:\n地區'
                    + sna_b + '\n位置:' + ar_b + '\n剩餘:' + sbi_b + ' 台\n剩餘空位:' + bemp + ' 格\n距離:' + min.toFixed(2) + ' km');
            bot.push(uuid, {type: 'location', title: sna_b, address: ar_b, latitude: lat_b, longitude: lng_b});
        } else {
            console.log('YouBike_error');
        }
    }
    );
    console.log('YouBike_check');
}

//公車
function sendBus(bus_url, stop_uid) {
    request(bus_url, function (error, response, body) {
        if (!error) {
            var obj = JSON.parse(body);
            for (var i = 0; i < obj.length; i++) {
                var obj_s = obj[i];
                if (obj_s.StopUID === stop_uid) {
                    var stop = obj_s.StopName;
                    var time = obj_s.EstimateTime;
                    var min = parseInt(time / 60);
                    var sec = time % 60;
                    var result = min + '分' + sec + '秒';
                    var stop_name = stop.Zh_tw;
                    var msg = result + '將到站\n' + stop_name;
                    var connection = mysql.createConnection({
                        host: host_ip,
                        user: 'root',
                        password: 'x22122327',
                        database: 'wallet'
                    });
                    connection.connect();
                    var sql = "SELECT uuid FROM member where bus = 1";
                    connection.query(sql, function (err, result, fields) {
                        if (err) {
                            console.log('[SELECT ERROR] - ', err.message);
                            return;
                        }
                        for (var i = 0; i < result.length; i++) {
                            var uuid = result[i].uuid;
                            bot.push(uuid, msg);
                            console.log('uuid:' + uuid);
                        }
                    });
                    connection.end();
                    console.log('bus_check');
                }
            }
        } else {
            console.log('bus_error');
        }
    });
}
//------------------------------------------送出訊息

//氣象
timer2 = setInterval(getWeather(), 3600000);
//新聞
timer3 = setInterval(getNew(), 7200000);
console.log('Start: weather');
console.log('Start: news');
//-------------------------------------------排程
//早安
var rule = new schedule.RecurrenceRule();
rule.hour = 8;
rule.minute = 0;
rule.dayOfWeek = [new schedule.Range(1, 5)]; // 每星期日.四~六的下午5點0分
var job = new schedule.scheduleJob(rule, function () {
    // do jobs here 
    timer = setInterval(getBus(url_913, bus_stop_913), 30000);
    var msg = '早安喔~要準備上班了，加油!';
    sendAll(msg, 5);
});
//午安
var rule2 = new schedule.RecurrenceRule();
rule2.hour = 12;
rule2.minute = 0;
rule2.dayOfWeek = [new schedule.Range(1, 5)]; // 每星期日.四~六的下午5點0分
var job2 = new schedule.scheduleJob(rule2, function () {
    // do jobs here 
    var msg = '午安呀!記得吃午餐喔';
    sendAll(msg, 2);
});
//下班
var rule3 = new schedule.RecurrenceRule();
rule3.hour = 18;
rule3.minute = 0;
rule3.dayOfWeek = [new schedule.Range(1, 5)]; // 每星期日.四~六的下午5點0分
var job3 = new schedule.scheduleJob(rule3, function () {
    // do jobs here 
    var msg = '準備下班了~辛苦囉';
    sendAll(msg, 11);
});
//睡覺
var rule4 = new schedule.RecurrenceRule();
rule4.hour = 23;
rule4.minute = 0;
rule4.dayOfWeek = [new schedule.Range(1, 5)]; // 每星期日.四~六的下午5點0分
var job4 = new schedule.scheduleJob(rule4, function () {
    // do jobs here 
    var msg = '準備睡覺囉~晚安';
    sendAll(msg, 1);
});
//星期日
var rule5 = new schedule.RecurrenceRule();
rule5.hour = 23;
rule5.minute = 0;
rule5.dayOfWeek = [0]; // 每星期日.四~六的下午5點0分
var job5 = new schedule.scheduleJob(rule5, function () {
    // do jobs here 
    var msg = '明天要上班了~收心睡覺吧~';
    sendAll(msg, 2);
});
//起床
var rule6 = new schedule.RecurrenceRule();
rule6.hour = 9;
rule6.minute = 0;
rule6.dayOfWeek = [0, 6]; // 每星期日.四~六的下午5點0分
var job6 = new schedule.scheduleJob(rule6, function () {
    // do jobs here 
    var msg = '早安喔~起床啦!';
    sendAll(msg, 2);
});
console.log('Start: schedule');






//-------------------------------function
function distance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km (change this constant to get miles)
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}
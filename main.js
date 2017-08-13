/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var linebot = require('linebot');
var express = require('express');
var my_robot = require('./MyRobot.js'); //爬蟲智慧庫
var wallet = require('./wallet.js'); //錢包

var bot = linebot({
    channelId: '1521465147',
    channelSecret: '476e3f9b35b545260a24665d2de6dc08',
    channelAccessToken: '/cgAZ98zBrTsEPVM+xNxIkW+QvL0Pb3uSObihBdHa1JVUjZZ5JTY0BjwX61pnCHN1nRKM+TTO49zM002X8zQaZcJr0LwsFCwtH+kG9PYVFlpqIFjyGnjNisGMgbHLEqvi401tq3ITxDOa/JdRQcI6AdB04t89/1O/w1cDnyilFU='
});

bot.on('message', function (event) {
    console.log(event); //把收到訊息的 event 印出來看看
    try {
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
                wallet.set_Money(money, 1, event);
            } else if (msg.indexOf("-") !== -1) {
                //扣錢
                var money = msg.substring(1);
                wallet.set_Money(money, 0, event);
            } else if (msg.indexOf("錢") !== -1) {
                //顯示錢
                wallet.show_Money(event);
            } else {
                var robot_msg = '抱歉，我聽不懂你說什麼：\n';
                sendMsg(event, robot_msg + msg);
            }
        }
    } catch (err) {
        sendMsg(event, '錯誤指令:' + err);
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
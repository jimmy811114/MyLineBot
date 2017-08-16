/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var linebot = require('linebot');
var express = require('express');
var fs = require('fs');
var my_robot = require('./MyRobot.js'); //爬蟲智慧庫
var wallet = require('./wallet.js'); //錢包
var member = require('./Member.js'); //會員

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
            var user_id = event.source.userId;
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
                setTimeout(member.sendBus(event), 10000);
                sendMsg(event, '913提醒啟動');
            } else if (msg.indexOf("清除") !== -1) {
                //重新計算
                wallet.reset(user_id, event);
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
                    }
                });

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

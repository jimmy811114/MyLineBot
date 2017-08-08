var linebot = require('linebot');
var express = require('express');
var request = require("request");
var cheerio = require("cheerio");

var bot = linebot({
    channelId: '1521465147',
    channelSecret: '476e3f9b35b545260a24665d2de6dc08',
    channelAccessToken: '/cgAZ98zBrTsEPVM+xNxIkW+QvL0Pb3uSObihBdHa1JVUjZZ5JTY0BjwX61pnCHN1nRKM+TTO49zM002X8zQaZcJr0LwsFCwtH+kG9PYVFlpqIFjyGnjNisGMgbHLEqvi401tq3ITxDOa/JdRQcI6AdB04t89/1O/w1cDnyilFU='
});

bot.on('message', function (event) {
    console.log(event); //把收到訊息的 event 印出來看看
    if (event.message.type === 'text') {
        var msg = event.message.text;

        if (msg.indexOf("天氣") !== -1) {
            send_weather(event);
        }else{
            sendMsg(event, msg);
        }
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

// 台南市的氣溫
var url = "https://www.wunderground.com/cgi-bin/findweather/getForecast?query=pws:ITPEYANJ10";

//傳送天氣資訊
function send_weather(event) {
    var result = "台北天氣:\n";
    request(url, function (error, response, body) {
        if (!error) {

            // 用 cheerio 解析 html 資料
            var $ = cheerio.load(body);

            // 篩選有興趣的資料
            var temperature = $("[data-variable='temperature'] .wx-value").html();
            var humidity = $("[data-variable='humidity'] .wx-value").html();

            // 輸出
            result += "氣溫：攝氏 " + temperature + " 度\n";
            result += "濕度：" + humidity + "%";

            //傳送
            sendMsg(event, result);
        } else {
            console.log('weather_error');
        }
    });
}


// 傳送訊息
function sendMsg(event, msg) {
    event.reply(msg).then(function (data) {
        // success 
        console.log('send_ok');
    }).catch(function (error) {
        // error 
        console.log('error');
    });
}

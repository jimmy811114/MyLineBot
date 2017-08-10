/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

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
        } else if (msg.indexOf("ETH") !== -1||msg.indexOf("以太") !== -1) {
            sendETH(event, msg);
        } else {
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

function sendETH(event) {
    var url = 'https://www.coingecko.com/en/price_charts/ethereum/twd';
    request(url, function (err, res, body) {
        var data = [];
        var $ = cheerio.load(body);
        // 把要到的資料放進 cheerio
        $('.table-responsive .table tbody tr td[style^="text"]').each(function (i, elem) {
            data.push($(this).text().split('\n'));
        });
        // 語法都跟 jquery 一樣
        // 找到 class = "FcstBoxTable01"
        // 再找標籤 <tbody>
        // 取得裡面的每一個 <tr>
        // 取文字部分分行之後放進 weather
        var result = String(data[0]);
        var result_int = result.replace(/,/g, "");
        //console.log(result_int.trim());
        //傳送
        sendMsg(event, '目前ETH價格:\n' + result_int.trim());
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


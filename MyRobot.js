/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var request = require("request");
var cheerio = require("cheerio");
var arduino_ip = '192.168.1.10'; //arduino_ip

//天氣
exports.send_weather = function (event) {
    var url = "https://www.wunderground.com/cgi-bin/findweather/getForecast?query=pws:ITPEYANJ10";
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
};

//ETH
exports.send_ETH = function (event) {
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
};

exports.set_light = function (event, status) {
    var url = arduino_ip + '/digital/13/' + status;
    request(url, function (err, res, body) {
        if (!err && status === 1) {
            sendMsg(event, '已開啟電燈');
        } else {
            sendMsg(event, '已關閉電燈');
        }
    });
};

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

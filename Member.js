/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mysql = require('mysql');

//建立
exports.saveMember = function (userId, event) {
    var connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'x22122327',
        database: 'wallet'
    });
    connection.connect();
    var addSql = 'INSERT INTO member(uuid) VALUES(?)';
    var addSqlParams = [userId];
    //建立
    connection.query(addSql, addSqlParams, function (err, result) {
        if (err) {
            console.log('[INSERT ERROR] - ', err.message);
            return;
        }
        console.log('--------------------------INSERT----------------------------');
        //console.log('INSERT ID:',result.insertId);        
        console.log('INSERT ID:', result);
        console.log('------------------------------------------------------------\n\n');
    });
    connection.end();
    sendMsg(event, userId + '已儲存');
};

//傳送會員訊息（安和路口）
exports.sendBus = function (event) {
    var url = "http://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/NewTaipei/913?$top=100&$format=JSON";
    var connection = mysql.createConnection({
        host: '127.0.0.1',
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
        for (var i = 0; i < result; i++) {
            var uuid = result[i].uuid;
            request(url, function (error, response, body) {
                if (!error) {
                    var obj = JSON.parse(body);
                    for (var i = 0; i < obj.length; i++) {
                        var obj_s = obj[i];
                        if (obj_s.StopUID === 'NWT19549') {
                            var stop = obj_s.StopName;
                            var time = obj_s.EstimateTime;
                            var min = parseInt(time / 60);
                            var sec = time % 60;
                            var result = min + ':' + sec;
                            var stop_name = stop.Zh_tw;
                            sendMsg(event, stop_name + '到站時間：\n' + result);
                        }
                    }
                } else {
                    console.log('weather_error');
                }
            });
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


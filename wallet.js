/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mysql = require('mysql');
var host_ip = "127.0.0.1"; //資料庫IP
var db_config = {
    host: host_ip,
    user: 'root',
    password: 'x22122327',
    database: 'wallet'
};
var connection;

//建立
exports.set_Money = function (userId, money, status, event) {
    connection = mysql.createConnection(db_config);
    connection.connect();
    var addSql = 'INSERT INTO money(money,type,user) VALUES(?,?,?)';
    var addSqlParams = [money, status, userId];
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
    var msg = '存錢';
    if (status === 0) {
        msg = '花錢';
    }
    sendMsg(event, msg + ':' + money);
};

//重新計算
exports.reset = function (user_id, event) {
    connection = mysql.createConnection(db_config);
    connection.connect();
    var addSql = "delete from money where user = '" + user_id + "'";
    //建立
    connection.query(addSql, function (err, result) {
        if (err) {
            console.log('[INSERT ERROR] - ', err.message);
            return;
        }

    });
    connection.end();
    sendMsg(event, '重新計算');
};

//顯示金額
exports.show_Money = function (user_id, event) {
    connection = mysql.createConnection(db_config);
    connection.connect();
    var sql = "SELECT sum(money) as total FROM money where type = 1 and user = '" + user_id + "'";
    var sql0 = "SELECT sum(money) as total FROM money where type = 0 and user = '" + user_id + "'";
    var mon_1;
    var mon_0;
    connection.query(sql, function (err, result, fields) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }

        console.log('--------------------------SELECT----------------------------');
        console.log(result);
        console.log('------------------------------------------------------------\n\n');
        mon_1 = result[0].total;
    });
    connection.query(sql0, function (err, result, fields) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }

        console.log('--------------------------SELECT----------------------------');
        console.log(result);
        console.log('------------------------------------------------------------\n\n');
        mon_0 = result[0].total;
        var t_mon = mon_1 - mon_0;
        var msg = '[我的錢包]\n\n存:' + mon_1 + '\n' + '花:' + mon_0 + '\n---------\n餘額:' + t_mon;
        sendMsg(event, msg);
    });
    connection.end();

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

connection.on('error', function (err) {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
        console.log('SQL error');                                 // server variable configures this)
    }
});

function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
    // the old one cannot be reused.
    connection.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            console.log('SQL error');                                               // server variable configures this)
        }
    });
}
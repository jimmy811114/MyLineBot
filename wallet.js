/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mysql = require('mysql');

//建立
exports.set_Money = function (money, status, event) {
    var connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'x22122327',
        database: 'wallet'
    });
    connection.connect();
    var addSql = 'INSERT INTO money(money,type) VALUES(?,?)';
    var addSqlParams = [money, status];
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
exports.set_Money = function (money, status, event) {
    var connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'x22122327',
        database: 'wallet'
    });
    connection.connect();
    var addSql = 'drop table money';
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
exports.show_Money = function (event) {
    var connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'x22122327',
        database: 'wallet'
    });
    connection.connect();
    var sql = 'SELECT sum(money) as total FROM money where type = 1';
    var sql0 = 'SELECT sum(money) as total FROM money where type = 0';
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
        var t_mon = mon_1 + mon_0;
        var msg = '總共存:' + mon_1 + '\n' + '總共花:' + mon_0 + '\n餘額:' + t_mon;
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

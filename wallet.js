/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'jimmyyang.ddns.net',
    user: 'root',
    password: 'x22122327',
    database: 'wallet'
});

connection.connect();

//建立
exports.set_Money = function (money, status, event) {
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
    
    var msg = '存錢';
    if (status === 0) {
        msg = '花錢';
    }
    sendMsg(event, msg + ':' + money);
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




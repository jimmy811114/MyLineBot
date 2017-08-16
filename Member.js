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


var mysql      = require('mysql');
var conn = mysql.createConnection({

    host    :'localhost',

    port : 3306,

    user : 'root',

    password : 'dlghks12',

    database:'o2'

});


conn.connect();


/* 데이터베이스 다 보여주기
conn.query('SELECT * from topic', function(err, rows, fields){ // rows: 행, fields: 열. query 함수의 첫번째 인자를 통해 mysql에서 파일을 긁어온 뒤 이 데이터들을 콜백 함수의 인자들로 저장해둔다
  if (err){
    console.log(err);
  } else {
    for (var i=0; i<rows.length; i++){
        console.log(rows[i].title);
    }
  }
});*/

// 데이터베이스에 insert 하기
/*
sql = 'INSERT INTO topic (title, description, author) VALUES(?, ?, ?)' // ? : 치환자
var params=["supervisor", "watcher", "graphittie"]; // 치환자에 들어갈 값들을 저장하는 parameter.
conn.query(sql, params, function(err, rows,fields){ //query 메소드의 두번째 인자로서 params를 대입하니까 sql문 안에 params를 대입해준다
    if(err){
      console.log(err);
    } else {
      console.log(rows);
    }
});
*/

/* rows의 콘솔 값 해석.
OkPacket {
  fieldCount: 0,
  affectedRows: 1 // 영향을 준 rows의 수가 1,
  insertId: 4, // 삽입한 값의 id가 4
  serverStatus: 2,
  warningCount: 0,
  message: '',
  protocol41: true,
  changedRows: 0 }
  */

// 데이터베이스 update, delete하기
  sql = 'UPDATE topic SET title=?, description=?, author=? WHERE id=?';  // ? : 치환자
  var params=["new supervisor", "new watcher", "new graphittie", 4]; // 치환자에 들어갈 값들을 저장하는 parameter.
  conn.query(sql, params, function(err, rows,fields){ //query 메소드의 두번째 인자로서 params를 대입하니까 sql문 안에 params를 대입해준다
      if(err){
        console.log(err);
      } else {
        console.log(rows);
      }
  });
conn.end();

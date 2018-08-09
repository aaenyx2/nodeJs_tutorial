var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs'); // 파일 전송 기능의 기본 모듈
var mysql      = require('mysql');
var conn = mysql.createConnection({
    host    :'localhost',
    port : 3306,
    user : 'root',
    password : 'dlghks12',
    database:'o2'
});
conn.connect();
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.locals.pretty = true;
app.set('views', './views_mysql');
app.set('view engine', 'jade')
app.use(express.static('public'));

app.get('/add', function(req, res){
    const sql = "SELECT id, title FROM topic";
    conn.query(sql, function(err, rows, fields){
      if(err) console.log('no');
      res.render('add', {data: rows});
   });
});

app.post('/add', function(req, res){
  var title = req.body.title;
  var desc = req.body.description;
  var author = req.body.author;
  var sql = 'INSERT INTO topic (title, description, author) VALUES(?, ?, ?)';
  conn.query(sql, [title, desc, author], function(err, results, fields){
    if(err){
      console.log(err);
    }else{
      res.redirect('/'+results.insertId);
    }
  });
});

app.get('/:id/edit', function(req, res){
    var sql ="SELECT id, title FROM topic";
    conn.query(sql, function(err,topics, fields){
      var id = req.params.id;
      if(id){
      var sql = "SELECT * FROM topic WHERE id=?";
      conn.query(sql, [id], function(err, topic, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('edit', {topics: topics, topic:topic[0]});
        }
      });
    } else{
        console.log('There is no id');
        res.status(500).send('Internal server error');
      };
    });
});

app.post('/:id/edit', function(req, res){
  var id = req.params.id;
  var updated_title=req.body.updated_title;
  var updated_author=req.body.updated_author;
  var updated_desc=req.body.updated_desc;
  var sql ='UPDATE topic SET title=?, author=?, description=? WHERE id=?'
  conn.query(sql, [updated_title, updated_author, updated_desc, id], function(err, results, fields){
    if(err){
      console.log(err);
    }else{
      res.redirect('/'+id);
    }
  });
});

app.get('/:id/delete', function(req, res){
  var sql="SELECT id, title FROM topic";
  var id=req.params.id;
  conn.query(sql, function(err, topics, fields){
    var sql ='SELECT * FROM topic WHERE id=?'
    conn.query(sql, [id], function(err, topic, fields){
      if(err){
        console.log(err);
      }else{
        res.render('delete', {topic:topic[0], topics: topics});
        //res.render('delete', {topics: topics, topic: topic});
      }
    });
  });
});

app.post('/:id/delete', function(req, res){
  var id = req.params.id;
  var sql ='DELETE FROM topic WHERE id=?'
  conn.query(sql, [id], function(err, results, fields){
    if(err){
      console.log(err);
    }else{
      res.redirect('/');
    }
  });
});

app.get(['/', '/:id'], function(req, res){
  const sql = "SELECT id, title FROM topic";
  conn.query(sql, function(err, rows, fields){
    if(err){
      console.log(err);
    }else{
        var id = req.params.id;
        if(id){
          var sql="SELECT * FROM topic WHERE id=?"
          conn.query(sql, [id], function(err_, rows_,fields_){
            if(err_){
              console.log(err);
            }else{
            res.render('view', {data: rows, topic: rows_[0]})
            }
          });
        }
        else{
          res.render('view', {data: rows});
        }
      }
    });
  });



app.post('/', function(req, res){
  var title = req.body.title;
  var content = req.body.content;
  fs.writeFile('data/'+title,content,function(err){
    if(err){
      console.log(err);
      res.status(500).send('Internel Server Error'); // res.stauts(500) : 서버 상에서 오류가 있을 때
    }
    else{
      res.redirect('/'+title);//response 객체의 또다른 메소드. 사용자가 작성한 다른 패스로 보낼 수 있다
    }
  });

});





/*
app.get('/:id', function(req, res){
  var id = req.params.id; // '/' 뒤에 있는 parameter는 paramter로 받고, '?' 뒤에 있는 parameter는 'query'로 받는다.
  fs.readdir('data', function(err, files){
    if(err){
      console.log(err);
      res.status(500).send('Internel Server Error'); // res.stauts(500) : 서버 상에서 오류가 있을 때
    }
    fs.readFile('data/'+id, 'utf8', function(err, data){
      if(err){
        console.log(err);
        res.status(500).send('Internel Server Error');
      }
      res.render('view', {topics: files, title:id, content:data});
    })
  })
});
*/



app.listen(3000, function(){
		console.log("Connected 3000 port!");
});

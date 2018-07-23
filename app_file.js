var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs'); // 파일 전송 기능의 기본 모듈
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.locals.pretty = true;
app.set('views', './views_file');
app.set('view engine', 'jade')
app.use(express.static('public'));


app.get('/write', function(req, res){
  fs.readdir('data', function(err, files){
    if(err){
      console.log(err);
      res.status(500).send('Internel Server Error'); // res.stauts(500) : 서버 상에서 오류가 있을 때
    }
    res.render('new', {topics:files});
  });
});

app.get(['/', '/:id'], function(req, res){
  fs.readdir('data', function(err, files){
    if(err){
      console.log(err);
      res.status(500).send('Internel Server Error'); // res.stauts(500) : 서버 상에서 오류가 있을 때
    }
    var id = req.params.id;
    if(id){
      //id 값이 있을 때
      fs.readFile('data/'+id, 'utf8', function(err, data){
        if(err){
          console.log(err);
          res.status(500).send('Internel Server Error');
        }
        res.render('view', {topics: files, title:id, content:data});
      })
    }
    else{
    //id 값이 없을  때
      res.render('view', {topics:files, title: "Hello", content:"There's no content. Click the title."});
    }
  })
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


app.listen(3000, function(){
		console.log("Connected 3000 port!");
});

var express = require('express');
var app = express();
app.locals.pretty = true;
app.set('views', './views');
app.set('view engine', 'jade')
app.use(express.static('public'));
app.get('/topic', function(req, res){
  var topics = [
    'Javascript is...',
    'Nodejs is ...',
    'Express is ...'
  ];
  var output = `
  <a href="/topic?id=0">Javascript</a><br>
  <a href="/topic?id=1">Nodejs</a><br>
  <a href="/topic?id=2">Express</a><br><br>
  ${topics[req.query.id]}
  `
  res.send(output);
})

app.get('/', function(req, res){
  res.send('Hello home page');
});

app.get('/view', function(req, res){
  res.render('view', {time:Date(), title: 'Jade'});
});

app.get('/login', function(req, res){
  res.send('Login please');
});

app.get('/jjal', function(req, res){
  res.send('Hello Router, <img src="/image.jpeg">');
});

app.get('/dynamic', function(req, res){
  var time =Date();
  var lis='';
  for(var i=0; i<5; i++){
    lis=lis+'<li>coding</li>';
  }
  var output = `
  <!DOCTYPE html>
  <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <title></title>
    </head>
    <body>
      Hello dynamic!
      <ul>
      ${lis}
      </ul>
      ${time}
    </body>
  </html>
` // html 파일을 controller에서 등록할 때는
//html 파일의 내용을 `` 따옴표로 묶어서 긁어오면 된다
// ${변수명}이라는 표기를 이용하면 `` 따옴표 안에서도 변수를 호출할 수 있다.
  res.send(output);
});


app.listen(3000, function(){
		console.log("Connected 3000 port!");
});

var express = require('express');
var app = express();
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended: false}))
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat', // 암호화를 위한 키 값
  resave: false,
  saveUninitialized: true,
  store: new FileStore() // 세션의 저장소 위치를 설정. 이를 설정하면 sessions라는 디렉토리가 생성되어 여기에 session이 저장됨.
  //cookie: { secure: true } // session.count에 대한 접근을 막는 역할
}))
app.get('/', function(req,res){
	if(req.session.count){
		req.session.count++;
	} else {
		req.session.count = 1;
	}
	res.send('count: '+req.session.count)
})

app.post('/auth/login', function(req,res){
  var db = {username: 'egoing', password:'111', nickname: '인이'}
  var uname=req.body.username;
  var pwd=req.body.password;

  if(uname===db.username && pwd === db.password){
    req.session.nickname=db.nickname;
    res.redirect('/welcome');
  } else {
    res.send('Who are you? <a href="/auth/login">login</a>');
  }
})

app.get('/welcome', function(req, res){
  if(req.session.nickname){ //로그인이 되어있는지 안 되어있는지에 따라 메인 화면을 다르게 주기
    res.send(`
      <h1> Hello, ${req.session.nickname}</h1>
      <a href="/auth/logout">Logout</a>`)
  } else {
  res.send(`
    <h1>Welcome</h1>
    <a href="/auth/login">Login</a>`)
  }
})

app.get('/auth/login', function(req,res){
  var output = `
      <h1> Login </h1>
      <form action="/auth/login" method="post">
        <p>
          <input type="text" name="username" placeholder="username">
        </p>
        <p>
          <input type="password" name="password" placeholder="password">
        </p>
        <p>
          <input type="submit" value="enter">
        </p>
      </form>
    `;
  res.send(output);
});

app.get('/auth/logout', function(req,res){
  req.session.nickname=null;
  res.redirect('/welcome');
})
app.listen(3000, function(){
		console.log("Connected 3000 port!");
});

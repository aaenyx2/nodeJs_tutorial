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

var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var assert = require("assert");
var opts = {
  password: "helloworld"
};

var users = [
  {username: 'egoing',
  salt: 'fPdyR3NpatifeQlNTEopb2wiiHGhqZwFX9AepU9+1dvAPTs83rggEBkbJ5YOTGN3ao+mFMuAMOzcBO5A0b6p7w==',
  password:'ZgajV7j8uwABLYQEGC0+QV57xn0xxD70NZytoMi9e+/E0KuLoCeLBfrv2hBYErw/EicngBnjIeRNcIHlM204V0I3AePoWk42EWurR49puuOMU2OzpXAVqpD7iirAoyRUIFM2cMrcbyI9PdCAjZpzecrbNgvPGr5Szx3RoxBW+R4=',//원 비밀번호 : 111111
  nickname: '인이'}
];

// app.get('/', function(req,res){
// 	if(req.session.count){
// 		req.session.count++;
// 	} else {
// 		req.session.count = 1;
// 	}
// 	res.send('count: '+req.session.count)
// })

app.post('/', function(req,res){
  var uname=req.body.username;
  var pwd=req.body.password;
  for(var i=0; i<users.length; i++){
    var user=users[i];
    if(uname===user.username){
      //hasher함수만 실행되고 callback함수인 익명함수 fucntion이 마저 실행되지 않은 상태에 다음 코드가 실행되지 않도록 return을 이용한다
      return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
        if(hash===user.password){
          req.session.nickname=user.nickname;
          req.session.save(function(){
            res.redirect('/welcome'); // 세션 업데이트 정보가 성공적으로 저장된 이후에 콜백함수를 통해 리디렉션
          })
        } else {
          res.send('Who are you? <a href="/">login</a>');
        }
      });
    }
  }
  res.send('Who are you? <a href="/">login</a>');
     //아이디가 틀렸을 때  
})

app.post('/auth/register', function(req,res){
  hasher({password:req.body.password}, function(err,pass,salt,hash){
    var user = {
      username:req.body.username,
      password:hash,
      salt:salt,
      nickname:req.body.nickname};
    users.push(user);
    console.log(user);
    req.session.nickname=req.body.nickname;
    req.session.save(function(){
      res.redirect('/welcome');
    });
  });
});

app.get('/welcome', function(req, res){
  if(req.session.nickname){ //로그인이 되어있는지 안 되어있는지에 따라 메인 화면을 다르게 주기
    res.send(`
      <h1> Hello, ${req.session.nickname}</h1>
      <a href="/auth/logout">Logout</a>`)
  } else {
  res.send(`
    <h1>Welcome</h1>
    <a href="/">Login</a>
    <a href="/auth/register">Register</a>`)
  }
})

app.get('/auth/register', function(req,res){
  var output = `
      <h1> register </h1>
      <form action="/auth/register" method="post">
        <p>
          <input type="text" name="username" placeholder="username">
        <p>
          <input type="text" name="nickname" placeholder="nickname">
        </p>
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
})

app.get('/', function(req,res){
  var output = `
      <h1> Login </h1>
      <form action="/" method="post">
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
  req.session.save(function(){
    res.redirect('/welcome'); // 세션 업데이트 정보가 성공적으로 저장된 이후에 콜백함수를 통해 리디렉션
  })
})
app.listen(3000, function(){
		console.log("Connected 3000 port!");
});

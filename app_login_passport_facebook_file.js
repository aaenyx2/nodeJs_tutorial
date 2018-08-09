var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser=require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var assert = require("assert");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var app = express();
var flash = require('connect-flash');
//미들웨어
app.use(session({
  secret: 'keyboard cat', // 암호화를 위한 키 값
  resave: false,
  saveUninitialized: true,
  //store: new FileStore() // 세션의 저장소 위치를 설정. 이를 설정하면 sessions라는 디렉토리가 생성되어 여기에 session이 저장됨.
  //cookie: { secure: true } // session.count에 대한 접근을 막는 역할
}))
app.use(passport.initialize());
app.use(passport.session()); // session을 사용하기 위한 코드 뒷쪽에 위치해야됨
app.use(bodyParser.urlencoded({extended: false}))
app.use(flash());




var users = [
  {
    authId: 'local:egoing',
    username: 'egoing',
  salt: 'fPdyR3NpatifeQlNTEopb2wiiHGhqZwFX9AepU9+1dvAPTs83rggEBkbJ5YOTGN3ao+mFMuAMOzcBO5A0b6p7w==',
  password:'ZgajV7j8uwABLYQEGC0+QV57xn0xxD70NZytoMi9e+/E0KuLoCeLBfrv2hBYErw/EicngBnjIeRNcIHlM204V0I3AePoWk42EWurR49puuOMU2OzpXAVqpD7iirAoyRUIFM2cMrcbyI9PdCAjZpzecrbNgvPGr5Szx3RoxBW+R4=',//원 비밀번호 : 111111
  nickname: '인이'}
];

app.get('/', function(req,res){
	if(req.session.count){
		req.session.count++;
	} else {
		req.session.count = 1;
	}
	res.send('count: '+req.session.count)
})

//serialize하는 코드.
passport.serializeUser(function(user, done) { //(done(null, user)가 실행되면(로그인에 성공하면)
  //그 user 값을 이 serializeUser의 인자로 받아 콜백함수가 실행되게 되어있음.
  console.log('serializeUser', user);
  done(null, user.authId); //user의 식별자(보통 id)를 deserializeUser의 두번째 인자로 전달.
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  //serializeUser에 있는 done 함수의 두번째 인자(여기선 user.username)가 이 함수의 callback함수의 'id' 값으로써 전달됨.
  //serializeUser에 의해 유저의 username 값이 세션에 이미 저장되어있을 땐 이 함수가 실행됨
  for(var i=0; i<users.length; i++){
    var user=users[i];
    if(user.authId===id){
      return done(null,user);//데이터베이스에서 해당 id를 가진 user를 찾아낸  req.user 값에 담아준다.
    }
    //if 문에 걸려서 함수가 종료되지 않더라도 deserializeUser 메소드가 종료될 수 있도록 조치를 취해준다.
  }
  // 아래 코드는 몽고db 기준이므로 삭제
  // User.findById(id, function(err, user) {
  //   done(err, user);
  // });
  done("There is no user"); // 에러메시지를 출력.
});
//

passport.use(new LocalStrategy( //LocalStrategy라 하는 객체를 생성
  function(username, password, done) {
    var uname=username;  //req.body.username;을 사용하지 않고 인수 username을 사용
    var pwd=password;//req.body.password;
    for(var i=0; i<users.length; i++){
      var user=users[i];
      if(uname===user.username){
        //hasher함수만 실행되고 callback함수인 익명함수 fucntion이 마저 실행되지 않은 상태에 다음 코드가 실행되지 않도록 return을 이용한다
        return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
          if(hash===user.password){
            console.log('LocalStrategy', user);
            // req.session.nickname=user.nickname;
            // req.session.save(function(){
            //   res.redirect('/welcome'); // 세션 업데이트 정보가 성공적으로 저장된 이후에 콜백함수를 통해 리디렉션
            // })
            done(null, user); // 상기 세줄의 코드는 이 한 줄로 대체된다. 인자로서는 로그인한 사용자의 정보가 들어가있는 'user'를 준다.
          } else {
            //res.send('Who are you? <a href="/auth/login">login</a>');
            done(null, false) //상기한 1줄을 대체하는 라인. message는 실패 시 뜨는 라인.
          }
        });
      }
    }
    //res.send('Who are you? <a href="/auth/login">login</a>');
       //아이디가 틀렸을 때
     done(null, false) // 일치하는 아이디가 users 객체 안에 없을 때.
  }
));

passport.use(new FacebookStrategy({
    clientID: '258883774894934',
    clientSecret: '6b22c66d42f91db46a5f6f711c7e4d61',
    callbackURL: "/auth/facebook/callback", //"http://www.example.com/auth/facebook/callback"
    profileFields:['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
    // 프로필로서 어떤 값을 받아올 것인지에 대한 명시적 표시가 필요하다.
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var authId = 'facebook:'+profile.id; // profile.id는 페이스북 상에서 해당 계정의 id.
    //따라서 우리 웹앱의 id로 만들 땐 'facebook:'이라는 문자열을 id에 추가해주었다.
    for(i=0; i<users.length; i++){
      var user=users[i];
      if(user.authId===authId){ // 등록된 사용자
        return done(null, user); //passport.use에서 done(null, user)가 실행되면 이 user가 serializeUser의 인자로 이동하고 serializeUser가 실행됨.
        //만약 user.authId===authId이면 함수를 여기서 끝내버리면 되니까 return.
      }
    }
    var newuser={ // 입력된 정보를
      'authId':authId,
      'nickname':profile.displayName,c
    };
    users.push(newuser);
    done(null, newuser);
//profile 정보:

    // User.findOrCreate(..., function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
  }
));
// passport 라우터 설정
app.post('/auth/login',
  passport.authenticate('local', /*local로 로그인할지, 다른 대기업 어플리케이션 아이디로 로그인할지를 여기서 설정한다. */
  //위 라인에 의해서 'local' strategy가 실행될  LocalStrategy에 등록되어있는 callback함수가 호출(윗 문단)
  { successRedirect: '/welcome', // 로그인 성공 시 이동하는 라우트
    failureRedirect: '/auth/login', // 로그인 실패 시 이동하는 라우트
    failureFlash: false }) // 사용자를 로그인 페이지로 이동시킬 때, '인증에 실패했습니다'라는 정보를 주고 싶으면 사용하는 기능
);

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: 'email' })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/welcome',
                                      failureRedirect: '/auth/login' }));
// app.post('/auth/login', function(req,res){
//   var uname=req.body.username;
//   var pwd=req.body.password;
//   for(var i=0; i<users.length; i++){
//     var user=users[i];
//     if(uname===user.username){
//       //hasher함수만 실행되고 callback함수인 익명함수 fucntion이 마저 실행되지 않은 상태에 다음 코드가 실행되지 않도록 return을 이용한다
//       return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
//         if(hash===user.password){
//           req.session.nickname=user.nickname;
//           req.session.save(function(){
//             res.redirect('/welcome'); // 세션 업데이트 정보가 성공적으로 저장된 이후에 콜백함수를 통해 리디렉션
//           })
//         } else {
//           res.send('Who are you? <a href="/auth/login">login</a>');
//         }
//       });
//     }
//   }
//   res.send('Who are you? <a href="/auth/login">login</a>');
//      //아이디가 틀렸을 때
// })

app.post('/auth/register', function(req,res){
  hasher({password:req.body.password}, function(err,pass,salt,hash){
    var user = {
      authId:'local:'+req.body.username,
      username:req.body.username,
      password:hash,
      salt:salt,
      nickname:req.body.nickname};
    users.push(user);
    console.log(user);
    //passport 모듈에 의해 생성된 req.login 메소드를 이용해, 회원가입을 완료한 후 자동으로 로그인시키는 코드
    req.login(user, function(err){
      req.session.save(function(){
        res.redirect('/welcome');
      })
    //세션에 직접 접근해서 회원가입을 마치면 자동으로 로그인시키던 기존의 코드
    // req.session.nickname=req.body.nickname;
    // req.session.save(function(){
    //   res.redirect('/welcome');
   });
  });
});

app.get('/welcome', function(req, res){
  // session을 직접 제어하던 기존의 방식
  // if(req.session.nickname){ //로그인이 되어있는지 안 되어있는지에 따라 메인 화면을 다르게 주기

  //passport 모듈을 이용해 저장된 세션 값을 req.user 값을 통해 제어하는 방식
  if(req.user && req.user.nickname){
    console.log('hi')
    res.send(`
      <h1> Hello, ${req.user.nickname}</h1>
      <a href="/auth/logout">Logout</a>`)
  } else {
  res.send(`
    <h1>Welcome. net yet loginned </h1>
    <a href="/auth/login">Login</a>
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
      <a href="/auth/facebook">facebook login</a>
    `;
  res.send(output);
});

app.get('/auth/logout', function(req,res){
  //req.session에 직접 접근해 세션을 제어해 로그아웃하던 기존의 방식
  // req.session.nickname=null;
  // req.session.save(function(){
  //   res.redirect('/welcome'); // 세션 업데이트 정보가 성공적으로 저장된 이후에 콜백함수를 통해 리디렉션
  // })
  //passport 모듈을 통해 만들어진 req.logout(); 함수를 이용.
  req.logout()
  req.session.save(function(){
    res.redirect('/welcome');
  });
})

app.listen(3000, function(){
		console.log("Connected 3000 port!");
});

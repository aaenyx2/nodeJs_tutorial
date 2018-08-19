var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
//var FileStore = require('session-file-store')(session);
var mysql = require('mysql');
var bodyParser=require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var assert = require("assert");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var flash = require('connect-flash');
var options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '**',
    database: 'o2'
};
var conn = mysql.createConnection(options); // or mysql.createPool(options);
conn.connect();
var app = express();
//미들웨어
app.use(session({
  secret: 'keyboard cat', // 암호화를 위한 키 값
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({
      host    :'localhost',
      port : 3306,
      user : 'root',
      password : '**',
      database:'o2'
  }) // 세션의 저장소 위치를 설정. 이를 설정하면 sessions라는 디렉토리가 생성되어 여기에 session이 저장됨.
  //cookie: { secure: true } // session.count에 대한 접근을 막는 역할
}))
app.use(passport.initialize());
app.use(passport.session()); // session을 사용하기 위한 코드 뒷쪽에 위치해야됨
app.use(bodyParser.urlencoded({extended: false}))
app.use(flash());




// var users = [
//   {
//     authId: 'local:egoing',
//     username: 'egoing',
//   salt: 'fPdyR3NpatifeQlNTEopb2wiiHGhqZwFX9AepU9+1dvAPTs83rggEBkbJ5YOTGN3ao+mFMuAMOzcBO5A0b6p7w==',
//   password:'ZgajV7j8uwABLYQEGC0+QV57xn0xxD70NZytoMi9e+/E0KuLoCeLBfrv2hBYErw/EicngBnjIeRNcIHlM204V0I3AePoWk42EWurR49puuOMU2OzpXAVqpD7iirAoyRUIFM2cMrcbyI9PdCAjZpzecrbNgvPGr5Szx3RoxBW+R4=',//원 비밀번호 : 111111
//   nickname: '인이'}
// ];

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
  var sql = 'SELECT * FROM users WHERE authId=?';
  conn.query(sql, [id], function(err, results){
    //console.log(sql, err, results);
    if(err){
      done('There is no user')
    } else {
      console.log(results[0]);
      done(null, results[0]);
    }
  });
  //   if(err){
  //     return done('there is no user');
  //   }
  //   var user=results[0];
  //   if('local:'+uname===user.authId){
  //       //hasher함수만 실행되고 callback함수인 익명함수 fucntion이 마저 실행되지 않은 상태에 다음 코드가 실행되지 않도록 return을 이용한다
  //       return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
  //         if(hash===user.password){
  //           console.log('LocalStrategy', user);
  //           done(null, user); // 상기 세줄의 코드는 이 한 줄로 대체된다. 인자로서는 로그인한 사용자의 정보가 들어가있는 'user'를 준다.
  //         } else {
  //           done(null, false) //상기한 1줄을 대체하는 라인. message는 실패 시 뜨는 라인.
  //         }
  //       });
  //
  //     return done(null, false); // 일치하는 아이디가 users 객체 안에 없을 때.
  //   }
  // })
  // done("There is no user"); // 에러메시지를 출력.
});
//

passport.use(new LocalStrategy( //LocalStrategy라 하는 객체를 생성
  function(username, password, done) {
    var uname=username;  //req.body.username;을 사용하지 않고 인수 username을 사용
    var pwd=password;//req.body.password;
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, ['local:'+uname], function(err, results, fields){
      if(err){
        done('there is no user');
      }
      var user=results[0];
      return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
        if(hash===user.password){
          console.log('LocalStrategy', user);
          done(null, user); // 상기 세줄의 코드는 이 한 줄로 대체된다. 인자로서는 로그인한 사용자의 정보가 들어가있는 'user'를 준다.
        } else {
          done(null, false) //상기한 1줄을 대체하는 라인. message는 실패 시 뜨는 라인.
        }
      });
    });
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
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, ['facebook:'+profile.id], function(err, results, fields){
      if(results.length>0){
        done(null, user); // 상기 세줄의 코드는 이 한 줄로 대체된다. 인자로서는 로그인한 사용자의 정보가 들어가있는 'user'를 준다.
      } else{ // 해당 아이디로 회원가입이 되어있지 않은 경우
        var newuser={
          'authId':'facebook:'+profile.id,
          'displayName':profile.displayName,
          'username':profile.name,
          'email':profile.emails[0].value
        };
        var sql2 = 'INSERT INTO users set ?';
        conn.query(sql2, [newuser], function(err, results, fields){
          if(err){
            console.log(err);
            done('Error');
          } else{
            done(null, newuser) //상기한 1줄을 대체하는 라인. message는 실패 시 뜨는 라인.
          }
        })
      }
    });
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
      displayName:req.body.nickname};
    var sql = 'INSERT INTO users SET ?'; // SET ? 이라고 하면 users 테이블에 user 객체를 바로 넣을 수 있다.
    conn.query(sql, user, function(err, results, fields){
    // var sql = 'INSERT INTO users (authId, username, password, salt, displayName) VALUES(?, ?, ?, ?, ?)';
    // conn.query(sql, [user.authId, user.username, user.password, user.salt, user.nickname], function(err, results, fields){
      if(err){
        console.log(err);
        res.status(500);
      }else{
        req.login(user, function(err){
          req.session.save(function(){
            res.redirect('/welcome');
          })
        })
      }
    });

    // users.push(user);
    // console.log(user);
    //passport 모듈에 의해 생성된 req.login 메소드를 이용해, 회원가입을 완료한 후 자동으로 로그인시키는 코드
   //  req.login(user, function(err){
   //    req.session.save(function(){
   //      res.redirect('/welcome');
   //    })
   //  //세션에 직접 접근해서 회원가입을 마치면 자동으로 로그인시키던 기존의 코드
   //  // req.session.nickname=req.body.nickname;
   //  // req.session.save(function(){
   //  //   res.redirect('/welcome');
   // });
  });
});

app.get('/welcome', function(req, res){
  // session을 직접 제어하던 기존의 방식
  // if(req.session.nickname){ //로그인이 되어있는지 안 되어있는지에 따라 메인 화면을 다르게 주기

  //passport 모듈을 이용해 저장된 세션 값을 req.user 값을 통해 제어하는 방식
  if(req.user && req.user.displayName){
    console.log('hi')
    res.send(`
      <h1> Hello, ${req.user.displayName}</h1>
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

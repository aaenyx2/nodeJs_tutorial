## 파일 실행

node '파일명'

1. app_cart
쿠키 기능을 이용해 장바구니(브라우저 종료 시 장바구니에 담긴 아이템이 초기화) 구현

2. app_file
작성한 글을 파일에 저장하고 파일에 저장된 내용들을 view에 출력하는 기능 구현

3. app_login_file_pbkdf2

pbkdf2 보안을 이용해, 등록해둔 아이디와 비밀번호를 입력했을 때 로그인이 되는 기능 구현
(아이디: egoing, 비밀번호: 111111)

4. app_login_passport_facebook_mysql

mysql 연동 회원가입 및 로그인, passport-facebook api를 이용한 로그인 기능 구현 

** 보안 상 mysql 비밀번호 란과 facebook 연동 비밀번호 란을 비워둠



## passport 연동 인증

###1.	Passportjs.org에 접속해서 documentation-configure(환경 설정)을 참고
###2.	Passport, passport-local(로컬 정보를 이용한 인증), connect-flash 모듈을 설치.
###3.	var passport = require('passport');
            var LocalStrategy = require('passport-local').Strategy
            var flash = require('connect-flash');;
### 4.	미들웨어
### 5.	app.use(passport.initialize());
            app.use(passport.session());
            app.use(flash());
### 6.	라우터 설정
### 7.	app.post('/login',
            passport.authenticate('local', { successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true })
            );
### 8.  strategies 란에 있는 아랫부분 코드를 긁어넣는다 or 필요에 맞게 잘 조정한다.
            passport.use(new LocalStrategy(
            function(username, password, done) {
                User.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (!user.validPassword(password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
                });
                }
            ));

### 8. serialize하는 코드.
                passport.serializeUser(function(user, done) { //(done(null, user)가 실행되면(로그인에 성공하면)
                //그 user 값을 이 serializeUser의 인자로 받아 콜백함수가 실행되게 되어있음.
                console.log('serializeUser', user);
                done(null, user.username); //user의 식별자(id일수도 있고 username일수도 있고)를 done의 두번째 인자로 전달.
                //done 함수에 의해 user.username 값으로 session에 저장됨.
                });

                passport.deserializeUser(function(id, done) {
                console.log('deserializeUser', id);
                //serializeUser에 있는 done 함수의 두번째 인자(여기선 user.username)가 이 함수의 callback함수의 첫번째 인자 'id' 값으로써 전달됨.
                //serializeUser에 의해 유저의 username 값이 세션에 이미 저장되어있을 땐 이 함수가 실행됨

                for(var i=0; i<users.length; i++){
                    var user=users[i];
                    if(user.username===id){
                    done(null,user);
                    }
                }

                // 아래 코드는 몽고db 기준이므로 삭제
                // User.findById(id, function(err, user) {
                //   done(err, user);
                // });
                });
                //

### 9. 더이상 session을 직접 제어하지 않고 deserializeUser 함수에 의해 생성된 req.user을 이용해 세션에 접근하도록 해야한다.

            ex) /welocme 라우터

            app.get('/welcome', function(req, res){
            // session을 직접 제어하던 기존의 방식
            // if(req.session.nickname){ //로그인이 되어있는지 안 되어있는지에 따라 메인 화면을 다르게 주기

            //passport 모듈을 이용해 저장된 세션 값을 req.user 값을 통해 제어하는 방식
            if(req.user && req.user.nickname){
                res.send(`
                <h1> Hello, ${req.user.nickname}</h1>
                <a href="/auth/logout">Logout</a>`)
            } else {
            res.send(`
                <h1>Welcome</h1>
                <a href="/auth/login">Login</a>
                <a href="/auth/register">Register</a>`)
            }
            })

### 10. login, logout 기능을 굳이 passport를 사용하지 않고 session에 직접 저장할 필요 없이
                req.login, req.logout 메소드를 이용해 처리

            req.login(user, function(err){
            req.session.save(function(){
                res.redirect('/welcome');
            })

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

### 11. 타사인증은 passport-facebook 등의 module을 다운받고 문서를 참고하여 비슷한 방식으로 적용. 로그인창에
            <a href="/auth/facebook">facebook login</a> //로그인 버튼 생성하고
            var FacebookStrategy = require('passport-facebook').Strategy; 코드도 추가


### 12. FacebookStrategy 사용

                passport.use(new FacebookStrategy({
                clientID: '258883774894934',
                clientSecret: '****', // 보안 상 삭제
                callbackURL: "/auth/facebook/callback" //"http://www.example.com/auth/facebook/callback"
            },
            function(accessToken, refreshToken, profile, done) {
                User.findOrCreate(..., function(err, user) {
                if (err) { return done(err); }
                done(null, user);
                });
            }
            ));

### 13. 라우터 설정을 한다. 타사인증은 대체로 라우터가 두개임.
            app.get('/auth/facebook', passport.authenticate('facebook'));
            app.get('/auth/facebook/callback',
            passport.authenticate('facebook', { successRedirect: '/',
                                                failureRedirect: '/login' }));

### 14. passport.use(new FacebookStrategy) 함수의 내용을 수정해준다. (사이트의 문서는 mongoDB를 기준으로 하므로 수정해줌)
    받아들인 callback 함수의 profile 인자(페이스북에서 받아온 프로필 정보)를 기존의 회원 데이터베이스와 비교하여
    authId(식별자) 값이 같은 유저가 있으면 done(null, user)을 return(함수를 해당 명령과 동시에 끝내기 위해).
    done(null, user)는 deserializeUser 메소드에 의해 req.user 값에 세션으로서 저장된다.

                passport.use(new FacebookStrategy({
                    clientID: '258883774894934',
                    clientSecret: '****',
                    callbackURL: "/auth/facebook/callback" //"http://www.example.com/auth/facebook/callback"
                },
                function(accessToken, refreshToken, profile, done) {
                    //console.log(profile);
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
                    'nickname':profile.displayName
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


### 15. displayName이나 id 외에 회원의 email이나 다양한 추가적인 정보를 얻어내기 위해선 사용자의 허락을 받아야 함.
    어떻게 허락을 받는지에 대한 코드가 공식 사이트의 문서의 'permission' 파트에 나와있다.
    app.get('/auth/facebook') 라우터의 callback 함수의 인자 부분에다가 어떤 인자를 더 받을 것인지 반영해주자.
    ## 이 때 주의. profile 값으로 읽어올 값들이 변경된 경우에는
    passport.use(new FacebookStrategy) 함수의 인자 안에
    (clientID, clientSecret, 등등이 객체의 원소로서 이미 들어가 있는 곳)

    profileFields:['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']

    이라는 코드를 추가해서 어떤 데이터를 프로필로서 받아올 것인지 명시적으로 표시해주어야 한다.


            app.get('/auth/facebook',
            passport.authenticate('facebook', { scope: 'email' })
            );

그 뒤 passport.use(FacebookStrategy) 안에서
newuser를 데이터베이스에 push해 줄 때 email 값도 저장해줘야 할텐데 주의사항이 있다.
인자로 넘어오는 profile 상에서 email을 꺼내고 싶을 땐
profile.email이 아니라 profile.emails[0].value를 호출해야 한다.
emails: [ { value: 'aaenyx2@hanmail.net' } ] 꼴로 저장되어 있기 때문.


## passport 연동 인증 + mysql 연동

### 1. mysql 접속하고 데이터베이스 안에 들어가서 users 테이블을 만든다.

                mysql> create table users(
                    -> id INT NOT NULL AUTO_INCREMENT,
                    // 비어있으면 안되고 자동으로 증가
                    -> authId VARCHAR(50) NOT NULL,
                    -> username VARCHAR(30),
                    -> password VARCHAR(255),
                    -> salt VARCHAR(255),
                    -> displayName VARCHAR(50),
                    -> PRIMARY KEY(id),
                    -> UNIQUE(authId)
                    //만약 authId를 새로 입력받았는데 테이블 안에 겹치는 authId가 있으면 테이블에 해당 유저를 삽입하는 것이 거부됨
                    -> ) ENGINE = InnoDB;
                Query OK, 0 rows affected (0.15 sec)

### 2. mysql을 사용하기 위한 설정

                var mysql=require('mysql');
                var MySQLStore = require('express-mysql-session')(session);
                var options = {
                    host: 'localhost',
                    port: 3306,
                    user: 'root',
                    password: 'dlghks12',
                    database: 'o2'
                };
                var conn = mysql.createConnection(options); // or mysql.createPool(options);
                conn.connect();

### 3. 그리고 app.use(session({ 부분에   추가하여 세션을 저장할 데이터베이스를 설정.

        store: new MySQLStore({
            host    :'localhost',
            port : 3306,
            user : 'root',
            password : 'dlghks12',
            database:'o2'
        })


### 4. 회원가입 기능을 mysql과 연동시켜야 한다. register controller의 내용을 conn.quey문을 이용하여 적절하게 수정하자.

### 5. 회원가입 테스트를 해보고 select * from users\G 코드를 mysql에 입력해서 users table에 회원가입 정보가 잘 저장되어 있는지 확인.

### 6. local strategy-serializeUser-deserializeUser 순으로 메소드를 mysql 연동되도록 수정

### 7. 회원가입하자마자 바로 로그인이 되어 메인창에 displayName을 띄워줄 수 있도록, 회원가입 컨트롤러에 코드를 추가.

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


### 8. 타사인증과 mysql.

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

* 주의사항. 만일 페이스북에서 email을 긁어서 회원정보 user database에 등록하려고 하는데
user table에 'email' key가 없는 경우에는

{ Error: ER_BAD_FIELD_ERROR: Unknown column 'email' in 'field list'

라는 오류가 발생. 따라서 user 테이블을 수정해주자. (email key가 있도록)

ALTER TABLE users ADD column email VARCHAR(50);

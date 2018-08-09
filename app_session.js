var express = require('express');
var app = express();
var session = require('express-session');

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat', // 암호화를 위한 키 값
  resave: false,
  saveUninitialized: true,
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

app.listen(3000, function(){
		console.log("Connected 3000 port!");
});

var express = require('express');
var app = express();
var cookie = require('cookie-parser');
var data={
  1: {title: 'me'},
  2: {title: 'you'}
  };
app.locals.pretty = true;
app.set('views', './views_cart');
app.set('view engine', 'jade')
app.use(cookie('6@#%!%@##@54652121'))//쿠키를 암호화하는 변수 문자열을 아무거나 입력해둔다

app.get('/', function(req, res) {
  console.log('Cookies: ', req.signedCookies);
})

app.get('/products', function(req,res){
  res.render('product',  {data: data})
});

app.get("/cart/:id", function(req,res){
  var id=req.params.id;
  // 만약 브라우저의 cookie 안에 cart라는 객체가 들어있다면,
  if(req.signedCookies.cart){
    var cart=req.signedCookies.cart; //만약 컴퓨터에 이미 cart라는 객체가 있는 상태면 그 값을 사용하면 되므로 초기화해줄 필요 없다.
  // 이때 주의. cookies를 통해 전달된 값은 모두 문자열. 즉 cart 안에 들어있는 값들은 모두 문자열.
  } else {
    var cart = {}; //빈 객체를 만들어 cookie에 심어준다.
  }
// cart라는 객체 안에 해당 아이템이 없었으면 cart[id]의 count를 1로 초기화. 있었다면 1 증가시킨다
  if(!cart[id]){
    cart[id]=0;
  }
  cart[id]=parseInt(cart[id])+1;
    // cart[id]는 문자열이므로 cart[id]++; 라는 명령어는 쓸 수 없다.
  res.cookie('cart', cart, {signed: true}); //쿠키를 암호화했다면 cookie 메소드의 세번째 인자를 추가.
  res.render('cart', {data: data, cart: cart});
});

app.get("/cart", function(req,res){
  if(req.signedCookies.cart){
    var cart=req.signedCookies.cart; //만약 컴퓨터에 이미 cart라는 객체가 있는 상태면 그 값을 사용하면 되므로 초기화해줄 필요 없다.
  // 이때 주의. cookies를 통해 전달된 값은 모두 문자열. 즉 cart 안에 들어있는 값들은 모두 문자열.
    res.render('cart', {data: data, cart: cart});
  } else {
    res.send('Cart is Empty!');
  }

});

app.listen(3000, function(){
		console.log("Connected 3000 port!");
});

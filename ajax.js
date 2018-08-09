var express = require('express');
var app = express();
app.use(express.static('public'));
app.set('views', './views_ajax');
app.set('view engine', 'jade')
app.get('/', function(req, res) {
  res.render('main');
})

app.listen(3000, function(){
		console.log("Connected 3000 port!");
});

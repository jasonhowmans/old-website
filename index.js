var express = require('express'),
		app			= express(),
		hbs			= require('express3-handlebars'),
		port 		= process.env.PORT || 2014;

// where the assets at?
app.use('/assets', express.static(__dirname+'/assets'));

// set the rendering engine to handlebars
app.engine('hbs', hbs({
	exname: 'hbs',
	defaultLayout: 'layout.hbs'
}));
app.set('view engine', 'hbs');

// route: home
app.get('/', function(req,res) {
	res.render('home');
});

console.log('server running @ http://localhost:'+port);
app.listen(port);

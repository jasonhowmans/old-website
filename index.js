var express = require('express'),
		app			= express(),
		hbs			= require('express3-handlebars'),
		Blog		= require('./lib/blog'),
		routes	= require('./routes'),
		port 		= process.env.PORT || 2014;

// where the assets at?
app.use('/assets', express.static(__dirname+'/assets'));

// set the rendering engine to handlebars
app.engine('hbs', hbs({
	exname: 'hbs',
	defaultLayout: 'layout.hbs'
}));
app.set('view engine', 'hbs');

// initialise the blog
var blog = new Blog().init();
// when the blog is ready, pass to routing
blog.on( 'ready', function() {
	routes( app, this );
});

console.log('server running @ http://localhost:'+port);
app.listen(port);

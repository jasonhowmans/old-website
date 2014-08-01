module.exports = function( app, blog ) {
	app.get('/', function(req,res) {
		console.log( blog.posts() );
		res.render('home');
	});
}

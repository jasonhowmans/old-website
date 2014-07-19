var fs 					= require( 'fs' ),
		frontmatter = require( 'front-matter' ),
		marked			= require( 'marked' );


var Blog = function() {
	// _posts will contain an array of post data objects, liiiike
	//  this... {
	//		raw:{string},
	//		filename:{string},
	//		date:{string},
	//		attr:{object|false}
	//	}
	var _posts 		= [],
			posts_dir = './posts/';

	// index post metadata into _posts variable
	var index_posts = function() {
		var fn_regex = /(\d{4}-\d{2}-\d{2})-([A-Za-z0-9_-]*)/;

		// prep files by getting front matter then cache result as object
		// in _posts array
		// @param {string} fn Filename
		var prep_file = function( index, fn ) {
			if ( typeof fn !== 'string' || fn === '..' || fn === '.' ) return false;
			var file_content, file_html, has_fm;
			var	test = fn.match( fn_regex );
			// if filename is valid, open it and extract frontmatter
			if ( test ) {
				read_file( fn, function(file){
					// extract frontmatter from file
					has_fm = frontmatter.test( file );
					file_content = frontmatter( file );
					// cache post for later
					_posts.push({
						raw: fn,
						filename: test[2],
						date: test[1],
						attr: (has_fm) ? file_content.attributes : false
					});
					// re-order posts array on final run
					if ( !index )	{ order_posts_by_date(); console.log(_posts)}
				});
			}
		}

		// read all files in posts directory, and pass filenames to prep_file()
		fs.readdir(posts_dir, function(err, files) {
			if (err) throw err;
			var i = files.length;
			while( i-- ) prep_file( i, files[i] );
		});
	}

	// read a file from the posts directory
	// @param {string} fn Filename
	// @param {function(data)} callback Optional callback function
	var read_file = function( fn, callback ) {
		fs.readFile(posts_dir+fn, 'utf8', function(err, data) {
			if ( err ) throw err;
			return ( typeof callback === 'function' )? callback( data ) : null;
		});
	}

	// order the _posts array by date of post
	var order_posts_by_date = function() {
		_posts.sort( function(a, b) {
			return new Date(a.date) - new Date(b.date);
		});
	}

	// render a post as html
	// @param {string} post_name Name of the post to render
	// @returns {object}
	var render_as_html = function( post_name ) {

	}

	// return a list of posts from the cache
	// @returns {array} an array of posts (see _posts for object structure)
	var list_posts = function() {
		return ( typeof _posts === 'array' )? _posts : null;
	}

	// public api
	return {
		// initialise
		init: function() {
			index_posts();
		},
		// render a post as html
		render_post: render_as_html,
		// return _posts var
		list_posts: list_posts
	}
}

module.exports = Blog();

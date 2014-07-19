var fs 					= require( 'fs' ),
		frontmatter = require( 'front-matter' ),
		marked			= require( 'marked' ),
		ee					= require( 'events' ).EventEmitter;


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
		var indexer = read_files();
		indexer.on( 'read', function(data) {
			var frontmatter = extract_frontmatter( data.body );
			_posts.push({
				raw: data.raw,
				filename: data.filename,
				date: data.date,
				attr: frontmatter.attributes || {}
			});
		});
	}

	// iterate over and open each file in posts directory
	// events: data, error, end
	var read_files = function() {
		var ev = new ee(),
				fn_regex = /(\d{4}-\d{2}-\d{2})-([A-Za-z0-9_-]*)/;
		// read the file, and emit a 'read' event
		var _read = function( fn, out ) {
			fs.readFile( posts_dir + fn, 'utf8', function(err, data) {
				out['body'] = data;
				ev.emit( 'read', out );
			});
		}
		// open posts directory and read all files
		fs.readdir( posts_dir, function(err, files) {
			var fn, _filestring,
					out = {},
					i = files.length;
			// iterate over every file and check if it's named correctly
			while( i-- ) {
				fn = files[i];
				_filestring = fn.match( fn_regex );
				// if _filestring is the correct format, continue onto reading the file
				if ( _filestring ) {
					// start building up output object and pass to read function
					_read( fn, {
						raw: _filestring[0],
						date: _filestring[1],
						filename: _filestring[2],
						body: null });
				}
			}
		});
		return ev;
	}

	var post_lookup = function( fn ) {
		if ( typeof fn !== 'string' || typeof _post !== 'object' ) return false;
		var lookup_table = {};
		for ( var i = 0, l = _posts.length; i < l; i++ ) {
			lookup_table[_posts[i].filename] = _posts[i];
		}
		console.log( lookup_table.indexOf(fn) );
	}

	// extract frontmatter metadata from file and insert into _posts
	// @param {object} body The contents of the file to be parsed
	var extract_frontmatter = function( body ) {
		var has_fm = frontmatter.test( body );
		return ( has_fm )? frontmatter( body ) : null;
		//post_lookup( file_content[2] );
	}

	// order the _posts array by date of post
	var order_posts_by_date = function() {
		_posts.sort( function(a, b) {
			return new Date(a.date) - new Date(b.date);
		});
	}

	// render a post (post_name) as html
	// @param {string} post_name The filename of the post to render
	// @returns {object|false} html output
	var render_as_html = function( post_name ) {
		if ( typeof post_name !== 'string' ) return false;
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

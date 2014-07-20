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
	//		attr:{object|false} }
	var _posts 		= [];
	// posts directory
	var posts_dir = './posts/';

	// error handler for async methods
	var handle_error = function( error ) {
		if ( error ) console.error( err.stack );
		return;
	}

	// index post metadata into _posts variable
	var index_posts = function() {
		var indexer = read_files();
		indexer.on( 'read', function(data) {
			_posts.push({
				raw: data.raw,
				filename: data.filename,
				date: data.date
			})
		})
		// after indexing has finished, order posts
		.on( 'end', function() {
			order_posts_by_date();
			post_lookup('what-was-hard-about-making-this-site', function(post) {
				console.log(post);
			});
		});
	}

	// iterate over and open each file in posts directory
	// @returns events: data, error, end
	var read_files = function() {
		var ev = new ee(),
				fn_regex = /(\d{4}-\d{2}-\d{2})-([A-Za-z0-9_-]*)/;
		// open posts directory and read all files
		fs.readdir( posts_dir, function(err, files) {
			handle_error( err );
			var fn, _filestring,
					out = {};
			// iterate over every file and check if it's named correctly
			var i = files.length;
			while( i-- ) {
				fn = files[i];
				_filestring = fn.match( fn_regex );
				// if _filestring is the correct format, continue onto reading the file
				if ( _filestring ) {
					// start building up output object and pass to read function
					ev.emit('read', {
						raw: _filestring[0],
						date: _filestring[1],
						filename: _filestring[2]});
				}
				if ( 0 === i ) ev.emit('end', null);
			}
		});
		return ev;
	}

	// search for post on filename, and return post data
	// @param {string} filename Unique filename, excluding date and extension
	// @param {function} callback Requested file's metadata and body data as
	//				only argument {object}
	var post_lookup = function( filename, callback ) {
		if ( typeof filename !== 'string' || typeof _posts !== 'object' ) return false;
		var needle, out
				i = _posts.length;
		while( i-- ) {
			if ( filename === _posts[i].filename ) {
				needle = _posts[i];
				break;
			}
		}
		// pass file info to the renderer
		render_file( needle.raw+'.md', function(data) {
			out = { meta: needle, attr: data.attr, html: data.html };
			if ( 'function' === typeof callback ) callback( out );
		});
	}

	// extract frontmatter metadata from file and insert into _posts
	// @param {object} body The contents of the file to be parsed
	var extract_frontmatter = function( body ) {
		var has_fm = frontmatter.test( body );
		return has_fm? frontmatter( body ) : false;
	}

	// order the _posts array by date of post
	var order_posts_by_date = function() {
		_posts.sort( function(a, b) {
			return new Date(a.date) - new Date(b.date);
		});
	}

	// render a post (post_name) as defined html and frontmatter attributes
	// @param {string} filename The filename of the post to render
	// @param {function} callback ({ attr:{object}, html:{string} })
	var render_file = function( filename, callback ) {
		if ( false === fs.existsSync(posts_dir + filename) ) return false;
		var frontmatter, out;
		fs.readFile( posts_dir + filename, 'utf8', function(err, data) {
			out = { attr: {}, html: '' };
			if ( data ) {
				frontmatter = extract_frontmatter( data );
				out.attr = ( !frontmatter )? {} : frontmatter.attributes;
				out.html = ( !frontmatter )? marked(data) : marked( frontmatter.body );
			}
			if ( 'function' === typeof callback ) callback(out);
		});
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
		render_post: render_file,
		// return _posts var
		list_posts: list_posts
	}
}

module.exports = Blog();

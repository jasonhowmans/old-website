var fs            = require( 'fs' ),
    util          = require( 'util' ),
    frontmatter   = require( 'front-matter' ),
    marked        = require( 'marked' ),
    EventEmitter  = require( 'events' ).EventEmitter;


var Blog = function () {
  // public event handler
  EventEmitter.call( this );
  // _posts will contain an array of post data {objects} to be used as reference
  // for different parts of the library
  var _posts  = [];
  // dat blog dow
  var dat = this;
  // posts directory
  this.posts_dir = './posts/';

  // error handler for async methods
  var handle_error = function( error ) {
    if ( error ) console.error( err.stack );
    return;
  }

  //
  // index post metadata into _posts variable
  //
  var index_posts = function() {
    var crawler = read_posts();
    crawler.on( 'read', function(data) {
      _posts.push({
        raw: data.raw,
        filename: data.filename,
        date: data.date,
        attr: data.attr
      });
    })
    // after crawl has finished, order posts chronologically
    .on( 'end', function() {
      sort_posts_by_date();
      dat.emit('ready');
    });
  }

  //
  // iterate over each file in posts directory, and collect data
  // @returns events: data, error, end
  //
  var read_posts = function() {
    var ev = new EventEmitter(),
        fn_regex = /(\d{4}-\d{2}-\d{2})-([A-Za-z0-9_-]*)/;
    // open posts directory and read all files
    fs.readdir( dat.posts_dir, function(err, files) {
      if ( err ) ev.emit('error', err);
      handle_error( err );
      var fn, _filestring,
          out = {};
      // iterate over every file
      var i = files.length;
      while( i-- ) {
        fn = files[i];
        _filestring = fn.match( fn_regex );
        // if _filestring is the correct format, continue onto reading the file
        (function ( i, _filestring ) {
          if ( _filestring  ) {
            // start building up output object and pass to read function
            render_file( _filestring[0]+'.md', function( data ) {
              ev.emit('read', {
                raw: _filestring[0],
                date: _filestring[1],
                filename: _filestring[2],
                attr: data.attr });
              // fire 'end' event after last loop
              if ( 0 === i ) ev.emit('end');
            });
          }
        })( i, _filestring )
      }
    });
    return ev;
  }

  //
  // sprt the _posts array by date of post recent -> ancient
  //
  var sort_posts_by_date = function() {
    _posts.sort( function(a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  }

  //
  // render a post from markdown and return object of html and frontmatter
  // and blog post frontmatter attributes
  // @param {string} filename The filename of the post to render
  // @param {function} callback ({ attr:{object}, html:{string} })
  //
  var render_file = function( filename, callback ) {
    if ( false === fs.existsSync(dat.posts_dir + filename) ) return false;
    var frontmatter, out;
    fs.readFile( dat.posts_dir + filename, 'utf8', function(err, data) {
      out = { attr: {}, html: '' };
      if ( data ) {
        frontmatter = extract_frontmatter( data );
        out.attr = ( !frontmatter )? {} : frontmatter.attributes;
        out.html = ( !frontmatter )? marked(data) : marked( frontmatter.body );
      }
      if ( 'function' === typeof callback ) callback(out);
    });
  }

  //
  // return a list of posts from the cache
  // @returns {array} an array of posts (see _posts for object structure)
  //
  var get_posts = function() {
    return ( typeof _posts === 'object' )? _posts : null;
  }

  //
  // extract frontmatter metadata from file and insert into _posts
  // @param {object} raw_body The contents of the file to be parsed
  //
  var extract_frontmatter = function( raw_body ) {
    var has_fm = frontmatter.test( raw_body );
    return has_fm? frontmatter( raw_body ) : false;
  }

  //
  // search for post based on filename, and return post data
  // @param {string} filename The filename excluding the extension
  // @param {function} callback Requested file's metadata and body data as
  //        only argument {object}
  //
  var post_lookup = function( filename, callback ) {
    if ( typeof filename !== 'string' || typeof _posts !== 'object' ) return false;
    var needle, out
        i = _posts.length;
    while( i-- ) {
      if ( filename === _posts[i].raw ) {
        needle = _posts[i];
        break;
      }
    }
    if ( needle ) {
      // pass file info to the renderer
      render_file( needle.raw+'.md', function(data) {
        out = { meta: needle, attr: data.attr, html: data.html };
        if ( 'function' === typeof callback ) callback( out );
      });
    }else{
      return false;
    }
  }

  //
  // public api
  // ————————————————————————————————————————————
  // renders markdown file passed as first arg
  this.render = render_file;
  // returns a list of posts
  this.posts = get_posts;
  // initialise the blog instance by preparing files for use with api,
  // then make the rest of the api available
  this.init = function() {
    index_posts();
    return this;
  }
}

// extend Blog to inherit from EventEmitter
util.inherits( Blog, EventEmitter );

// export Blog for public use
module.exports = Blog;

var expect  = require('chai').expect,
    Blog    = require('../lib/blog');

var blog_instance = function() {
  var _blog = new Blog();
  _blog.posts_dir = './test/posts/';
  _blog = _blog.init();
  return _blog;
}

describe('Blog', function() {
  var blog = blog_instance();

  before(function(done) {
    blog.on('ready', function() {
      blog = this;
      done();
    })
  })

  describe('#posts()', function() {
    it('should return posts data as an array of objects', function() {
      var posts = blog.posts();
      expect(posts).to.be.an('array');
    })

    it('should return frontmatter data as an object', function() {
      var posts = blog.posts();
      expect(posts[0].attr).to.be.an('object');
    })

    it('should retreive [raw], [filename] and [date] properties as {string}s', function() {
      var posts = blog.posts();
      expect(posts[0]).to.have.property('raw').and.to.be.a('string');
      expect(posts[0]).to.have.property('filename').and.to.be.a('string');
      expect(posts[0]).to.have.property('date').and.to.be.a('string');
    })
  })

  describe('#render()', function() {
    it('should take two arguments, filename {string}, and callback {function}', function(done) {
      var filename = '2014-08-01-hello-world.md';
      var callback = function() { done() };
      blog.render(filename, callback)
    })

    it('should pass data to callback as object with properties [attr] {object} and [html] {string}', function(done) {
      var filename = '2014-08-01-hello-world.md';
      blog.render(filename, function(post) {
        expect(post).to.be.an('object');
        expect(post).to.have.property('attr').and.to.be.a('object');
        expect(post).to.have.property('html').and.to.be.a('string');
        done();
      })
    })

    it('should return false if post doesn\'t exist', function() {
      var filename = '2014-08-01-no-dice.md';
      var val = blog.render(filename);
      expect(val).to.be.false;
    })

    it('should return a string of html for [html] property', function(done) {
      var filename = '2014-08-01-hello-world.md';
      blog.render(filename, function(post){
        var html = post.html;
        expect(html).to.be.a('string').and.to.have.string('<h1 id="hello-there">Hello there</h1>');
        done();
      });
    })
  })
})

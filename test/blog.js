var expect 	= require('chai').expect,
		Blog		= require('../lib/blog');

var blog = new Blog();
blog.posts_dir = './test/posts/';
blog = blog.init();

describe('Blog', function() {
	describe('#posts()', function() {

		before(function(done) {
			blog.on('ready', function() {
				blog = this;
				done();
			});
		});

		it('should return data as an array of objects', function() {
			var posts = blog.posts();
			expect(posts).to.be.an('array');
		});

		it('should return frontmatter data as an object', function() {
			var posts = blog.posts();
			expect(posts[0].attr).to.be.an('object');
		});

		it('should retreive raw, filename and date attributes as strings', function() {
			var posts = blog.posts();
			expect(posts[0]).to.have.property('raw').and.to.be.a('string');
			expect(posts[0]).to.have.property('filename').and.to.be.a('string');
			expect(posts[0]).to.have.property('date').and.to.be.a('string');
		});
	})
});

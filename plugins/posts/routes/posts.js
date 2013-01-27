"use strict";


var mongoose = require('mongoose')
  , Post = mongoose.model("Post");

var routes = module.exports = {};

routes.posts = function(req, res, next) {
  var queryObject = {};
  
  //~ console.log(query.count());
  Post.count({}, function(err, count) {
    if(err) next(err);
    
    Post
    .find({}).limit(10).sort("-createdAt")
    .exec(function(err, posts) {
      
      res.render('posts/posts', {posts: posts, postCount: count});
      return;
      
    });	
  });
}


routes.post = function(req, res, next) {
  console.log('req.params =');
  console.log(req.params.slug);
  if(!req.params || !req.params.slug) {
    res.redirect('/posts');
    return;
  }

  Post
  .findOne({slug: req.params.slug})
  .exec(function(err, post) {
    
    if(!post) {
      next();
      return;
    }
    
    console.log('post = ');
    console.log(post);
    
    res.render('posts/post', {post: post});
    return;
    
  });
}

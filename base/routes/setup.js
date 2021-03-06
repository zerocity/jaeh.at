'use strict';

var mongoose = require('mongoose')
  , slugify = require('../utils').slugify
  , base = require('../base')
  , bonobo = require('../../bonobo')
  , path = require('path')
  , utils = require(path.join('..', 'utils'));

var routes = module.exports = {
    gets: {},
    posts: {}  
};

routes.gets.setup = function(req, res) {
  var settings = require(path.join(__dirname, '..', 'settings'));
  
  res.render('setup', {showform: 'true', settings: settings});
}

routes.posts.setup = function(req, res){
  
  var errs = []
    , msgs = [];
  
  var reqBody = utils.requestBodyToJSON(req.body);
  
  createPageData(reqBody.pageData, function(err, msg) {
    if(err) utils.each(err,function(err){if(err) errs.push(err)});
    if(msg) utils.each(msg,function(msg){if(msg) msgs.push(msg)});
      
    createPages(reqBody.pages, function(err, msg) {      
      
      if(err) utils.each(err,function(err){if (err) errs.push(err)});
      if(msg) utils.each(msg,function(msg){if (msg) msgs.push(msg)});
            

      createMenuItems(reqBody.mIs, function(err, msg) {
        if(err) utils.each(err,function(err){if (err) errs.push(err)});
        if(msg) utils.each(msg,function(msg){if (msg) msgs.push(msg)});
              
        bonobo.DoTheSetup(function(err,msg) {
          if(err) utils.each(err,function(err){if(err) errs.push(err)});
          if(msg) utils.each(msg,function(msg){if (msg) msgs.push(msg)});
          
          res.render('setup', {showform: 'false', errs: errs, msgs: msgs});
        });
      });
    });
  });
}

function createPageData(pD, cb) {
  //page data does not exist, inserting it
   
  var PageData = mongoose.model('PageData');
  
  PageData.findOne({'values.appname': pD.appname}, function(err, pageData) {
    pageData = pageData || new PageData();
    
    pageData.values = pD;
    
    pageData.save(function(err) {
      var msg = [false];
      
      if(!err) {      
        msg = [{message: 'pageData save successful', css: 'win'}];
      }
      err = [{message: err, css: 'err failure'}];
      
      cb(err, msg);
    });
  });
}

function createPages(pages, cb) {
  
  var Page = mongoose.model('Page');

  var msgs = [];
  var errs = [];
  
  var i = 0;
  
  utils.each(pages, function(pageValues){    

    
    Page.findOne({'values.slug': utils.slugify(pageValues.value.title)},function(err, page) {
      page = page || new Page();
      
      page.values = pageValues.value;
    
      page.save(function(err) {
        var msg = [false];
        
        if(!err) {      
          msgs.push({message: 'page '+page.values.title+' save successful', css: 'win'});
        } else {
          errs.push({message: 'page '+page.values.title+' save errored: '+err, css: 'err failure'});
        }
        
        
        i++;
        
        if(i >= utils.count(pages) ) {
          if(errs.length == 0) {
            msgs.push({message: 'page setup successful, added '+i+' pages', css: 'win'});
          }else{
            msgs.push({message: 'page setup completed with errors', css: 'fail'});
          }
          
          cb(errs,msgs);
        }
      });
    });
  });
}

function createMenuItems(mIs, cb) {
  
  var MenuItem = mongoose.model('MenuItem');
  
  
  var msgs = [];
  var errs = [];
  
  var i = 0;
  
  utils.each(mIs, function(mIValues) {
    
    MenuItem.findOne({'values.slug': utils.slugify(mIValues.value.title)}, function(err, menuItem){
      menuItem = menuItem || new MenuItem();
      
      menuItem.values = mIValues.value;
      
      
      menuItem.save(function(err, msg) {
        
        var msg = [false];
        
        if(!err) {      
          msgs.push({message: 'menuItem '+menuItem.values.text+' save successful', css: 'win'});
        } else {
          errs.push({message: 'menuItem '+menuItem.values.text+' save errored: '+err, css: 'err failure'});
        }
        
        
        i++;    
                
        if(i >= utils.count(mIs) ) {
          if(errs.length == 0) {
            msgs.push({message: 'menuItem setup successful, added '+i+' menuItems', css: 'win'});
          }else{
            errs.push({message: 'menuItem '+menuItem.values.text+' setup completed with errors', css: 'fail'});
          }
          cb(errs, msgs);
        }
      });
    });
  });
}


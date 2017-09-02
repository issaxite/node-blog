var express = require('express');
var router = express.Router();
var Article = require('../models/articles');

/* GET home page. */
router.get('/index', function(req, resp, next) {
  var article = new Article();
  article.find(0, function(err, docs) {
    resp.render('index', {
      title: '主页',
      data: docs,
      userinfo: req.session.userinfo
    });
  });
});

router.get('/article/:id', function(req, resp) {
  var id = req.params.id;
  var article = new Article();
  article.findById(id, function(err, docs) {
    resp.render('article', {
      title: '文章',
      data: docs,
      userinfo: req.session.userinfo
    });
  });
});

router.get('/archive', function (req, resp) {
  var article = new Article();
  var _formatTime = function(time) {
    var date = new Date(time);
    date = date.getFullYear()+'年'+(+date.getMonth()+1)+'月'+date.getDate()+'日';
    return date;
  };
  var groupByDate = function(data) {
    var initData = data[0];
    var initDate = _formatTime(initData.createAt);
    var archive = {};
    var date;
    
    archive[initDate] = [{
      _id: initData._id,
      title: initData.title
    }];
    for( var i = 1; i < data.length; i++ ) {
      date = _formatTime(data[i].createAt);
      if( archive[date] ) {
        archive[date].push({
          _id: data[i]._id,
          title: data[i].title
        });
      } else {
        archive[date] = [{
          _id: data[i]._id,
          title: data[i].title
        }];
      }
    }
    return archive;
  };

  article.find(0, function(err, docs) {
    resp.render('archive', {
      title: '归档',
      data: groupByDate(docs),
      userinfo: req.session.userinfo
    });
  }, {"createAt": 1});
});

router.get('/about', function (req, resp) {
  resp.render('about', {
    title: '关于',
    userinfo: req.session.userinfo
  });
});

router.get('/add(/:id)?', function (req, resp) {
  console.log(req.session.userinfo);
  if(!req.session.userinfo) {
    resp.redirect('/index');
    return false;
  }
  var id = req.params.id;
  if(id) {
    var article = new Article();
    article.findById(id, function (err, docs) {
      resp.render('add', {
        title: '修改文章',
        data: docs,
        userinfo: req.session.userinfo
      });
    });
  }else {
    resp.render('add', {
      title: '添加文章',
      userinfo: req.session.userinfo
    });
  }
});

router.post('/aDelete', function(req, resp) {
  var id = req.body.id;
  console.log(id);
  var article = new Article();
  article.deleteById(id, function(err) {
    if(err){
      console.error("删除失败！");
      resp.json({ status: 1, msg: "删除失败！" });
      return false;
    }
    resp.json({ status: 0, msg: 'success' });
  });
});

router.all('/upload', function(req, resp) {

});

router.post('/aSaveArticle', function (req, resp) {
  var date = new Date();
  var body = req.body;
  var data = {
    title: body.title,
    markdown: req.body.markdown,
    createAt: date.getTime(),
    updateAt: date.getTime()
  };
  var article = new Article();
  if(body.id){
    data.id = body.id;
    article.update(data, function(err, docs) {
      console.log(docs);
      resp.json({ status: 0, msg: 'test' });
      resp.end();
    });
  }else{
    article.save(data, function(err, docs) {
      console.log(docs);
      resp.json({ status: 0, msg: 'test' });
      resp.end();
    });
  }
});

module.exports = router;

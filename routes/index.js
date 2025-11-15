var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/home', function(req,res,next){
  res.render('home');
});

router.get('/addp', function(req,res,next){
  res.render('addp');
});

router.get('/adde', function(req,res,next){
  res.render('adde');
});

router.get('/viewp', function(req,res,next){
  res.render('viewp');
});

router.get('/viewe', function(req,res,next){
  res.render('viewe');
});

router.get('/managep', function(req,res,next){
  res.render('managep');
});

router.get('/managee', function(req,res,next){
  res.render('managee');
});

router.get('/appointments', function(req,res,next){
  res.render('appointments');
});
module.exports = router;

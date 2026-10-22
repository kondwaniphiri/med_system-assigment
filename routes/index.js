var express = require('express');
var router = express.Router();
const { isAuthenticated, isGuest, isDoctor } = require('../middleware/auth');

/* GET home page. */
router.get('/', isGuest, function(req, res, next) {
  res.render('index');
});
router.get('/home', isAuthenticated, function(req,res,next){
  res.render('home');
});

router.get('/addp', isAuthenticated, function(req,res,next){
  res.render('addp');
});

router.get('/adde', isAuthenticated, function(req,res,next){
  res.render('adde');
});

router.get('/viewp', isAuthenticated, function(req,res,next){
  res.render('viewp');
});

router.get('/viewe', isAuthenticated, function(req,res,next){
  res.render('viewe');
});

router.get('/managep', isAuthenticated, function(req,res,next){
  res.render('managep');
});

router.get('/managee', isAuthenticated, function(req,res,next){
  res.render('managee');
});

router.get('/appointments', isAuthenticated, function(req,res,next){
  res.render('appointments');
});
router.get('/pharmacy', isAuthenticated, isDoctor, (req,res)=>res.render('pharmacy'));
module.exports = router;

var express = require('express');
var router = express.Router();
var connection  = require('../config/db');


var session_store;

//home page
router.get('/', function(req, res, next) {
  if(req.session.is_login==true){
    res.render('user/home', {title: 'Home', session:req.session });
  }else{
    req.flash('error', 'Unauthorized');
    res.redirect('/');
  }
});

//login page
router.get('/login', function(req, res, next) {
  res.render('user/login', {title: 'Login'});
});

//login auth
router.post('/login', function(req, res, next) {
  session_store=req.session;
  
  req.assert('email', 'Email not valid').isEmail();
  req.assert('password', 'Please fill the Password').notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
   
   
    email = req.sanitize( 'email' ).escape().trim(); 
    pass  = req.sanitize( 'password' ).escape().trim();
    
      connection.query('SELECT * FROM users WHERE ?',{ email:email }, function(err, rows, fields) {
        if(err) throw err
        var data=rows[0];
        // if data not found
        if (rows.length > 0) {
            if(data['password']==pass){
              session_store.is_login = true;
              session_store.name=data['name']
              req.flash('success', 'Login successfully!');
              res.redirect('/users');
            }else{ //password failed
              req.flash('error', 'Login failed, password wrong!');
              res.redirect('/users/login');
            }
        }
        else { // user not found
          req.flash('error', 'Login failed,user not found!');
          res.redirect('/users/login');
        }            
      });
    
    
  }else{
   //Display errors 
      var error_msg = ''
      errors.forEach(function(error) {
          error_msg += error.msg + '<br>'
      });                
      req.flash('error', error_msg);        

      res.render('/users/login', { 
          title: 'Login',
         data:data,
      });
  
  }
  
});

router.get('/register', function(req, res, next) {
    res.render('user/register', {title: 'Register' });
});

router.post('/register', function(req, res, next) {
    session_store=req.session;
    
    req.assert('name', 'Please fill the Name').notEmpty();
    req.assert('email', 'Email not valid').isEmail();
    req.assert('password', 'Please fill the Password').notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
     
      var data={
        name:req.sanitize( 'name' ).escape().trim(), 
        email:req.sanitize( 'email' ).escape().trim(), 
        password:req.sanitize( 'password' ).escape().trim(),
      }

      connection.query('INSERT INTO users set ?',data , function(err, rows, fields) {
        if(err) throw err
        session_store.is_login = true;
        session_store.name=data['name']
        req.flash('success', 'Login successfully!');
        res.redirect('/users');

      });
  
    }else{
      var error_msg = ''
      errors.forEach(function(error) {
          error_msg += error.msg + '<br>'
      });                
      req.flash('error', error_msg);        

      res.render('/users/register', { 
          title: 'Register',
         
      });
  
    }
 

});  


//logout
router.get('/logout', function(req, res, next) {
    req.session.destroy();
    //req.flash('success', 'Logout successfully!');
    res.redirect('/'); 
    
});


module.exports = router;

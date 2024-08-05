var express = require('express');
var router = express.Router();
const bcrypt =  require('bcrypt');
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
//Load JSON 
var jwt = require('jsonwebtoken');
const { JsonWebTokenError } = require('jsonwebtoken');
const userModel = require('../Models/user');
let blacklist = new Set();

//Middleware to check Auth 
var AuthJWT = (req, res, next) => {
  var token = req.headers.authorization;
  token = token.split(' ')[1];
  var privatekey = 'xfsdfsfertfdgdsgdfgdfgdfgfg';
  if (blacklist.has(token)) return res.sendStatus(403); // Token is blacklisted

  jwt.verify(token, privatekey, function (err, decoded) {
    if (err) {
      console.log(err);
      res.send({ message: 'Invalid Token' });
    }
    else {
      next();
    }
  })
}
//Display all records API using JWT
router.get('/get-all-users-api', AuthJWT, function (req, res, next) {
  userModel.find().then(function (db_users_array) {
    console.log(db_users_array);
    res.json(db_users_array);
  });
});

// Login API 
router.post('/login-api', function (req, res, next) {
  var email = req.body.user_email;
  var password = req.body.user_password;
  console.log(req.body);
  userModel.findOne({ "user_email": email }).then(function (db_users_array) {
    if (db_users_array) {
      var db_email = db_users_array.user_email;
      var db_password = db_users_array.user_password;
    }
    if (db_email == null) {
      console.log('If');
      res.send(JSON.stringify({ "status": 200, "flag": 1, "message": "Login Failes No User", "data": ' ' }));
    }
    bcrypt.compare(password,db_password,function(err,result){

           if (db_email == email && result == true) {
            var privatekey = "xfsdfsfertfdgdsgdfgdfgdfgfg";
            let params = {
              email: db_users_array.email,
            }
            var token = jwt.sign(params, privatekey);
            console.log("Token is " + token);
            res.send(JSON.stringify({ "status": 200, "flag": 1, "message": "Login Sucess", "Token": token }));
          }
          else {
            console.log('Credentials Wrong');
            res.send(JSON.stringify({ "status": 200, "flag": 0, "message": "Login Failed", "data": ' ' }));
          }   
         
    });

  })
});

// LogOut API 
router.get('/logout-api',AuthJWT, function (req, res, next) {
  //const authHeader = req.headers["authorization"];
  const token = req.header('Authorization')?.split(' ')[1];
  blacklist.add(token);
      res.send({ msg: 'You have been Logged Out' });
     
  
});
router.post('/login2-api', function (req, res, next) {
  var email =  req.body.user_email;
  var password  = req.body.user_password;

  userModel.findOne({"user_email":email}).then(function(db_users_array){
    if(db_users_array){
      db_email =  db_users_array.user_email;
      db_password = db_users_array.user_password;
    }
    if(db_email == null){
      console.log('If');
      res.send(JSON.stringify({ "status": 200, "flag": 1, "message": "Login Failes No User", "data": ' ' }));
    }else if(db_email == email  && db_password ==  password){
    bcrypt.compare(password,db_password,function(err,result){
      if(result == true){
        res.send(JSON.stringify({msg : "Password same"}));
      }else{
        res.send(JSON.stringify({msg : "Password not same"}));
      }
    })
    //  res.send(JSON.stringify({ "status": 200, "flag": 1, "message": "Login Sucess" }));
    }else{
      console.log('Credentials Wrong');
      res.send(JSON.stringify({ "status": 200, "flag": 0, "message": "Login Failed", "data": ' ' }));
    }
  })
});

router.get('/login', function (req, res, next) {
  res.render('login');
});
router.post('/login', function(req, res, next) {
  var email =  req.body.user_email;
  var password =  req.body.user_password;
  console.log(req.body);
  userModel.findOne({"user_email": email}).then(function(db_users_array){
      console.log('Find one '+db_users_array);
      if(db_users_array){
        var db_email =  db_users_array.user_email;
        var db_password =  db_users_array.user_password;
      }
      console.log("db_users_array.user_email "+db_email);
      console.log("db_users_array.user_password "+db_password);
  if(db_email == null){
    console.log("If");
    res.end('Email not Found');
  }
  else if(db_email == email && db_password == password){
    req.session.email = db_email;
    res.redirect('home');
  }
  else
  {
    console.log('Credentionals wrong');
    res.end('Login invalid');
  }
})
});

router.get('/home', function(req, res, next) {
  console.log("Home Called " + req.session.email);
  var myemail = req.session.email;
  console.log(myemail);
  if (!req.session.email) {
    console.log("Email Session is Set");
    res.end("Login required to Access this page");
  }
  res.render('home',{myemail:myemail});
});

//Register API
router.post('/register-api', function (req, res, next) {
  var mypassword =  req.body.user_password;
  const saltRounds=1;
  bcrypt.hash(mypassword,saltRounds,function(err,epass){
    const user_bodydata = {
      user_name: req.body.user_name,
      user_email: req.body.user_email,
      user_mobile: req.body.user_mobile,
      user_password: epass
    }
    console.log("user = "+req.body.user_email+" and hash password =  " +epass);
    const userdata = userModel(user_bodydata);
    userdata.save()
      .then(data => {
        res.send(JSON.stringify({ msg: 'Record Added.' }));
      })
      .catch(err => console.log(err));
  })

});

// Display API 


router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/register', function (req, res, next) {
  const user_bodydata = {
    user_name: req.body.user_name,
    user_email: req.body.user_email,
    user_mobile: req.body.user_mobile,
    user_password:req.body.user_password,
  }
  const userdata = userModel(user_bodydata);
  userdata.save()
  .then(data => {
    res.redirect('display');
  })
  .catch(err => console.log(err));
});
router.get('/display', function(req, res, next) {
  userModel.find()
  .then(data =>{
   //res.json(data);
    //console.log(data);
    res.render('display',{mydata:data});
  })
  .catch(err => console.log(err));
});
router.get('/display-api', function(req, res, next) {
 var mypassword =  req.body.user_password;
 const hashpassword =  bcrypt.hash;
 bcrypt.compare(mypassword,hashpassword,function(err,result){
  if(result  ==  true){
    userModel.find()
    .then(function(db_users_array){
     console.log(db_users_array);
     res.json(db_users_array);
    });
  }else{
    res.send(err)
  }
 })
 
});

module.exports = router;

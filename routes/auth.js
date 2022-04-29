/* ------------------------- AUTH.JS -------------------------------

api endpoint for user authentication, logging in, logging out, etc.

- routes to:
  * /login
  * /logout
  * /register
  * /getUser -> for frontend to verify that req.user is still active

--------------------------------------------------------------------
*/

const express = require('express'), 
    router = express.Router(),
    passport = require('passport');
    const mongoose = require('mongoose'),
    User = mongoose.model('User');


// check if passport session has expired
router.get('/getUser', (req, res) => {
  if (req.user) { res.json({user: true}); }
  else { res.json({user: false}); }
});
  

router.get('/logout', (req, res) => {
  req.logout();
  res.json({user: null});
});


router.post('/register', (req, res) => {

  // register new user using the passport-local-mongoose function User.register()
  const newUser = new User({username: req.body.username});

  User.register(newUser, req.body.password, (err) => {

    if (err) {
      // if username already exists...
      if (err.name === 'UserExistsError') {
        res.json({message:'An account with that username already exists.',
        error: err});

      // some other error...
      } else {
        res.json({message:'Your registration information is not valid',
        error: err});
      }

    } else {
      // if registration goes through, log the new user in
      passport.authenticate('local')(req, res, function() {
        res.json({
          accountCreated: true,
          message: 'Account created successfully',
          user: req.user.username,
        });
      });
    }
  });   
});


router.post('/login', (req, res, next) => {

  passport.authenticate('local', (err, user) => {

    if (err) { 
      res.status(500).json({message: 'Passport error while trying authenticate user.',
      error: err});
    }

    if(!user) { res.json({message: 'Username or password is incorrect.'}); }

    else if (user) { 

      req.logIn(user, (err) => {

        if (err) { 
          res.status(500).json({message: "Passport error while trying to log in. Correct credentials.",
          error: err});
          return next(err);
        }

        res.json({
          message: "Login successful.",
          loggedIn: true,
          user: req.user.username});
        
      });
    }
  })(req, res, next);
});

module.exports = router;
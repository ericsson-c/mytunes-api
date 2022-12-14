require('./db');

const express = require('express');
const path = require('path');
const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const LocalStrategy = require('passport-local').Strategy;
const cors = require('cors');
require('dotenv').config();

const app = express();

// enable sessions
const session = require('express-session');
//const session  = require('cookie-session');
const MongoStore = require('connect-mongo');


const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
    resave: true,
    saveUninitialized: true,
    proxy: true,
    store: MongoStore.create({
      mongoUrl: 'mongodb+srv://ericssonc:M6loszE4kTJhNJ6X@song-db.zqo6q.mongodb.net/myFirstDatabase?'
      //process.env.MONGODB_URI,
    }),
    // 1 hour session duration
    ttl: 60 * 60
};

app.use(session(sessionOptions));

// enable cookies to be sent across domains (client to api, vice versa)
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// enable CORS middleware
app.use(cors({
  origin: ['http://localhost:3000',
  'https://main--elaborate-marigold-f152a6.netlify.app',
  'http://main--elaborate-marigold-f152a6.netlify.app',
  'https://mytunes-frontend.herokuapp.com',
  'http://mytunes-frontend.herokuapp.com'],
  credentials: true
}));

// passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// make user data available to all templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// routes setup
const auth = require('./routes/auth');
const playlist = require('./routes/playlists');
const songs = require('./routes/songs');
const upload = require('./routes/uploadSong');

app.use('/playlists', playlist);
app.use('/', auth);
app.use('/songs', songs);
app.use('/upload', upload);

app.listen(process.env.PORT || 3001);
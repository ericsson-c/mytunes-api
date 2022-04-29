const mongoose = require('mongoose'),
	//URLSlugs = require('mongoose-url-slugs'),
	passportLocalMongoose = require('passport-local-mongoose'),
	ObjectId = require('mongodb').ObjectId;

// use dotenv for local configuration
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true});
//mongoose.connect('mongodb://localhost/songdb');
const db = mongoose.connection;
	
const Song = new mongoose.Schema({
	// song name
	title: String,
	// song artist/band
	artist: String,
	// album
	album: String,
	// file literal
	file_id: ObjectId // ref to a file object
});

const Playlist = new mongoose.Schema({
	// username of the user that created the playlist
	user: {type: String},
	// name of playlist
	name: {type: String},
	// array of songs in the playlist
	songs: [ObjectId]
});

const User = new mongoose.Schema({
	// plain text username
	username: {type: String, required: true},
	// hashed password
	password: String,
	// array of playlists created by user
	playlists: [Playlist]
});

// *** FILE DB created by multer, no need to initialize here ****

// attach passportLocalMongoose as a plugin for user schema
// - I believe it lets us use User.authenticate() as an authentication strategy
User.plugin(passportLocalMongoose);
//Playlist.plugin(URLSlugs('name'));

// register each schema as a model
mongoose.model('User', User);
mongoose.model('Playlist', Playlist);
mongoose.model('Song', Song);

module.exports = { 'db': db};

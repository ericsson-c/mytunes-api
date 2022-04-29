/* ------------------------- PLAYLISTS.JS -------------------------------

api endpoint for user fetching and creating playlists

- routes to:
  * / -> GET all songs for current user
  * /:playlistID -> GET song data for specified playlist
  * /create -> POST a new playlist

--------------------------------------------------------------------
*/


const express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Playlist = mongoose.model('Playlist'),
	Song = mongoose.model('Song');

router.get('/', (req, res) => {
	if (req.user) {
		Playlist.find({user: req.user.username}, (err, playlists) => {
			if (err) {
				res.json({message: "Error fetching playlists.", error: err});
			} else { res.json(playlists); }
		});
	} else {
		res.json({message: "Must be logged in to fetch playlists."});
	}
	
});

router.get('/:playlistID', async (req, res) => {

	const playlist = await Playlist.findOne({_id: req.params.playlistID});
	const songArr = [];
	for (let i = 0; i < playlist.songs.length; i++) {
		const songID = playlist.songs[i];
		const song = await Song.findOne({_id: songID});
		songArr.push(song);
	}
	res.json({message: `Fetched song data for playlist ${playlist.name}`, songs: songArr});
});

// need to make sure a user is logged in at all times
router.post('/create', (req, res) => {

	if (!(req.body.name)) {
		res.json({
			message: 'Must enter a playlist name.'
		});
	}

	let songsToAdd = [];
	if (Array.isArray(req.body.songs)) {
		songsToAdd = req.body.songs;
	} else if (req.body.songs !== null) {
		songsToAdd.push(req.body.songs);
	}
	
	if (req.user) {
		const playlist = new Playlist({user: req.user.username, name: req.body.name, songs: songsToAdd});
		playlist.save().then((savedPlaylist) => { res.json({
			playlist: savedPlaylist
		});});
	} else {
		res.json({message: 'User must be logged in to create playlist.'});
	}
	
});

// TODO: -------------------------------------------

router.post('/add/:playlistID', async (req, res) => {
	const playlist = await Playlist.findOne({_id: req.params.playlistID});
	const newSongs = playlist.songs;
	if (Array.isArray(req.body.songs)) {
		for (let i = 0; i < req.body.songs.length; i++) {
			newSongs.push(req.body.songs[i]);
		}
	} else if (req.body.songs !== null) { newSongs.push(req.body.songs); }
	
	playlist.songs = newSongs;
	playlist.save().then(res.redirect(`/playlist/${req.params.playlistID}`));
});

router.get('/add/:playlistID', async (req, res) => {
	const songs = await Song.find({});
	const playlist = await Playlist.findOne({_id: req.params.playlistID});
	res.render('addToPlaylist', {'songs': songs, 'playlist': playlist});
});


module.exports = router;
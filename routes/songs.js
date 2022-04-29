/* ------------------------- SONGS.JS -------------------------------

api endpoint for user fetching songs to display in SongTable component

- GET routes to:
  * / -> fetches metadata for all songs (title, artist, album, file_id)
  * /:trackID -> fetches audio data for specific file_id

--------------------------------------------------------------------
*/

const express = require('express'),
    Router = express.Router(),
	mongoose = require('mongoose'),
    GridFSBucket = require('mongodb').GridFSBucket,
    { db } = require('../db'),
    Song = mongoose.model('Song');


Router.get('/', (req, res) => {
	Song.find({}, (err, songs) => {
        res.json({songs: songs, user: req.session});
	});
});


const ObjectID = mongoose.Types.ObjectId;
Router.get('/:trackID', (req, res) => {

    const trackID = new ObjectID(req.params.trackID);

    res.set('content-type', 'audio/mp3');
    res.set('accept-ranges', 'bytes');

    const bucket = new GridFSBucket(db);

    const downloadStream = bucket.openDownloadStream(trackID);

    downloadStream.on('data', (chunk) => {
        res.write(chunk);
    });

    downloadStream.on('error', (err) => {
        console.log(err);
    });

    downloadStream.on('end', () => {
        res.end();
    });

});

module.exports = Router;
/* ------------------------- SONGS.JS -------------------------------

api endpoint for uploading songs

- routes to:
  * / -> POST a new song (title, artist, album, file)

--------------------------------------------------------------------
*/

const { Readable } = require('stream'),
    express = require('express'),
    Router = express.Router(),
    multer = require('multer'),
    GridFSBucket = require('mongodb').GridFSBucket,
    { db } = require('../db'),
    mongoose = require('mongoose'),
    Song = mongoose.model('Song');

const storage = multer.memoryStorage();
const upload = multer({storage: storage});


Router.post('/', upload.single('audioFile'), (req, res) => {
   
    // check if song title was submitted
    if (!req.body.title) {
        res.status(400).json({message: "Must enter a song title."});
    }

    // check if song artist was submitted
    if (!req.body.artist) {
        res.status(400).json({message: "Must enter an artist."});
    }

    if (!req.body.artist) {
        res.status(400).json({message: "Must enter an album."});
    }

    const trackName = req.body.title;

    /* in blog post, "convert buffer to readable stream"
        - file uploaded with multer is stored in req.file.buffer
        - so push the buffer onto the readable stream
        - then push null to signify file end
    */

    const readableTrackStream = new Readable();
    readableTrackStream.push(req.file.buffer);
    readableTrackStream.push(null);

    const bucket = new GridFSBucket(db, {
        bucketname: 'audioFiles'
    });

    // create an upload stream from the uploaded file
    const uploadStream = bucket.openUploadStream(trackName);

    // *** id of track in fs.files **
    const id = uploadStream.id;

    readableTrackStream.pipe(uploadStream);

    uploadStream.on('error', () => {
        res.status(500).json({message: "Error uploading file. Please try again."});
    });

    uploadStream.on('finish', () => {
        //res.json({message: `Successfully uploaded ${trackName}.`}); // might be unncessary if status defaults to 201
    });

    // add song file to songs collections
    Song.create({title: trackName, artist: req.body.artist, album: req.body.album, file_id: id}, (err, savedSong) => {
        if (err) {
            console.log(err);
            res.status(500).json({message: 'Error adding song to database. Please try again.'});
        } else {
            res.json({message: 'Added track to database.', song: savedSong});
        }
    });    
});

module.exports = Router;
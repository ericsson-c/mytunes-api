const mongoose = require('mongoose');

function addPlainTextID(songs) {
	songs.forEach(song => {
		song['plainTextID'] = song['_id'].toString();
		delete song._id;
	});
	return songs;
}
const songs = [
	{_id: new mongoose.Types.ObjectId('624e5ca4224fcf142cbf5773')}
];
console.log(addPlainTextID(songs));
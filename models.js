
var Mongoose = require('mongoose');


var MarkerSchema = new Mongoose.Schema({
	"picture": String,
	"topic": String,
	"lat": Number,
	"lng": Number
  // fields are defined here
});

var InfoBoxSchema = new Mongoose.Schema({
	"content": String,
	"lat": Number,
	"lng": Number
})

exports.Marker = Mongoose.model('Marker', MarkerSchema);
exports.InfoBox = Mongoose.model('InfoBox', InfoBoxSchema);
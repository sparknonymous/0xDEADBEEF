
var Mongoose = require('mongoose');


var MarkerSchema = new Mongoose.Schema({
	"picture": String,
	"lat": Number,
	"lng": Number
  // fields are defined here
});

var InfoWindowSchema = new Mongoose.Schema({
	"content": String,
	"lat": Number,
	"lng": Number
})

exports.Marker = Mongoose.model('Marker', MarkerSchema);
exports.InfoWindow = Mongoose.model('InfoWindow', InfoWindowSchema);
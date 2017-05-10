
var Mongoose = require('mongoose');


var MarkerSchema = new Mongoose.Schema({
	"picture": String,
	"topic": String,
	"type": String,
	"score": Number,
	"lat": Number,
	"lng": Number
  // fields are defined here
});

var InfoBoxSchema = new Mongoose.Schema({
	"content": String,
	"lat": Number,
	"lng": Number
})

var CommentSchema = new Mongoose.Schema({
	"content": String,
	"score": Number,
	"lat": Number,
	"lng": Number
})

exports.Marker = Mongoose.model('Marker', MarkerSchema);
exports.InfoBox = Mongoose.model('InfoBox', InfoBoxSchema);
exports.Comment = Mongoose.model('Comment', CommentSchema);
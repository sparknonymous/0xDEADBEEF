var models = require('../models');
/*
 * GET home page.
 */
exports.view = function(req, res){
  res.render('index');
};

exports.add_marker = function(req, res) {
	var form = req.body;
	var newMarker = new models.Marker({
		"picture": form.picture,
		"lat": form.lat,
		"lng": form.lng
	})

	newMarker.save(afterSaving);

	function afterSaving(err) {
        if(err) {console.log(err); res.send(500);}
        res.redirect('/');
    }
}

exports.get_marker = function(req, res) {
   models.Marker
    .find()
    .exec(afterQuery)

  function afterQuery(err, markers) {
    if(err) console.log(err);
    res.send(markers)
  }

}

exports.add_window = function(req, res) {
    var form = req.body;
    console.log(form.content)
	var newWindow = new models.InfoWindow({
		"content": form.content,
		"lat": form.lat,
		"lng": form.lng
	})

    newWindow.save(afterSaving);

	function afterSaving(err) {
        if(err) {console.log(err); res.send(500);}
        res.redirect('/');
    }
}

exports.get_window = function(req, res) {
	var form = req.body
	console.log(req.body.lat)
	console.log(req.body.lng)
	models.InfoWindow
    .find({"lat": req.body.lat, "lng": req.body.lng})
    .exec(afterQuery)

    function afterQuery(err, infowindow) {
      if(err) console.log(err);
      res.send(infowindow)
  }

}
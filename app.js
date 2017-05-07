/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express-handlebars')
var index = require('./routes/index_route');
var app = express();
var mongoose = require('mongoose');


// Connect to the Mongo database, whether locally or on Heroku
var local_database_name = 'dejamoo';
var local_database_uri  = 'mongodb://localhost/' + local_database_name
//var uri = "mongodb://sase:saseislyfe@ds023478.mlab.com:23478/heroku_m9jc2gg9";
uri = ""
var database_uri = uri || local_database_uri;
mongoose.connect(database_uri);

var index = require('./routes/index_route')

// All environments.
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser('Deja Moo'));
app.use(express.session({
    secret: 'moo_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true
    }
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Development only.
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// Add routes here.
app.get('/', index.view);
app.post('/add_marker', index.add_marker);
app.post('/add_window', index.add_window)
app.get('/get', index.get_marker);
app.post('/get_window', index.get_window)

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
    console.log(database_uri)
});

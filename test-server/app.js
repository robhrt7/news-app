var express = require('express');
var fs = require('fs');
var path = require('path');
var	url = require('url');
var bodyParser = require('body-parser');
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.set('jsonp callback name', 'callback');

var router = express.Router();

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

router.get('/', function(req, res) {
	res.json({ message: 'API' });
});

router.route('/data')

    .get(function(req, res) {
        var data = JSON.parse(fs.readFileSync(__dirname + '/data/data.json', 'utf8'));

        res.jsonp(data);
	});

app.use('/api', router);


/* Error handling */
var logErrors = function(err, req, res, next) {
    console.error(("Error: " + err.stack).red);
    next(err);
};

var clientErrorHandler = function(err, req, res, next) {
    if (req.xhr) {
        res.send(500, { error: 'Something blew up!' });
    } else {
        next(err);
    }
};

var errorHandler = function(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
};

app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);
/* /Error handling */


var serverPort = 7777;
app.listen(7777);
console.log('Lauched on http://localhost:'+ serverPort);
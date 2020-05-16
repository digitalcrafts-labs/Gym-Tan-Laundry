require('dotenv').config();
const express = require('express');
const app = express();
const axios = require('axios');
const qs = require('qs');
var spotifyWebApi = require('spotify-web-api-node');

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('public'));

let configString = process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET;
let accessToken = "";

var spotifyApi = new spotifyWebApi();

function getAppAccessToken() {
    // use axios request to get access token from spotify api to make requests for home and display page when user is not logged in
axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: qs.stringify({
        grant_type: 'client_credentials'
    }),
    headers: {
        'content-type': 'application/x-www-form-urlencoded',
    },
    auth: {
        username: process.env.CLIENT_ID,
        password: process.env.CLIENT_SECRET
    }
})
.then((result) => {
    accessToken = result.data.access_token;
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.searchTracks('Love')
    .then(function(data) {
        console.log(data.body.tracks.items);
    })
    .catch(function(err) {
        console.log(err);
    });
})
.catch((err) => {
    console.log(err);    
});
}

getAppAccessToken();


app.get('/', function(req, res, next) {
    // renders home
    res.render('home');
});

app.get('/login', function(req, res, next) {
    res.render('login');
})

app.post('/login', function(req, res, next) {
    res.send('Login route');
    // should have authentication
    // redirects to profile
});

app.get('/registration', function(req, res, next) {
    // renders registration
    res.render('registration');
});

app.post('/registration', function(req, res, next) {
    res.send('Registration post route');
    // redirects to /
    
});

app.get('/dashboard', function(req, res, next) {
    res.send('Profile route');
    // render profile
});

app.get('/display', function(req, res, next) {
    res.send('display');
});

app.get('/logout', function(req, res, next) {
    res.send('logout');
    // redirects to /
});

app.listen(process.env.PORT || 3000, function(req, res, next) {
    console.log('Server started on port 3000');
});
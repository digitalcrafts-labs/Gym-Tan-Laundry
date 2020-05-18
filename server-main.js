require('dotenv').config();
const express = require('express');
// Bring in our database (db) connection and models
const db = require('./models');
const app = express();
const axios = require('axios');
const qs = require('qs');
var spotifyWebApi = require('spotify-web-api-node');
const bcrypt = require('bcrypt');
const saltRounds = 6;

const PORT = process.env.PORT

app.set('view engine', 'ejs');
app.set('views', 'views');

// Setting up middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded());

/*
// Insert router as middleware
app.use(require('./routes'));
*/

let configString = process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET;
let accessToken = "";

var spotifyApi = new spotifyWebApi();


getAppAccessToken()
    .then(()=> {app.listen(PORT, function(req, res, next) {
        console.log('Server started on port:' + PORT);
    })})

// Initial test-route to check if we can get songs pulled from spotify down and rendered to page
app.get('/pull-song', (req,res) => {
    axios({
        url: 'https://api.spotify.com/v1/tracks/?ids=11dFghVXANMlKmJXsNCbNl,20I6sIOMTCkB6w7ryavxtO,7xGfFoTpQ2E7fRF5lN10tr',
        method: 'get',
        params: {
          grant_type: 'client_credentials'
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      }).then(function(response) {
          //console.log(response.data.tracks)
          res.render('display', {
            pageTitle: 'GTL-Test-Song-Pull',  
            songs: response.data.tracks
        });
      }).catch(function(error) {
          console.error(error);
      });
})
    
app.get('/ping', (req,res,next) => {
    res.send('PONG')
});

// New registration route with connection to users table in database
app.get('/registration2', (req,res,next) => {
    res.render('registration2', {
        pageTitle: 'GTL-Registration'
    })
})

// New registration post route which will bcrypt-hash the users password input, then create
// that user in our users database table
app.post('/registration2', (req,res,next) => {
    console.log('This is the req.body:' + req.body)
    const username = req.body.username
    const email = req.body.email

    bcrypt.hash(req.body.password, saltRounds)
        .then(hashedPass => {
            db.Users.create({ username: username, email: email, password: hashedPass })
                .then(newDbUser => {
                    res.render('regSuccess', {
                        pageTitle: 'Success!'
                    })

                })
        })
})


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




/*=====================================================================================================================================*/
// FUNCTIONS (temporary location)
/*=====================================================================================================================================*/

// Use axios request to get access token from spotify api to make requests for home 
// and display page when user is not logged in
function getAppAccessToken() {
    
return axios({
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
    // Jada 
/*axios({
    url: 'https://api.spotify.com/v1/tracks/6BvtitRX5lQC87YlA6rq0n?market=ES',
    method: 'get',
    params: {
      grant_type: 'client_credentials'
    },
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
  }).then(function(response) {
      console.log(response);
  }).catch(function(error) {
  });
  *
    /* spotifyApi.setAccessToken(accessToken);
    spotifyApi.searchTracks('Love')
    .then(function(data) {
        console.log(data.body.tracks.items);
    })
    .catch(function(err) {
        console.log(err);
    }); */
})
.catch((err) => {
    console.log(err);    
});
}
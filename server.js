require('dotenv').config();
const express = require('express');
const app = express();
const axios = require('axios');
const qs = require('qs');
var spotifyWebApi = require('spotify-web-api-node');

const PORT = process.env.PORT

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('public'));

let configString = process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET;
let accessToken = "";

var spotifyApi = new spotifyWebApi();

function getAppAccessToken() {
    // use axios request to get access token from spotify api to make requests for home and display page when user is not logged in
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
          console.log(response.data.tracks)
          res.render('display', {songs: response.data.tracks});
      }).catch(function(error) {
          console.error(error);
      });
})
    
app.get('/ping', (req,res,next) => {
    res.send('PONG')
});
// test route to work on display page


app.get('/', function(req, res, next) {
    // renders home
    res.render('home');
});

app.get('/login', function(req, res, next) {
    res.render('login');
})

<<<<<<< HEAD
app.get('/api/users', (req,res,next) => {
    db.Users.findAll({ raw: true })
        .then((results) => {
            if (results) {
                res.json(results);
            }
        });
});
=======
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

>>>>>>> 60953bfebb3ee0662224ba98d476fcae485a4ddc

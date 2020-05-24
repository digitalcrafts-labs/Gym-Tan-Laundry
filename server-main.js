const express = require('express');
// Bring in our database (db) connection and models
const db = require('./models');
require('dotenv').config();
const app = express();
const passport = require('passport');
const session = require('express-session');
const SpotifyStrategy = require('passport-spotify').Strategy;
const flash = require('connect-flash');
const axios = require('axios');
const qs = require('qs');
const randomstring = require("randomstring");
var spotifyWebApi = require('spotify-web-api-node');
const bcrypt = require('bcrypt');
const saltRounds = 6;
var url = '';
var playlistID;
var playListType = '';
var songList = '';
const PORT = process.env.PORT

passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL
      },
      function(accessToken, refreshToken, expires_in, profile, done) {
          // user access tokens, not app's
          db.Users.findOrCreate({where: {email: profile._json.email, username: profile.username}}).then(user =>{
                done(null, { id: user[0].id, accessToken, refreshToken, username: user[0].username })
          
        }).catch(e => done(e))
      }
    )
  );

app.use(session({secret: process.env.APP_SECRET}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.set('view engine', 'ejs');
app.set('views', 'views');

// Setting up middleware
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded());

//When the auth is successful the id is attached to the session
passport.serializeUser(function(user, done){
    done(null, { id: user.id, accessToken: user.accessToken, refreshToken: user.refreshToken, username: user.username })
})
//Any subsequent requests after the user has been authenticated.
//We will use the userId attached to the session and query the db for the user.
//This means in our routes we don't need to query for the user.
//DeserializeUser will query the Db for us and attach it req.user
passport.deserializeUser(function(user,done){
    db.Users.findByPk(user.id).then(foundUser =>{
        if(foundUser){
            done(null, { foundUser, accessToken: user.accessToken, refreshToken: user.refreshToken, username: user.username })
        }
    }).catch(e =>{
        done(e)
    })
})
/*
// Insert router as middleware
app.use(require('./routes'));
*/
app.use(isLoggedIn);

let configString = process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET;
let applicationAccessToken = "";
let clientAccessToken;
let clientTokenObj = {};

var spotifyApi = new spotifyWebApi();

// Get Public access token and start the server
getAppAccessToken()
    .then(()=> {app.listen(PORT, function(req, res, next) {
        console.log('GTL Server started on port:' + PORT);
    })})


// This route takes our choice of using spotify's recommendatinos endpoint...We provide the parameters, in this case just a few like danceability.
// once that song object is pulled down (response.data.tracks) we map over that array and pull out the individual song id's which are then sent to the display page for rendering/playing
app.get('/search-tracks', (req,res) => {
    axios({
        url: url,
        method: 'get',
        params: {
          grant_type: 'client_credentials'
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${applicationAccessToken}`
        },
      }).then(function(response) {

          console.log(response.data.tracks);
          var searchBlock = response.data.tracks
          var playTracks = searchBlock.map(track => {
            return track.id
          });
          var playUris = searchBlock.map(track => {
              return track.uri;
          });
          req.session.playtracks = playTracks;
          req.session.uris = playUris;
          res.render('display', {
            pageTitle: 'GTL-Track-Search',  
            songs: playTracks,
            loggedIn: req.isLoggedIn
        });
      }).catch(function(error) {
          console.error(error.stack);
      });
});

app.get('/auth/spotify',
    passport.authenticate('spotify', {
      scope: ['user-read-email', 'user-read-private', 'playlist-modify-public']
    })
  );

app.get('/spotify/callback', passport.authenticate('spotify', { failureRedirect: '/login' }), function(req,res){
      //Successful auth
      res.redirect('/display-after-callback');
  })

app.get('/display-after-callback', function(req, res, next) {
    res.render('display', {
        pageTitle: 'GTL-Track-Search',  
        songs: req.session.playtracks,
        loggedIn: true
    });
  }) 

app.get('/push-to-playlist', function(req, res, next) {
      axios.post(`https://api.spotify.com/v1/users/${req.username}/playlists`, {
          "name": `GTL ${playListType} ${songList}`,
          "public": "true"
      }, {
          headers: {
              "Authorization": `Bearer ${clientAccessToken}`,
              "Content-Type": "application/json"
          }
      })
      .then(response => {
          playlistID = `${response.data.id}`;
          axios.post(`https://api.spotify.com/v1/playlists/${response.data.id}/tracks`, {
          "uris": req.session.uris
      }, {
          headers: {
              "Authorization": `Bearer ${clientAccessToken}`,
              "Content-Type": "application/json"
          }
      })
      .then(response => {
        res.render('dashboard', {
            playlistID: playlistID
        })
        // attempting to send newly created playlistID to our database linked to the spotifyID of the user
        .then(response => {
            db.Playlists.create({ playlistID })
        })  
      })
      })
      .catch(error => {
          console.log(`OOPS! ${error}`);
      })
  })


app.post('/modal-input', (req,res,next) => {
     playListType = req.body.playListType;
     songList = req.body.songList;
    
    if(playListType === "GYM") {
        url = getRandomGymRecommendation(songList);
    } else if (playListType === "TAN") {
        url = getRandomTanRecommendation(songList);
    } else {
        url = getRandomLaundryRecommendation(songList);
    }
    res.redirect('/search-tracks');
});

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

// app.get('/dashboard', function(req, res, next) {
//     res.render('dashboard', {
//     });
//     // res.send('Profile route');
//     // render profile
// });

app.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
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
    applicationAccessToken = result.data.access_token;

})
.catch((err) => {
    console.log(err);    
});
}

function isLoggedIn (req, res, next) {
    // if req.user is set user is logged in
    if(req.user) {
        clientAccessToken = req.user.accessToken;
        req.username = req.user.username;
        req.isLoggedIn = true;
    } else {
        req.isLoggedIn = false;
    }
    next();
}

function refreshToken() {
    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: 
            `grant_type=refresh_token&refresh_token=${clientTokenObj.refresh_token}`,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        auth: {
            username: process.env.CLIENT_ID,
            password: process.env.CLIENT_SECRET
        }
    })
    .then((response) => {
        console.log(response.data);
    })
    .catch((err) => {
        console.error(err);
    })
}

// Recommendation functions
function getRandomGymRecommendation (length){
    const gymGenres = ["club", "dance", "happy", "hip-hop", "party", "drum-and-bass", "edm", "pop", "power-pop", "work-out"];
    let gymGenre = gymGenres[Math.floor(Math.random() * gymGenres.length)];
    let gymDanceability = (Math.random() * (0.3 - .9) + .9).toFixed(1);
    let gymPopularity = (Math.random() * (30 - 100) + 100).toFixed(0);
    let gymUrl = `https://api.spotify.com/v1/recommendations?limit=${length}&market=US&seed_genres=${gymGenre}&target_danceability=${gymDanceability}&min_energy=0.4&target_popularity=${gymPopularity}&min_tempo=120&max_tempo=140&min_valence=.5`;
   return gymUrl;
};

function getRandomTanRecommendation (length){
    const tanGenres = ["chill", "idm", "indie-pop", "groove", "hip-hop", "indie-pop", "r-n-b", "pop", "road-trip", "summer"];
    let tanGenre = tanGenres[Math.floor(Math.random() * tanGenres.length)];
    let tanDanceability = (Math.random() * (0.2 - .7) + .7).toFixed(1);
    let tanPopularity = (Math.random() * (10 - 100) + 100).toFixed(0);
    let tanUrl = `https://api.spotify.com/v1/recommendations?limit=${length}&market=US&seed_genres=${tanGenre}&target_danceability=${tanDanceability}&min_energy=0.4&target_popularity=${tanPopularity}&min_tempo=100&max_tempo=130&min_valence=.2`;
    return tanUrl;
  };
  
  function getRandomLaundryRecommendation (length){
    const laundryGenres = ["acoustic", "chill", "guitar", "happy", "indie", "study", "pop"];
    let laundryGenre = laundryGenres[Math.floor(Math.random() * laundryGenres.length)];
    let laundryDanceability = (Math.random() * (0.1 - .5) + .5).toFixed(1);
    let laundryPopularity = (Math.random() * (20 - 100) + 100).toFixed(0);
    let laundryUrl = `https://api.spotify.com/v1/recommendations?limit=${length}&market=US&seed_genres=${laundryGenre}&target_danceability=${laundryDanceability}&min_energy=0.2&target_popularity=${laundryPopularity}&min_tempo=90&max_tempo=130&min_valence=.2`;
    return laundryUrl
  };
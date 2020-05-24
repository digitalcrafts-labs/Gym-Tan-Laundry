// require('dotenv').config();
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

const PORT = process.env.PORT

passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: `http://localhost:${PORT}/spotify/callback`
      },
      function(accessToken, refreshToken, expires_in, profile, done) {
          // user access tokens, not app's
          console.log({accessToken, refreshToken})
          db.Users.findOrCreate({where: {email: profile._json.email, username: profile.username}}).then(user =>{
              console.log(user[0]);
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


getAppAccessToken()
    .then(()=> {app.listen(PORT, function(req, res, next) {
        console.log('Server started on port:' + PORT);
    })})


// This route uses our 'algorithm' which is just a choice of using spotify's recommendatinos endpoint ;) .. We provide the parameters, in this case just a few like danceability.
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
          console.log(response.data);
          var searchBlock = response.data.tracks
          var playTracks = searchBlock.map(track => {
            return track.id
          });
          var playUris = searchBlock.map(track => {
              return track.uri;
          });
          req.session.playtracks = playTracks;
          req.session.uris = playUris;
          //console.log(searchBlock)
          //console.log(playTracks)
          //console.log('SEARCH RESPONSE: ' + JSON.stringify(response.data.tracks[1].id))
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
      console.log({"the_user": req.user, "the_session": req.session})
      console.log('Authenticated!')
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
          "name": "EVEN NEWER - NEWDAM-TEST! Playlist",
          "public": "true"
      }, {
          headers: {
              "Authorization": `Bearer ${clientAccessToken}`,
              "Content-Type": "application/json"
          }
      })
      .then(response => {
          console.log("Created playlist");
          axios.post(`https://api.spotify.com/v1/playlists/${response.data.id}/tracks`, {
          "uris": req.session.uris
      }, {
          headers: {
              "Authorization": `Bearer ${clientAccessToken}`,
              "Content-Type": "application/json"
          }
      })
      .then(response => {
        console.log("Populated playlist");
        res.send("Successfully created playlist");
      })
      })
      .catch(error => {
          console.log(`OOPS! ${error}`);
      })
  })
    
app.get('/ping', (req,res,next) => {
    console.log(req.username);
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

app.post('/modal-input', (req,res,next) => {
    var playListType = req.body.playListType;
    var songList = req.body.songList;
    console.log(songList);
    console.log(req.session);
    

    if(playListType === "gym") {
        url = getRandomGymRecommendation(songList);
    } else if (playListType === "tan") {
        url = getRandomTanRecommendation(songList);
    } else {
        url = getRandomLaundryRecommendation(songList);
    }

    res.redirect('/search-tracks');
    // console.log('On modal-input route req.bodies: ' + playListType + '' + songList)
    // console.log('URL:' + url)
});

app.get('/', function(req, res, next) {
    // renders home
    res.render('home');
});

app.get('/testaxios', function(req, res, next) {
    let randomState = randomstring.generate();
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Flogin%2Fcallback&scope=user-read-private%20user-read-email&state=${randomState}&show_dialog=true`);
});

app.get('/testrefresh', function(req, res, next) {
    refreshToken();
    res.send('testing refresh token');
})

app.get('/login', function(req, res, next) {
    res.render('login');
})

app.get('/login/callback', function(req, res, next) {
    //req.query.code = code(if user accepts) req.query.error = error(if user does not accept or error occurs)
    console.log('callback called');
    if(!req.query.error) {
        axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: 
                `grant_type=authorization_code&code=${req.query.code}&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Flogin%2Fcallback`,
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
            clientTokenObj = response.data;
            res.send('received access token');
        })
        .catch((err) => {
            console.error(err);
        })
    } else {
        res.send('You clicked cancel or error occured');
    }
    
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
    res.render('dashboard', {
    });
    // res.send('Profile route');
    // render profile
});

// Creating a new test route to work with rec url params. This is currently 400'ing
app.get('/search', function(req, res, next) {
    axios({
        url: 'https://api.spotify.com/v1/recommendations?limit=5&market=US&seed_genres=pop%2C%20hip-hop&min_danceability=.4&max_danceability=.9&target_danceability=.3&target_energy=.5&min_popularity=50&target_popularity=70&min_tempo=120&max_tempo=140&target_tempo=125" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer BQADRGoxQHhkH8cvjaFZpXJUt0PNh_vXFm99LDcI6Q_7UcsXmiLUTeymQ8OTc3p_O6Ypg9gEtfuoQfJa8FcKJuf-O-ZTiwmjCNcUJB-JpzfC96K8tfHlzlG_rjBxTmtXaQkuXI1b6nfD',
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
          res.render('search', {
            pageTitle: "GTL-Test-Song-Pull",  
            trackSearch: response.data.tracks
        });
      }).catch(function(error) {
          console.error(error);
      });
});



app.get('/display', function(req, res, next) {
    axios({
        url: 'https://api.spotify.com/v1/tracks/?ids=6BvtitRX5lQC87YlA6rq0n,2mtLGVN6xZm93wDG9nvviS,66flQ66BQfCl1yJsaPRNrN,6H0AwSQ20mo62jGlPGB8S6,2rmq49FcJ4U3wh1Z7C9UxE',
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
          //console.log(response.data.tracks)
          res.render('display', {
            pageTitle: "GTL-Test-Song-Pull",  
            songs: response.data.tracks
        });
      }).catch(function(error) {
          console.error(error);
      });
});

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

// Gym reccomend functions

function getRandomGymRecommendation (length){
    const gymGenres = ["club", "dance", "happy", "hip-hop", "party", "drum-and-bass", "edm", "pop", "power-pop", "work-out"];
    let gymGenre = gymGenres[Math.floor(Math.random() * gymGenres.length)];
    let gymDanceability = (Math.random() * (0.3 - .9) + .9).toFixed(1);
    let gymPopularity = (Math.random() * (50 - 100) + 100).toFixed(0);
    let gymUrl = `https://api.spotify.com/v1/recommendations?limit=${length}&market=US&seed_genres=pop%2C%20${gymGenre}&target_danceability=${gymDanceability}&min_energy=0.4&target_popularity=${gymPopularity}&min_tempo=120&max_tempo=140&min_valence=.5`;
   return gymUrl;
};

function getRandomTanRecommendation (length){
    const tanGenres = ["chill", "idm", "indie-pop", "groove", "hip-hop", "indie-pop", "r-n-b", "road-trip", "summer"];
    let tanGenre = tanGenres[Math.floor(Math.random() * tanGenres.length)];
    let tanDanceability = (Math.random() * (0.2 - .7) + .7).toFixed(1);
    let tanPopularity = (Math.random() * (50 - 100) + 100).toFixed(0);
    let tanUrl = `https://api.spotify.com/v1/recommendations?limit=${length}&market=US&seed_genres=pop%2C%20${tanGenre}&target_danceability=${tanDanceability}&min_energy=0.4&target_popularity=${tanPopularity}&min_tempo=100&max_tempo=130&min_valence=.2`;
    return tanUrl;
  };
  
  function getRandomLaundryRecommendation (length){
    const laundryGenres = ["acoustic", "chill", "guitar", "happy", "indie", "study"];
    let laundryGenre = laundryGenres[Math.floor(Math.random() * laundryGenres.length)];
    let laundryDanceability = (Math.random() * (0.1 - .5) + .5).toFixed(1);
    let laundryPopularity = (Math.random() * (50 - 100) + 100).toFixed(0);
    let laundryUrl = `https://api.spotify.com/v1/recommendations?limit=${length}&market=US&seed_genres=pop%2C%20${laundryGenre}&target_danceability=${laundryDanceability}&min_energy=0.2&target_popularity=${laundryPopularity}&min_tempo=90&max_tempo=130&min_valence=.2`;
    return laundryUrl
  };
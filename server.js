const express = require('express');
const app = express();
const db = require('./models');
require('dotenv').config();
const bodyParser = require('body-parser')

const PORT = process.env.PORT;

app.set('view engine', 'ejs');
app.set('views','views');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/* Creating basic routes to test heroku hosting */

app.listen(PORT, () => {
    console.log('GTL Server UP and LISTENING on Port: ' + PORT);
})

app.get('/ping', (req,res,next) => {
    res.send('PONG!')
})

app.get('/test', (req,res,next) => {
    res.render('renderUsers', {
        name: 'Sally',
        email: 'sally99@aol.com'
    })
});

app.get('/api/users', (req,res,next) => {
    db.Users.findAll({ raw: true })
        .then((data) => {
            console.log(data)
            res.render('renderUsers', {
                data
            })
        
        });
});
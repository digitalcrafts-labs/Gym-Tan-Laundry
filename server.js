const express = require('express');
const app = express();
const db = require('./models');
require('dotenv').config();

const PORT = process.env.PORT;




/* Creating basic routes to test heroku hosting */

app.listen(PORT, () => {
    console.log('GTL Server UP and LISTENING on Port: ' + PORT);
})

app.get('/ping', (req,res,next) => {
    res.send('PONG!')
})

app.get('/api/users', (req,res,next) => {
    db.Users.findAll({ raw: true })
        .then((results) => {
            if (results) {
                res.json(results);
            }
        });
});
require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);

const cors = require('cors')

mongoose
  .connect(process.env.DB || 'mongodb://localhost/server', { useNewUrlParser: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// Enable authentication using session + passport
app.use(session({
  secret: 'irongenerator',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

app.use(cors({
  origin: ['http://localhost:3001'],
  credentials: true
}))

require('./passport')(app);

app.use(express.static('public/build'))

// -------------ROUTES-----------

app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/index'))

app.get('*', (req, res) => {
  res.sendFile(`${__dirname}/public/build/index.html`)
})

module.exports = app;

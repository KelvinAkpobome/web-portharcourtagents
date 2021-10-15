const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db')
const ejs = require('ejs')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const app = express();
const errorHandler = require('./utils/error-handler');

//passport config
require('./config/passport')(passport);
//Env
dotenv.config(); 

//DB Config
const db = require('./config/db')

//set the view engiene to ejs 
app.set('view engine', 'ejs');
app.use(express.static("public"));

//Bodyparser
app.use(bodyParser.urlencoded({ extended: false }))

//Express session middleware
app.use(session({
    secret: 'my secret',
    resave: true,
    saveUninitialized: true
  }));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());  

//Global Vars
app.use((req, res, next)=> {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
})

//load config
dotenv.config({path: './config/config.env'});

connectDB();
//connect cookieParser
app.use(cookieParser());  
//Routes and other middlewares

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/users', require('./routes/postListing'));
app.use(function(req, res, next){
  res.status(404);

  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }
});

// global error handler
app.use(errorHandler);

const PORT = process.env.PORT  || 5000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

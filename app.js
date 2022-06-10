require('dotenv').config();
// Define Variables
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require('connect-flash');
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const managerRoutes = require('./routes/manager');
const User = require('./models/user');
const Status = require('./models/status');
const isAuth = require('./middlewares/is-auth');

// Import Controllers
const errorControllers = require("./controllers/error404");

const app = express();
//Create Session Store
const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  colection: "sessions",
});

// Define Template Engine
app.set("view engine", "ejs");
app.set("views", "views");

// Define Static Folder
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, "uploads")));
app.use(
  session({ secret: "secret", resave: false, saveUninitialized: false, store })
);

// Define locals variables
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.isManager = req.session.isManager;
  res.locals.isUser = req.session.isUser;
  next();
})

//Configure Flash
app.use(flash());

// Configure Global Variables
app.use((req, res, next) => {
  const user = req.session.user;
  if(!user){
    return next();
  }
  if(user.role == 'user'){
    return User.findById(user._id)
    .then(u => {
      if(!u){
        return next();
      }
      req.user = u;
      return next();
    })
    .catch(err => console.log(err))

  }
  req.user = user;
  next();
})

app.use((req, res, next) => {
  const status = req.session.status;
  if(!status){
    return next();
  }
  if(req.user.role == 'user'){
    return Status.findOne({userId: status.userId})
    .then(s => {
      if(!s){
        return next();
      }
      req.status = s;
      return next();
    })
    .catch(err => console.log(err))

  }
  req.status = status;
  next();;
})

// Setting routes
app.use('/manager', isAuth, managerRoutes)
app.use(authRoutes);
app.use(userRoutes);
app.use(errorControllers.getError);
app.use((error, req, res, next) => {
  res.status(500).render('500', { pageTitle: 'Error!', css: '500.css' });
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then((result) => {
    app.listen(process.env.PORT || 8000, '0.0.0.0', () => {
      console.log("Server started");
    })
  })
  .catch((err) => console.log(err));

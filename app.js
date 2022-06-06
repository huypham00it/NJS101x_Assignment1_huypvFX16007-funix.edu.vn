// Define Variables
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dbConnect = require("./ultil/database").mongooseConnect;
const userRoutes = require("./routes/user");
const User = require("./models/user");

// Import Controllers
const errorControllers = require("./controllers/error404");
const userController = require("./controllers/user");

const app = express();

// Define Template Engine
app.set("view engine", "ejs");
app.set("views", "views");

// Check User is Logged In
app.use(userController.loggedIn);


// Define Static Folder
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Setting routes
app.use(userRoutes);
app.use(errorControllers.getError);

// Connect to MongoDB
dbConnect()
  .then((result) => {
    User.findOne()
      .then((user) => {
        if (!user) {
          const user = new User({
            name: "Phạm Văn Huy",
            dob: new Date("2000-01-10"),
            salaryScale: 1,
            startDate: new Date("2022-05-31"),
            department: "IT",
            annualLeave: 5,
            image: "/assets/images/avatar.jpg",
          });
          user.save();
        }
        app.listen(3000);
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));

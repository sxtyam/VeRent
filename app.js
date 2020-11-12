require('dotenv').config()
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require("express-session")
var passport = require('passport')
var LocalStrategy = require('passport-local')
var fs = require("fs");
var path = require('path');
var multer = require('multer');
var User = require("./models/user.js");
const Vehicle = require('./models/vehicle.js');
const Transaction = require('./models/transaction.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/VeRent', { useNewUrlParser: true, useUnifiedTopology: true })
// mongoose.connect("mongodb://localhost/VeRent", { useNewUrlParser: true, useUnifiedTopology: true });

// SETTING UP PATH FOR MULTER

app.use(multer({ dest: './tempUploads/' }).single('uploadedImage'));


// =======================
// AUTHENTICATION SETUP
// =======================

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!(user.password === password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.use(express.static("public"));
app.use(session({ secret: "Shhhh! This is a secret!" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


// ================
// ROUTES
// ================

app.get("/", function (req, res) {
  res.render("index.ejs", { loggedIn: req.isAuthenticated(), user: req.user });
})

app.get("/contactUs", function (req, res) {
  res.render("contactUs.ejs");
})

app.get("/services", function (req, res) {
  res.render("services.ejs");
})


// =============
// ADD VEHICLE
// =============

app.get("/addVehicle", function (req, res) {
  res.render("addVehicle.ejs");
})

app.post("/addVehicle", function (req, res) {
  // Creating a new Vehicle Class
  Vehicle.create({
    plateNumber: req.body.plateNumber,
    model: req.body.model,
    KMsTravelled: req.body.travelled,
    rating: 0,
    isAvailable: true,
    vehicleType: req.body.vehicleType,
    // Adding image paprameters, which were earlier stored in req.file using multer
    image: {
      data: fs.readFileSync(req.file.path),
      contentType: 'image/png'
    },
    dailyRent: req.body.dailyRent,
    transictions: []
  }, function (err, newVehicle) {
    if (err) {
      console.log(err)
    } else {
      console.log("Added a new Vehicle!")
      // When Vehicle has been added into the databse, fs.unlink will delete the file stored in tempUploads folder by multer
      fs.unlink(req.file.path, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Temporary file has been deleted!");
        }
      });
      res.redirect("/");
    }
  })
})


// ================
// DELETE VEHICLE
// ================

app.post("/delete/:vehicleId", function (req, res) {
  Vehicle.findById(req.params.vehicleId, function (err, foundVehicle) {
    if (err) {
      console.log(err);
    }
    if (foundVehicle) {
      var vehicleType = foundVehicle.vehicleType;
      // Before deleting the vehicle, deleting all the transactions of that vehicle (as they are not required anymore);
      Transaction.deleteMany({ vehicle: req.params.vehicleId }, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Transactions related to the vehicle (about to be deleted) has been deleted!");
          Vehicle.deleteOne({ _id: req.params.vehicleId }, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("Vehicle has been deleted!");
              var redirectPath = "/display/" + vehicleType + "/all";
              res.redirect(redirectPath);
            }
          });
        }
      })
    } else {
      console.log("Vehicle not found!");
      res.redirect("/");
    }
  });
})


// =================
// DISPLAY VEHICLES
// =================

app.get("/display/:vehicleType/all", function (req, res) {
  Vehicle.find({ vehicleType: req.params.vehicleType }, function (err, foundVehicles) {
    if (err) {
      console.log(err);
    } else {
      res.render("displayVehicles.ejs", { vehicles: foundVehicles });
    }
  })
})


// =====================
// DISPLAY EACH VEHICLE
// =====================

app.get("/display/:vehicleId", function (req, res) {
  Vehicle.findById(req.params.vehicleId, function (err, foundVehicle) {
    if (err) {
      console.log(err);
    } else {
      res.render("vehicle.ejs", { vehicle: foundVehicle });
    }
  })
});


// ============
// RENT ROUTE
// ============

app.post("/rent/:vehicleId", function (req, res) {
  console.log("Sent a post request!");
  if (!req.isAuthenticated()) {
    console.log("Not authenticated!");
    res.redirect("/login");
  } else {
    Vehicle.findById(req.params.vehicleId, function (err, foundVehicle) {
      if (err) {
        console.log(err);
      } else {
        Transaction.create({
          renter: req.user,
          vehicle: foundVehicle,
          date: Date.now()
        }, function (err, newTransaction) {
          if (err) {
            console.log(err);
          } else {
            console.log("New transaction has been created!");
            // req.user.transactions.push(newTransaction);
            foundVehicle.isAvailable = false;
            foundVehicle.save();
            User.findById(req.user._id, function(err, foundUser) {
              if(err) {
                console.log(err);
              } else {
                foundUser.transactions.push(newTransaction);
                console.log("Added transaction into the user database!");
                foundUser.save();
                res.redirect("/");
              }
            })
          }
        })
      }
    })
  }
})


// ===========================
// TRANSACTIONS FOR A VEHICLE
// ===========================

app.get("/transactions/:vehicleId", function (req, res) {

})


// ================
// LOGIN
// ================

app.get("/login", function (req, res) {
  res.render("login.ejs");
})

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);


// ================
// SIGNUP
// ================

app.get("/signup", function (req, res) {
  res.render("signup.ejs");
})

app.post("/signup", function (req, res) {
  User.create({
    username: req.body.username,
    password: req.body.password
  }, function (err, newUser) {
    if (err) {
      console.log(err)
    } else {
      console.log("Welcome " + newUser.username);
      res.redirect("/login");
    }
  })
})


// ================
// LOGOUT
// ================

app.get("/logout", function (req, res) {
  req.logout();
  console.log("User has been logged out successfully!");
  res.redirect("/");
});


// ========================
// ROUTE TO DISPLAY IMAGE
// ========================

app.get('/displayImage/:vehicleId', function (req, res, next) {
  Vehicle.findById(req.params.vehicleId, function (err, vehicle) {
    if (err) {
      return next(err);
    }
    if (vehicle) {
      res.contentType(vehicle.image.contentType);
      res.send(vehicle.image.data);
    } else res.send("No image found!");
  });
});


//  ================
// SERVER LISTENING
// =================

app.listen(3000, function () {
  console.log("Server has been started!");
})

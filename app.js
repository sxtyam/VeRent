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
var flash = require('connect-flash');
var User = require("./models/user.js");
const Vehicle = require('./models/vehicle.js');
const Transaction = require('./models/transaction.js');
const Review = require('./models/review.js');

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
app.use(flash());

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
  res.render("index.ejs", { loggedIn: req.isAuthenticated(), admin: (req.user && req.user.username === 'admin') });
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
  Vehicle.find({ vehicleType: req.params.vehicleType, isAvailable: true }, function (err, foundVehicles) {
    if (err) {
      console.log(err);
    } else {
      res.render("displayVehicles.ejs", {
        vehicles: foundVehicles,
        loggedIn: req.isAuthenticated(),
        admin: (req.user && req.user.username === 'admin')
      });
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
      let foundReviews = [];
      if (foundVehicle.reviews.length === 0) {
        res.render("vehicle.ejs", {
          vehicle: foundVehicle,
          loggedIn: req.isAuthenticated(),
          admin: (req.user && req.user.username === 'admin'),
          reviews: foundReviews
        });
      }
      foundVehicle.reviews.forEach((review) => {
        Review.findById(review, function (err, foundReview) {
          if (err) {
            console.log(err);
          } else {
            console.log("Found Review:");
            console.log(foundReview);
            foundReviews.push(foundReview);
            if (foundReviews.length === foundVehicle.reviews.length) {
              res.render("vehicle.ejs", {
                vehicle: foundVehicle,
                loggedIn: req.isAuthenticated(),
                admin: (req.user && req.user.username === 'admin'),
                reviews: foundReviews
              });
            }
          }
        })
      });
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
            foundVehicle.isAvailable = false;
            foundVehicle.save();
            User.findById(req.user._id, function (err, foundUser) {
              if (err) {
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


// ===============
// PROFILE PAGE
// ===============

app.get('/user/me', function (req, res) {
  if (req.isAuthenticated) {
    let newTransactions = [];
    if (req.user.transactions.length === 0) {
      res.render('profile.ejs', {
        user: req.user,
        transactions: newTransactions,
        admin: (req.user && req.user.username === 'admin')
      });
    }
    req.user.transactions.forEach((transaction) => {
      Transaction.findById(transaction, function (err, foundTransaction) {
        if (err) {
          console.log(err);
        } else {
          Vehicle.findById(foundTransaction.vehicle, function (err, foundVehicle) {
            if (err) {
              console.log(err);
            } else {
              let newTransaction = {
                id: foundTransaction.id,
                date: foundTransaction.date,
                returnedOn: foundTransaction.returnedOn,
                vehicle: {
                  model: foundVehicle.model,
                }
              };
              if (foundTransaction.returnedOn) {
                Review.findById(foundTransaction.review, function (err, foundReview) {
                  let review = {
                    review: foundReview.review,
                    rating: foundReview.rating
                  }
                  newTransaction = {
                    ...newTransaction,
                    review,
                    totalCost: foundTransaction.totalCost
                  }
                  newTransactions.push(newTransaction);
                  if (newTransactions.length === req.user.transactions.length) {
                    res.render('profile.ejs', {
                      user: req.user,
                      transactions: newTransactions,
                      admin: (req.user && req.user.username === 'admin')
                    });
                  }
                })
              } else {
                newTransactions.push(newTransaction);
                if (newTransactions.length === req.user.transactions.length) {
                  res.render('profile.ejs', {
                    user: req.user,
                    transactions: newTransactions,
                    admin: (req.user && req.user.username === 'admin')
                  });
                }
              }
            }
          })
        }
      })
    })
  } else {
    res.redirect('/login');
  }
})


// ================
// RETURN VEHICLE
// ================

app.get('/return/:transactionId', function (req, res) {
  Transaction.findById(req.params.transactionId, function (err, foundTransaction) {
    if (err) {
      console.log(err);
    } else {
      Vehicle.findById(foundTransaction.vehicle, function (err, foundVehicle) {
        if (err) {
          console.log(err);
        } else {
          res.render('returnVehicle.ejs', { transaction: foundTransaction, vehicle: foundVehicle });
        }
      })
    }
  })
})


// ==================================
// RETURNING VEHICLE IN THE DATABASE
// ==================================

app.post('/return/:transactionId', function (req, res) {
  // Changing strings returned from the form into integers
  req.body.kmsTravelled = parseInt(req.body.kmsTravelled);
  req.body.rating = parseInt(req.body.rating);
  Transaction.findById(req.params.transactionId, function (err, foundTransaction) {
    if (err) {
      console.log(err);
    } else {
      Vehicle.findById(foundTransaction.vehicle, function (err, foundVehicle) {
        if (err) {
          console.log(err);
        } else {
          Review.create({
            review: req.body.review,
            rating: req.body.rating,
            transaction: foundTransaction,
            user: req.user.username
          }, function (err, newReview) {
            if (err) {
              console.log(err)
            } else {
              foundVehicle.reviews.push(newReview);
              foundVehicle.KMsTravelled = foundVehicle.KMsTravelled + req.body.kmsTravelled;
              let oldTotalRating = (foundVehicle.rating * (foundVehicle.reviews.length - 1));
              oldTotalRating += req.body.rating;
              let newRating = oldTotalRating / (foundVehicle.reviews.length);
              foundVehicle.rating = newRating;
              foundVehicle.isAvailable = true;
              foundVehicle.save();

              foundTransaction.returnedOn = Date.now();
              foundTransaction.totalCost = Math.ceil((Date.now() - foundTransaction.date) / (24 * 60 * 60 * 1000)) * foundVehicle.dailyRent;
              foundTransaction.review = newReview;
              foundTransaction.KMsTravelled = req.body.kmsTravelled;
              foundTransaction.save();
              res.redirect('/user/me');
            }
          })
        }
      })
    }
  })
})


// ================
// LOGIN
// ================

app.get("/login", function (req, res) {
  res.render("logIn.ejs", { failedLogin: false });
})

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/failedlogin',
    failureFlash: true
  })
);


// =================
// FAILED LOGIN
// =================

app.get('/failedlogin', function (req, res) {
  res.render('logIn.ejs', { failedLogin: true });
})


// ================
// SIGNUP
// ================

app.get("/signup", function (req, res) {
  res.render("signUp.ejs", { failedSignup: false });
})

app.post("/signup", function (req, res) {
  console.log("entering");
  User.findOne({ username: req.body.username }, function(err, foundUser) {
    if(err) {
      console.log(err);
    } else {
      if(foundUser) {
        res.render('signUp.ejs', { failedSignup: true });
      } else {
        User.create({
          fullname: req.body.fullname,
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
      }
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

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has been started!");
})

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
const Vehicle = require('./models/Vehicle.js');

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
            fs.unlink(req.file.path, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("File has been deleted Successfully!");
                }
            });
            res.redirect("/");
        }
    })
})


// ================
// DELETE VEHICLE
// ================

app.post("/:vehicleType/delete/:vehicleId", function (req, res) {
    Vehicle.deleteOne({ _id: req.params.vehicleId }, function (err) {
        if (err) {
            console.log(err);
        } else {
            var redirectPath = "/display/" + req.params.vehicleType + "/all";
            res.redirect(redirectPath);
        }
    })
})


// ================
// DISPLAY VEHICLE
// ================

app.get("/display/:vehicleType/all", function (req, res) {
    Vehicle.find({ vehicleType: req.params.vehicleType }, function (err, foundVehicles) {
        if (err) {
            console.log(err);
        } else {
            res.render("displayVehicles.ejs", { vehicles: foundVehicles });
        }
    })
})


// ================
// LOGIN
// ================

app.get("/logIn", function (req, res) {
    res.render("logIn.ejs");
})

app.post('/logIn',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/logIn',
        failureFlash: true
    })
);


// ================
// SIGNUP
// ================

app.get("/signUp", function (req, res) {
    res.render("signUp.ejs");
})

app.post("/signUp", function (req, res) {
    User.create({
        username: req.body.username,
        password: req.body.password
    }, function (err, newUser) {
        if (err) {
            console.log(err)
        } else {
            console.log("Welcome " + newUser.username);
            res.redirect("/logIn");
        }
    })
})


// ================
// LOGOUT
// ================

app.get("/logOut", function (req, res) {
    req.logout();
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

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require("express-session")
var passport = require('passport')
var LocalStrategy = require('passport-local')
var fs = require("fs");
var multer = require('multer');
var Bicycle = require("./models/bicycle.js");
var Car = require("./models/car.js");
var Bike = require("./models/bike.js");
var User = require("./models/user.js");
var Image = require("./models/image.js");
const Vehicle = require('./models/Vehicle.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

mongoose.connect("mongodb://localhost/VeRent", { useNewUrlParser: true, useUnifiedTopology: true });


// =========================
// IMAGE SAVING IN DATABASE
// =========================

// SETTING UP PATH FOR MULTER

// app.use(multer({
//     dest: './uploads/',
//     rename: function (fieldname, filename) {
//         return filename;
//     },
// }));

// var multer = require('multer');
// var upload = multer({ dest: './uploads' });

app.use(multer({ dest: './uploads/' }).single('uploadedImage'));
// app.use(multer({dest:'./uploads/'}).array(...));
// app.use(multer({dest:'./uploads/'}).fields(...));


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

// ===============
// BIKES
// ===============

app.get("/bikes", function (req, res) {
    Bike.find({}, function (err, foundBikes) {
        if (err) {
            console.log(err);
        } else {
            res.render("bikes.ejs", { bikes: foundBikes });
        }
    })
})

app.get("/bikes/add", function (req, res) {
    res.render("addBikes.ejs");
})

app.post("/bikes", function (req, res) {
    Bike.create({
        PlateNumber: req.body.plateNumber,
        Model: req.body.model,
        KMsTravelled: req.body.travelled,
        Rating: 0,
        isAvailable: true
    }, function (err, newBike) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/bikes");
        }
    })
})

app.post("/bike/delete/:bikeId", function (req, res) {
    Bike.deleteOne({ _id: req.params.bikeId }, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/bikes");
        }
    })
})


// ==================
// BICYCLES
// ==================

app.get("/bicycles", function (req, res) {
    Bicycle.find({}, function (err, foundBicycles) {
        if (err) {
            console.log(err);
        } else {
            res.render("bicycles.ejs", { bicycles: foundBicycles });
        }
    })
})

app.get("/bicycles/add", function (req, res) {
    res.render("addBicycles.ejs");
})

app.post("/bicycles", function (req, res) {
    Bicycle.create({
        Model: req.body.model,
        Rating: 0,
        isAvailable: true
    }, function (err, newBicycle) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/bicycles");
        }
    })
})

app.post("/bicycle/delete/:bicycleId", function (req, res) {
    Bicycle.deleteOne({ _id: req.params.bicycleId }, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/bicycles");
        }
    })
})


// ===============
// CARS
// ===============

app.get("/cars", function (req, res) {
    Car.find({}, function (err, foundCars) {
        if (err) {
            console.log(err);
        } else {
            res.render("cars.ejs", { cars: foundCars });
        }
    })
})

app.get("/cars/add", function (req, res) {
    res.render("addCars.ejs");
})

app.post("/cars", function (req, res) {
    Car.create({
        PlateNumber: req.body.plateNumber,
        Model: req.body.model,
        KMsTravelled: req.body.travelled,
        Rating: 0,
        isAvailable: true
    }, function (err, newCar) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/cars");
        }
    })
})

app.post("/car/delete/:carId", function (req, res) {
    Car.deleteOne({ _id: req.params.carId }, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/cars");
        }
    })
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
    // var newImage = new Image();
    // newImage.img.data = fs.readFileSync(req.file.path)
    // newImage.img.contentType = 'image / png';
    // newImage.save();
    console.log("Image has been save in the database!");
    Vehicle.create({
        plateNumber: req.body.plateNumber,
        model: req.body.model,
        KMsTravelled: req.body.travelled,
        rating: 0,
        isAvailable: true,
        vehicleType: req.body.vehicleType,
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
            res.redirect("/");
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


// Rough route

app.get('/display', function (req, res, next) {
    Vehicle.findOne({ vehicleType: "car" }, function (err, vehicle) {
        if (err) return next(err);
        if (vehicle) {
            res.contentType(vehicle.image.contentType);
            // res.setHeader('content-type', vehicle.image.contentType);
            res.send(vehicle.image.data);
        } else res.send("");
    });
});


// =============
// IMAGE UPLOAD
// =============

// app.post('/api/photo', function (req, res) {
//     var newImage = new Image();
//     newImage.img.data = fs.readFileSync(req.file.path)
//     newImage.img.contentType = 'image / png';
//     newImage.save();
//     console.log("Image has been submitted!");
// });


//  ================
// SERVER LISTENING
// =================

app.listen(3000, function () {
    console.log("Server has been started!");
})

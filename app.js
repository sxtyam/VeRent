var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Bicycle = require("./models/bicycle.js");
var Car = require("./models/car.js");
var Bike = require("./models/bike.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

mongoose.connect("mongodb://localhost/VeRent", {useNewUrlParser: true, useUnifiedTopology: true});

// Routes

app.get("/", function(req, res) {
    res.render("index.ejs");
})

app.get("/bikes", function(req, res) {
    Bike.find({}, function(err, foundBikes) {
        if(err) {
            console.log(err);
        } else {
            res.render("bikes.ejs", {bikes: foundBikes});
        }
    })
})

app.get("/bikes/add", function(req, res) {
    res.render("addBikes.ejs");
})

app.post("/bikes", function(req, res) {
    Bike.create({
        PlateNumber: req.body.plateNumber,
        Model: req.body.model,
        KMsTravelled: req.body.travelled,
        Rating: 0,
        isAvailable: true
    }, function(err, newBike) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/bikes");
        }
    })
})

app.post("/bike/delete/:bikeId", function(req, res) {
    Bike.deleteOne({ _id: req.params.bikeId }, function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/bikes");
        }
    })
})

app.get("/bicycles", function(req, res) {
    Bicycle.find({}, function(err, foundBicycles) {
        if(err) {
            console.log(err);
        } else {
            res.render("bicycles.ejs", {bicycles: foundBicycles});
        }
    })
})

app.get("/bicycles/add", function(req, res) {
    res.render("addBicycles.ejs");
})

app.post("/bicycles", function(req, res) {
    Bicycle.create({
        Model: req.body.model,
        Rating: 0,
        isAvailable: true
    }, function(err, newBicycle) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/bicycles");
        }
    })
})

app.post("/bicycle/delete/:bicycleId", function(req, res) {
    Bicycle.deleteOne({ _id: req.params.bicycleId }, function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/bicycles");
        }
    })
})

app.get("/cars", function(req, res) {
    Car.find({}, function(err, foundCars) {
        if(err) {
            console.log(err);
        } else {
            res.render("cars.ejs", {cars: foundCars});
        }
    })
})

app.get("/cars/add", function(req, res) {
    res.render("addCars.ejs");
})

app.post("/cars", function(req, res) {
    Car.create({
        PlateNumber: req.body.plateNumber,
        Model: req.body.model,
        KMsTravelled: req.body.travelled,
        Rating: 0,
        isAvailable: true
    }, function(err, newCar) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/cars");
        }
    })
})

app.post("/car/delete/:carId", function(req, res) {
    Car.deleteOne({ _id: req.params.carId }, function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/cars");
        }
    })
})

app.get("/contactUs", function(req, res) {
    res.render("contactUs.ejs");
})

app.get("/services", function(req, res) {
    res.render("services.ejs");
})

app.get("/logIn", function(req, res) {
    res.render("logIn.ejs");
})

app.get("/signUp", function(req, res) {
    res.render("signUp.ejs");
})



app.listen(3000, function() {
    console.log("Server has been started!");
})

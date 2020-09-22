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

app.get("/bicycles", function(req, res) {
    res.render("bicycles.ejs");
})

app.get("/cars", function(req, res) {
    res.render("cars.ejs");
})

app.get("/contactUs", function(req, res) {
    res.render("contactUs.ejs");
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
    // console.log(req.body);
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

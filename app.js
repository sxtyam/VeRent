var express = require('express');
var app = express();
var mongoose = require('mongoose');

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
    res.render("bikes.ejs");
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

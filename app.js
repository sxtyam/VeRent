var express = require('express');
var app = express();

app.use(express.static(__dirname + "/public"));

// Routes

// Added for testing branches

app.get("/", function(req, res) {
    res.render("index.ejs");
})

app.get("/aboutUs", function(req, res) {
    res.render("aboutUs.ejs");
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



app.listen(3000, function() {
    console.log("Server has been started!");
})

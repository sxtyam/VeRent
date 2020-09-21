var mongoose = require('mongoose');

var bikeSchema = mongoose.Schema({
    PlateNumber: String,
    Model: String,
    KMsTravelled: Number,
    Rating: Number,
    isAvaialble: Boolean
})

module.exports = mongoose.model("Bike", bikeSchema);
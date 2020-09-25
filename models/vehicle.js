var mongoose = require('mongoose');

var vehicleSchema = mongoose.Schema({
    Model: String,
    Rating: {
        type: Number,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model("Bicycle", bicycleSchema);
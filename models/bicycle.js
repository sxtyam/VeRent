var mongoose = require('mongoose');

var bicycleSchema = mongoose.Schema({
    Model: String,
    Rating: {
        type: Number,
        default: 0
    },
    isAvaialble: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model("Bicycle", bicycleSchema);
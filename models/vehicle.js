var mongoose = require('mongoose');

var vehicleSchema = mongoose.Schema({
    plateNumber: {
        type: String,
        unique: true,
        required: true
    },
    model: String,
    vehicleType: String,
    KMsTravelled: {
        type: Number,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
    dailyRent: Number,
    transictions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transiction"
        }
    ],
    rating: Number
})

module.exports = mongoose.model("Vehicle", vehicleSchema);
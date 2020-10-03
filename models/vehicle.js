var mongoose = require('mongoose');

var vehicleSchema = mongoose.Schema({
    plateNumber: String,
    model: String,
    vehicleType: String,
    KMsTravelled: {
        type: Number,
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
    transactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction"
        }
    ],
    rating: Number
})

module.exports = mongoose.model("Vehicle", vehicleSchema);
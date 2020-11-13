var mongoose = require('mongoose');

var transactionSchema = mongoose.Schema({
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle"
  },
  date: {
    type: Date,
    default: Date.now()
  },
  returnedOn: Date,
  totalCost: Number,
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review"
  },
  KMsTravelled: Number
})

module.exports = mongoose.model("Transaction", transactionSchema);
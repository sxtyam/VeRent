var mongoose = require('mongoose');

var reviewSchema = mongoose.Schema({
  review: String,
  rating: Number,
  user: String,
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction"
  }
})

module.exports = mongoose.model("Review", reviewSchema);
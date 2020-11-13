var mongoose = require('mongoose')

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction"
    }
  ]
})

module.exports = mongoose.model("User", userSchema);
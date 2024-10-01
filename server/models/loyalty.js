const mongoose = require("mongoose");

const loyaltySchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  points: {
    type: Number,
    default: 0,
  },

  redeemed: {
    type: Boolean,
    default: false,
  },

  redemptionDate: {
    type: Date,
  },
});

module.exports = mongoose.model("Loyalty", loyaltySchema);

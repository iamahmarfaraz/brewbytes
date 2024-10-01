const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  }, 

  method: {
    type: String,
    // required: true,
  }, // Payment method (Credit card, PayPal, etc.)

  paymentStatus: {
    type: String,
    enum : [ "Pending", "Completed", "Failed" ],
    default: "Pending",
  }, // Payment status (Pending, Completed, Failed)

  paymentDate: {
    type: Date,
    default: Date.now,
  }, 

});

module.exports = mongoose.model("Payment", paymentSchema);

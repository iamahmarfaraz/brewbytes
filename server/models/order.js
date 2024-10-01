const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Reference to customer who placed the order

  items: [
    {
      // List of ordered items
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
        required: true,
      }, // Reference to inventory item
      quantity: { type: Number, required: true }, // Quantity of each item ordered
      price: { type: Number, required: true }, // Price at time of order
    },
  ],
  
  totalAmount: {
    type: Number,
    required: true,
  }, 

  orderDate: {
    type: Date,
    default: Date.now,
  }, 

  status: {
    type: String,
    enum: ["Pending", "Delivered", "Canceled"],
    default: "Pending",
  }, 

  loyaltyPointsEarned: {
    type: Number,
  }, 
  
  paymentStatus: {
    type: String,
    enum : ["Paid","Unpaid"],
    default: "Unpaid",
  }, 

});

module.exports = mongoose.model('Order', orderSchema);
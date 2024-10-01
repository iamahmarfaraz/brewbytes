const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  accountType: {
    type: String,
    enum: ["Customer", "Admin"],
    default: "Customer",
    required: true,
  },

  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  purchase:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  }],

  image: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: function () {
      return this.accountType === "customer";
    }, // Address only required for customers
  },

  loyaltyPoints: {
    type: Number,
    default: 0,
    required: function () {
      return this.accountType === "customer";
    }, // Loyalty points only for customers
  },
  logs:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Log",
  }],

  createdAt: {
    type: Date,
    default: Date.now,
  },
  
});

const User = mongoose.model("User", userSchema);
module.exports = User;

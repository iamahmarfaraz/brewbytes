const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    enum: ["Coffee", "Pastry", "Specials"],
	  required: true,
  }, 

  quantity: {
    type: Number,
    required: true,
  },
  image:{
    type:String,
    required:true
  }, 

  price: {
    type: Number,
    required: true,
  }, 

  description: {
    type: String,
  }, 

  available: {
    type: Boolean,
    default: true,
  },
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  orders:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Order"
  } ],

  lastUpdated: {
    type: Date,
    default: Date.now,
  }, 

});

module.exports = mongoose.model("Inventory", inventorySchema);

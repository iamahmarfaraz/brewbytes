const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  menuItems :[ {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
    required: true,
  }]
});

module.exports = mongoose.model("Menu",menuSchema);

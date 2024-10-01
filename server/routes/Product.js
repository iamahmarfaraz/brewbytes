const express = require("express");
const router = express.Router();

const {getAvailableProducts,getProductAllDetails} = require("../controllers/product")

const {getMenuItems} = require("../controllers/menu");

router.get("/getAvailableProducts",getAvailableProducts);
router.get("/getProductAllDetails",getProductAllDetails);
router.get("/getMenuItems",getMenuItems);

module.exports = router;
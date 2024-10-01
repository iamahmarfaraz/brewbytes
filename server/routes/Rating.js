const express = require("express");
const router = express.Router();
const {auth,isCustomer} = require("../middlewares/auth");

const {
    createRatingAndReview,
    updateRatingAndReview,
    deleteRatingAndReview,
    getRatingsAndReviewsForItem
} = require("../controllers/ratingAndReview")



// ********************************************************************************************************
//                                      Rating & Reviews routes
// ********************************************************************************************************

router.post("/createRating",auth,isCustomer,createRatingAndReview);
router.put("/updateRating",auth,isCustomer,updateRatingAndReview);
router.delete("/deleteRating",auth,deleteRatingAndReview);
router.get("/getRatings",getRatingsAndReviewsForItem);

module.exports = router;

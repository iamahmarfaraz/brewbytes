const RatingAndReview = require("../models/ratingAndReview");
const Inventory = require("../models/inventory");

// Create a new rating and review
exports.createRatingAndReview = async (req, res) => {
    try {
        const { rating, review, itemId } = req.body;
        const {userId} = req.body.id;

        // Check if the item exists
        const item = await Inventory.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found" 
            });
        }

        // Create a new rating and review
        const newRatingAndReview = new RatingAndReview({
            user: userId,
            rating,
            review,
            items: itemId,
        });

        await newRatingAndReview.save();

        // Push the new review to the inventory's ratingAndReviews array
        item.ratingAndReviews.push(newRatingAndReview._id);
        await item.save();

        res.status(201).json({
            success: true,
            message: "Rating and review created successfully",
            newRatingAndReview 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error creating rating and review", 
            error 
        });
    }
};

// Update a rating and review
exports.updateRatingAndReview = async (req, res) => {
    try {
        // const { reviewId } = req.params;
        const {itemId, rating, review } = req.body;
        const {userId} = req.user.id;

        // Find the rating and review
        const ratingAndReview = await RatingAndReview.findOne({
            user: userId,
            items: itemId,
          });

        if (!ratingAndReview) {
            return res.status(404).json({
                success: false,
                message: "Rating and review not found" 
            });
        }

        // Update the rating and review
        ratingAndReview.rating = rating;
        ratingAndReview.review = review;
        await ratingAndReview.save();

        res.status(200).json({ 
            success: true,
            message: "Rating and review updated successfully", 
            ratingAndReview 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error updating rating and review", 
            error 
        });
    }
};

// Delete a rating and review
exports.deleteRatingAndReview = async (req, res) => {
    try {
        // const { reviewId } = req.params;
        const {itemId} = req.body;
        const {userId} = req.user.id;

        // Find and delete the rating and review
        const ratingAndReview = await RatingAndReview.findOneAndDelete({
            user: userId,
            items: itemId,
          });

        if (!ratingAndReview) {
            return res.status(404).json({ 
                success: false,
                message: "Rating and review not found" 
            });
        }

        // Remove the review reference from the corresponding inventory item
        await Inventory.findByIdAndUpdate(ratingAndReview.items, {
            $pull: { ratingAndReviews: reviewId }
        });

        res.status(200).json({ success: true,
            message: "Rating and review deleted successfully" 
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error deleting rating and review", 
            error 
        });
    }
};

// Get all ratings and reviews for a specific item
exports.getRatingsAndReviewsForItem = async (req, res) => {
    try {
        const { itemId } = req.body;

        // Find all ratings and reviews for the item
        const ratingsAndReviews = await RatingAndReview.find({ items: itemId })
            .populate("user", "name email") // Populate user details
            .exec();

        res.status(200).json({ 
            success: true,
            message: "Ratings and reviews fetched successfully", 
            ratingsAndReviews 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching ratings and reviews", 
            error 
        });
    }
};

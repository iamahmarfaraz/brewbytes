const Inventory = require("../models/inventory");

// Get All Products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Inventory.find();

        res.status(200).json({
            success: true,
            message: 'All products fetched successfully',
            products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error,
        });
    }
};


// Get Available Products with Quantity > 0
exports.getAvailableProducts = async (req, res) => {
    try {
        // Find products that are available and have a quantity greater than 0
        const products = await Inventory.find({
            available: true,
            quantity: { $gt: 0 }, // MongoDB query operator for "greater than"
        });

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No products available with quantity greater than 0',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Available products fetched successfully',
            data:products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching available products',
            error,
        });
    }
};

// Get Product Details (with associated orders)
exports.getProductAllDetails = async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await Inventory.findById(productId)
            // .populate({
            //     path: 'orders',
            //     populate: {
            //         path: 'customer', // Populates customer details in orders
            //         select: 'name email', // Select fields to populate
            //     },
            //     select: 'items totalAmount status orderDate', // Select fields to show in orders
            // })
            .populate({
                path: 'ratingAndReviews',
                populate: {
                    path: 'user', // Populate user field from the RatingAndReview model
                    select: 'name email', // Specify which fields to return from the User model
                }
            }).exec();

            

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }
        console.log("This is All the details of a Product :- ",product);

        res.status(200).json({
            success: true,
            message: 'Product details fetched successfully',
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product details',
            error,
        });
    }
};

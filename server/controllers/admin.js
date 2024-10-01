const Inventory = require('../models/inventory');
const Order = require('../models/order');
const Log = require('../models/log');
const User = require('../models/user');

// Add Product (use middleware)
exports.addProduct = async (req, res) => {
    try {
        const { itemName, category, quantity, price, description, available } = req.body;
        const image = req.file.productImage

        if(!itemName || !category || !quantity || !price || !description || !image){
            return res.status(400).json({
                success:false,
                message:"All Fields are required "
            });
        }

        // Upload Image to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(image,process.env.FOLDER_NAME);

        

        const product = new Inventory({
            itemName,
            category,
            quantity,
            price,
            description,
            image : thumbnailImage.secure_url,
            available:true,
        });
        await product.save();

        const logEntry = new Log({
            userId: req.user._id,
            action: 'CREATE',
            details: `Product added: ${itemName}`,
        });
        await logEntry.save();

        res.status(200).json({
            success: true,
            message: 'Product added successfully', product 
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding product', error 
        });
    }
};

// Update Product 
exports.updateProduct = async (req, res) => {
    try {

        const { productId } = req.body;
        const updates = {};

        // If Thumbnail Image is found, update it
        if (req.files) {
            console.log("thumbnail update");
            const image = req.files.productImage;
            const thumbnailImage = await uploadImageToCloudinary(
            image,
            process.env.FOLDER_NAME
            );
            updates.image = thumbnailImage.secure_url;
        }

        // Add fields to be updated only if they are provided in req.body
        if (req.body.itemName) updates.itemName = req.body.itemName;
        if (req.body.category) updates.category = req.body.category;
        if (req.body.quantity) updates.quantity = req.body.quantity;
        if (req.body.price) updates.price = req.body.price;
        if (req.body.description) updates.description = req.body.description;
        if (req.body.available !== undefined) updates.available = req.body.available;
        updates.lastUpdated = Date.now();

        const updatedProduct = await Inventory.findByIdAndUpdate(productId, updates, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found' 
            });
        }

        const logEntry = new Log({
            userId: req.user._id,
            action: 'UPDATE',
            details: `Product updated: ${updatedProduct.itemName}`,
        });
        await logEntry.save();


        res.status(200).json({
            success: true,
            message: 'Product updated successfully', updatedProduct
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ 
            message: 'Error updating product', error
        });
    }
};

// Delete Product (Admin-only access)
exports.deleteProduct = async (req, res) => {
    try {

        const { productId } = req.body;

        if(!productId){
            return res.status(400).json({
                success:false,
                message:"All Fields are required "
            });
        }

        const deletedProduct = await Inventory.findByIdAndDelete({_id : productId});

        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found' 
            });
        }

        // Pull the entire item (including item, quantity, and price) from all orders' items array
        await Order.updateMany(
            { "items.item": productId }, // Find orders that contain the product
            { $pull: { items: { item: productId } } } // Pull the entire item object from the items array
        );

        const logEntry = new Log({
            userId: req.user._id,
            action: 'DELETE',
            details: `Product deleted: ${deletedProduct.itemName}`,
        });
        await logEntry.save();

        res.status(200).json({ 
            success: true,
            message: 'Product deleted successfully',
            deletedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product', error 
        });
    }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId,status } = req.body;

        if(!orderId || !status){
            return res.status(400).json({
                success:false,
                message:"All Fields are required "
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found' 
            });
        }

        const logEntry = new Log({
            userId: req.user._id,
            action: 'UPDATE_ORDER_STATUS',
            details: `Order ID: ${orderId} status updated to ${status}`,
        });
        await logEntry.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully', 
            updatedOrder 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error updating order status', 
            error 
        });

    }
};

// View All Logs (Admin-only access)
exports.viewLogs = async (req, res) => {
    try {

        const logs = await Log.find().populate('userId', 'name email');

        if(!logs){
            return res.status(404).json({
                success:false,
                message:"logs not found "
            });
        }

        res.status(200).json({
            success: true,
            data:logs 
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching logs',
            error 
        });
    }
};

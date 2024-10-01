const Menu = require('../models/menu');
const Inventory = require('../models/inventory');

// Get all menu items with details
exports.getMenuItems = async (req, res) => {
    try {
        const menu = await Menu.findOne().populate({
            path: 'menuItems',
            model: 'Inventory'
        });

        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menu not found' 
            });
        }

        console.log("MENU ITEMS :- ",menu.menuItems);
        res.status(200).json({
            success: true,
            message:"Menu Item Fetched Successfully",
            data : menu.menuItems,
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching menu', 
            error 
        });
    }
};

// Add item to the menu with quantity and availability checks
exports.addMenuItem = async (req, res) => {
    try {
        const { itemId } = req.body;

        // Check if the item exists in Inventory
        const item = await Inventory.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found' 
            });
        }

        // Check if the item is unavailable or quantity is 0
        if (!item.available || item.quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Item is either unavailable or out of stock' 
            });
        }

        let menu = await Menu.findOne();
        if (!menu) {
            // If menu doesn't exist, create one
            menu = new Menu({ menuItems: [] });
        }

        // Add item to the menu
        menu.menuItems.push(itemId);
        await menu.save();

        res.status(200).json({
            success:true,
            message: 'Item added to menu', menu 
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message: 'Error adding item to menu', 
            error 
        });
    }
};

// Remove item from the menu
exports.removeMenuItem = async (req, res) => {
    try {
        const { itemId } = req.body;

        // Find the menu
        let menu = await Menu.findOne();
        if (!menu) {
            return res.status(404).json({
                success:false,
                message: 'Menu not found' });
        }

        // Check if the item is in the menu
        const itemIndex = menu.menuItems.indexOf(itemId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success:false,
                message: 'Item not found in menu' 
            });
        }

        // Remove the item from the menu
        menu.menuItems.splice(itemIndex, 1);
        await menu.save();

        res.status(200).json({ 
            success:true,
            message: 'Item removed from menu', 
            menu 
        });
    } catch (error) {
        res.status(500).json({ 
            success:false,
            message: 'Error removing item from menu', 
            error 
        });
    }
};

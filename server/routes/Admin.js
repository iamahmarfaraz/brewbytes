const express = require("express");
const router = express.Router();

const {getAllProducts} = require("../controllers/product");

const {
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    viewLogs,
} = require("../controllers/admin");

const {addMenuItem,removeMenuItem} = require("../controllers/menu")

const {auth,isAdmin} = require("../middlewares/auth");

router.get("/getAllProducts",auth,isAdmin,getAllProducts);
router.post("/addProduct",auth,isAdmin,addProduct);
router.put("/updateProduct",auth,isAdmin,updateProduct);
router.delete("/deleteProduct",auth,isAdmin,deleteProduct);
router.put("/updateOrderStatus",auth,isAdmin,updateOrderStatus);
router.get("/logs",auth,isAdmin,viewLogs);

router.post("/addMenuItem",auth,isAdmin,addMenuItem);
router.delete("/removeMenuItem",auth,isAdmin,removeMenuItem);

module.exports = router;
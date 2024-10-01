const express = require("express")
const router = express.Router()
const { auth ,isCustomer} = require("../middlewares/auth")
const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getAllOrdersOfUser
} = require("../controllers/profile")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delet User Account
router.delete("/deleteProfile",auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)
// Get Enrolled Courses
router.get("/getAllOrdersOfUser", auth,isCustomer, getAllOrdersOfUser)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
 
module.exports = router
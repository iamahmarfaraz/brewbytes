const Profile = require("../models/profile");
const User = require("../models/user");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Log = require("../models/log");

// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth = "",
      address="",
    //   about = "",
      contactNumber,
      gender,
    } = req.body;
    const id = req.user.id;

    // Find the profile by id
    const userDetails = await User.findById(id);
    userDetails.firstName = firstName;
    userDetails.lastName = lastName;
    userDetails.address = address;
    await userDetails.save();

    const profile = await Profile.findById(userDetails.additionalDetails);

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth;
    profile.contactNumber = contactNumber;
    profile.gender = gender;

    // Save the updated profile
    await profile.save();
    const updatedUserDetails = await User.populate(
      userDetails,
      "additionalDetails"
    );

    const logging = await Log.create({
        userId:updatedUserDetails._id,
        action:"UPDATE",
        details:"Profile Updated"
    }); 

    await User.findByIdAndUpdate({_id:updatedUserDetails._id},{logs:logging._id});

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // TODO: Find More on Job Schedule
    // const job = schedule.scheduleJob("10 * * * * *", function () {
    // 	console.log("The answer to life, the universe, and everything!");
    // });
    // console.log(job);
    console.log("Printing ID: ", req.user.id);
    const id = req.user.id;

    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete({ _id: user.additionalDetails });
    // TODO: Unenroll User From All the Enrolled Courses
    // Now Delete User
    await User.findByIdAndDelete({ _id: id });
    await Log.create({
        userId:user._id,
        action:"DELETE",
        details:"Deleted Account"
    }); 
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .populate({
        path: "purchase",  // Populates the purchase field (Order schema)
        populate: {
          path: "items.item",  // Populates the item inside the items array in the Order
          model: "Inventory",  // Refers to the Inventory model
        },
      })
      .exec();
    // PATH TO GET ITEM USER ORDERED DETAIL:- res.data.purchase.items.map((singalItem)=>singalItem.item)

    console.log(userDetails);
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log(image);
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );

    const logging = await Log.create({
        userId:updatedProfile._id,
        action:"UPDATE",
        details:"Profile Picture Updated"
    }); 

    await User.findByIdAndUpdate({_id:updatedProfile._id},{logs:logging._id});

    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    });
  } catch (error) {
    console.log("ERRO IN UPDATING DISPLAY PICTURE...", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getAllOrdersOfUser = async (req, res) => {
	try {
	  const userId = req.user.id
	  let userDetails = await User.findOne({
		_id: userId,
	  }).populate({
        path: "purchase",  // Populates the purchase field (Order schema)
        populate: {
          path: "items.item",  // Populates the item inside the items array in the Order
          model: "Inventory",  // Refers to the Inventory model
        },
      })
      .exec();

	  userDetails = userDetails.toObject()
  
	  if (!userDetails) {
		return res.status(400).json({
		  success: false,
		  message: `Could not find user with id: ${userDetails}`,
		})
	  }

    console.log("ORDER DETAIL OF USER... RES.DATA:- ",userDetails.purchase);
	  return res.status(200).json({
		success: true,
		data: userDetails.purchase,
	  })
	} catch (error) {
	  return res.status(500).json({
		success: false,
		message: error.message,
	  })
	}
  }


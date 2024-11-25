const User = require("../models/user");
const OTP = require("../models/otp");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser")
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/template/passwordUpdate");
const Log = require("../models/log");
require("dotenv").config();


// send OTP
exports.sendOTP = async(req,res) => {
    
    try {
        // fetch email from request body
        const {email} = req.body

        // check if user already exist
        const checkUserPresent = await User.findOne({email});

        // if user already existed then return a response of success:false
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message: "User already registered"
            })
        }
        
        // generate OTP
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        // console.log("OTP :- ",otp);

        // check the OTP we got is unique or not
        const result = await OTP.findOne({otp:otp});
        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email,otp};

        // create entry of OTP in DB
        const otpBody = await OTP.create(otpPayload);
        console.log("OTP body :- ",otpBody);

        // return response
        res.status(200).json({
            success:true,
            message:"OTP sent successfully",
        })

    } catch (error) {
        console.log("Error in catch blog of sendOTP controller in ./controllers/auth.js -> ",error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }

};

// Signup
exports.signUp = async (req,res) => {

    try {
        
        // Data Fetching from request body
        const{firstName,lastName,email,password,
            confirmPassword,accountType,contactNumber,
            otp} = req.body;

        // validate data
        if (!firstName || !lastName || !email || !password || !confirmPassword
            || !otp ) {
            return res.status(403).json({
                success:false,
                message:"All Fields are Mandatory to fill"
            })
        }
        if(password.length < 6){
            return res.status(403).json({
                success:false,
                message:"Password should be 6 digit or greater"
            })
        }

        // cross match password and confirm password
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password & Confirm Password value doesn't matched"
            })
        }

        // check if user already exist
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exist",
            })
        }

        // if everything is fine then find the most recent OTP corresponding to the User
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1); 
        console.log(recentOtp);

        // otp expires wali validation bhi daal skte hain

        // validate OTP
        if(recentOtp.length == 0){
            // OTP not found in DB
            return res.status(400).json({
                success:false,
                message:"OTP not found in DB",
            })
        }
        else if(otp !== recentOtp[0].otp){
            // Invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            })
        }

        // Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

        // Hash password
        let hashedPassword = await bcrypt.hash(password,10);

        // create entry in DB

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            contactNumber:null,
        })

        const userDetails = await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        const logging = await Log.create({
            userId:userDetails._id,
            action:"SIGNUP",
        }); 

        await User.findByIdAndUpdate({_id:userDetails._id},{logs:logging._id});

        // return success response
        return res.status(200).json({
            success:true,
            message:"User successfully registered",
            userDetails,
        })

    } catch (error) {
        console.log("Error signingup :- ",error),
        res.status(400).json({
            success:false,
            message:error.message,
        })
    }

}

// Login
exports.login = async (req,res) => {
    try {
        
        // Get data from request body
        const {email,password} = req.body;

        // Validation of data
        if (!email || !password) {
            return res.status(403).json({
                success:false,
                message:"All Fields are Mandatory to fill"
            })
        }

        // check if user is registered or not
        const existingUser = await User.findOne({email}).populate("additionalDetails");
        if(!existingUser){
            return res.status(401).json({
                success:false,
                message:"User not registered "
            })
        }

        // check if password is correct or not
        if (await bcrypt.compare(password,existingUser.password)) {

            // generate JWT
            const payload = {
                email : existingUser.email,
                id: existingUser._id,
                accountType : existingUser.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            // yha pe phat skta hai to .toObject use krlena
            existingUser.token = token;
            existingUser.password = undefined; 

            const logging = await Log.create({
                userId:existingUser._id,
                action:"LOGIN",
            }); 
    
            await User.findByIdAndUpdate({_id:existingUser._id},{logs:logging._id});

            // create cookie & return response
            const options ={
                expires:new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                existingUser,
                message:"Logged In Successfully"
            })

        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect "
            })
        }

    } catch (error) {
        console.log("error while Logging In",error)
        return res.status(400).json({
            success:false,
            message:"Login Failed",
        })
    }
}

// change password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		// if (newPassword !== confirmNewPassword) {
		// 	// If new password and confirm new password do not match, return a 400 (Bad Request) error
		// 	return res.status(400).json({
		// 		success: false,
		// 		message: "The password and confirm password does not match",
		// 	});
		// }

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
                "Password Updated Successfully",
				passwordUpdated(
					updatedUserDetails.email,
                    
					updatedUserDetails.firstName,
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res.status(200).json({
                success: true,
                message: "Password updated successfully" 
            });

	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};

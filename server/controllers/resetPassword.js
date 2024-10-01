const User = require("../models/user");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//  reset password token
exports.resetPasswordToken = async (req, res) => {
  try {
    // get email from request body
    const { email } = req.body;

    // check if user already registered or not
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(500).json({
        success: false,
        message: "User not registered",
      });
    }

    // generate TOKEN
    const token = crypto.randomUUID();

    // Update User Model DB by adding token & expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    // create url
    const url = `http://localhost:3000/update-password/${token}`;

    // send mail conatining the URL
    await mailSender(email,"Password Reset",`Howdy !! You
            are receving this e-mail to reset your password on StudyNotion, Kindly click on this link ${url} to
            reset your StudyNotion password. 
            Hope you have a good day.
            This Link will expire in 5 minutes
                                    Thank you,
                              Team StudyNotion`)

    // return response
    return res.json({
        success: true,
        message: "E-mail sent successfully, Please check email and change password. ",
      });

  } catch (error) {
        return res.status(500).json({
        success: false,
        message: "Reset Password Token generation Failed",
        });
  }
};

// reset password in DB
exports.resetPassword = async (req,res) => {
    
    try {
        
        // data fetch
        const{password,confirmPassword,token} = req.body; 

        // validation
        if (password.length < 6) {
            return res.status(401).json({
                success:false,
                message:"Password length too short"
            });
        }

        if (password !== confirmPassword) {
            return res.status(401).json({
                success:false,
                message:"Password doesn't matches with confirm password",
            });
        }

        // get User details from DB using tokens
        const userDetails = await User.findOne({token:token});

        // if no entry - invalid token
        if (!userDetails) {
            return res.status(401).json({
                success:false,
                message:"Invalid Token"
            });
        }

        // token time expired or not
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.status(401).json({
                success:false,
                message:"Token Expired"
            });
        }
        
        // hash the new password
        let hashedPassword = await bcrypt.hash(password,10);
        // update password
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
        )
        // return response
        return res.status(200).json({
            success:true,
            message:"Password Updated Successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Reset Password Token generation Failed",
            });
    }

}

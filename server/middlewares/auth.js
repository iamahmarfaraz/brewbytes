const jwt= require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user");

// auth
exports.auth = async (req,res,next) => {
    try {
        
        // extract token
        const token = req.cookies.token 
        || req.body.token 
        || req.header("Authorization").replace("Bearer ","");

        // if token missing return response
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token not Found"
            });
        }

        // verify the token
        try {

            const decode =  jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;


        } catch (error) {
            return res.status(401).json({
            success:false,
            message:"Token Invalid"
            })
        }
        next();

    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"Authentication Failed"
        })
    }
}

// isStudent
exports.isCustomer = async (req,res,next) => {
    try {
        
        if (req.user.accountType !== "Customer") {
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Customer only"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"You are not a Customer"
        })
    }
}


// isAdmin
exports.isAdmin = async (req,res,next) => {
    try {
        // console.log("Printing Account Type :- ",req.user.accountType);
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Admin only"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"You are not a Admin"
        })
    }
}
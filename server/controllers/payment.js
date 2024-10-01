const { instance } = require("../config/razorpay");
const Inventory = require("../models/inventory");
const User = require("../models/user");
const mailSender = require("../utils/mailSender");
const {paymentSuccessEmail} = require("../mail/template/paymentSuccessEmail")
const { default: mongoose } = require("mongoose");
const crypto = require("crypto");
const { error } = require("console");
const Payment = require("../models/payment");


// * For mutiple at a time and without webHook
exports.capturePayment = async (req, res) => {
  const { cart,total,totalItems,loyaltyPoints } = req.body;
  const userId = req.user.id;

  //Check if course contain something
  if (cart.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Please Provide Cart Items",
    });
  }


  const userDetails = await User.findById(userId);
  if(!userDetails){
    return res.status(401).json({
        success: false,
        message: "User not found",
      });
  }

  if(userDetails.loyaltyPoints !== loyaltyPoints){
    return res.status(401).json({
        success:false,
        message:"Loyalty Point Manipulated",
        error
    })
  }

  // Validate inventory items asynchronously
  await Promise.all(
    cart.map(async (singleItem) => {
      const inventoryItem = await Inventory.findById(singleItem.cartItem._id);
      if (!inventoryItem) {
        throw new Error(`Item not found: ${singleItem.cartItem._id}`);
      }
    })
  );

  let totalAmount = total - loyaltyPoints;
  if (totalAmount < 0) totalAmount = 0; // Prevent negative totalAmount

  const cartItemsID = cart.map((singalItem) => singalItem.cartItem._id); 

  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
    notes : {
        cartItemsID,
        userId,
        totalItems,
    },
  };

  try {
    const paymentResponse = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      message: paymentResponse,
    });
  } catch (error) {
    console.log("Error while capturePayment", error);
    return res.status(500).json({
      success: false,
      message: "Error while capturePayment" + error.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  //get data from req
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const {cart,total,totalItems,loyaltyPoint} = req.body;
  const userId = req.user.id;

  //Validation
  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !cart ||
    !total ||
    !totalItems ||
    !loyaltyPoint ||
    !userId
  ) {
    return res.status(401).json({
      success: false,
      message: "Payment failed because all fields are required",
    });
  }

  //Verification
  let body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  // If verfication happens
  if (expectedSignature === razorpay_signature) {
    //Enrolled studen in course
    createOrder(cart,total,totalItems,loyaltyPoint, userId, res);

    //return res
    return res.status(200).json({
      success: true,
      message: "Payment Verfied",
    });
  }
};

//Enrolling studen
const createOrder = async (cart,total, userId, res) => {
  //validation
  if (!cart || !userId || !total) {
    return res.status(401).json({
      success: false,
      message:
        "Failed while Creating Order in vergying payemnt all fields are required",
    });
  }

  let loyaltyPoint = total/100;
  if(loyaltyPoint<1){
    loyaltyPoint =0;
  }

  try {
    const orderItems = cart.map((cartItem) => {
        return {
          item: cartItem.cartItem._id, // Reference to the inventory item ID
          quantity: cartItem.cartItemQty, // Quantity of the item ordered
          price: cartItem.cartItemPrice, // Price of the item at the time of order
        };
      });
  
      // Create the Order using mongoose .create()
      const newOrder = await Order.create({
        customer: userId, // Reference to the user/customer placing the order
        items: orderItems, // The mapped array of cart items
        totalAmount: total, // Total amount of the order
        loyaltyPointsEarned: loyaltyPoint, // Loyalty points earned from this order
        paymentStatus: 'Paid', // Initial payment status
        status: 'Pending', // Initial order status
      });

    if (!newOrder) {
        return res.status(400).json({
            success:false,
            message:"Order Not Created"
        });
    }
    
    const userDetails = await User.findByIdAndUpdate(
        userId,
        {
            $push:{purchase:newOrder._id},
            $inc: {loyaltyPoints:loyaltyPoint}
        },
        {new:true}
    )

    // Check if user details update was successful
    if (!userDetails) {
        return res.status(400).json({
        success: false,
        message: "Failed to update user with new order",
        });
    }

    const paymentDetails = await Payment.create({
        order:newOrder._id,
        customer: userDetails._id,
        amount:total,
        paymentStatus:"Completed",
    });

    newOrder.payment = paymentDetails._id;

    await newOrder.save();



    // Return success response
    return res.status(200).json({
        success: true,
        message: "Order created and user updated successfully",
        order: newOrder,
        user: userDetails,
    });

  } catch (error) {
    console.error("Error While Creating Order :- ",error);
        return res.status(400).json({
            success:false,
            message: "Order Creation Failed",
            error: error.message,
        });
  }
  
};

//sending mail after payment sucessfull
exports.sendPaymentSuccessEmail = async (req, res) => {
  //fecth data
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id; 

  //Validation
  if (!orderId || !paymentId || !amount || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the details(Send Email)",
    });
  }

  try {
    //Find User
    const userDetails = await User.findById(userId);

    //send Mail
    await mailSender(
      userDetails.email,
      `Payment Recieved`,
      paymentSuccessEmail(
        `${userDetails.firstName} ${userDetails.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail of payment successfull", error)
    return res.status(500).json({
        success:false,
        message:"Could Not send Mail"
    })
  }
};


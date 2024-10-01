
# BrewBytes Backend

## Overview

BrewBytes is a backend system built to manage the online presence of a coffee shop, handling products, orders, user profiles, loyalty points, and payments. The backend is built using **Node.js**, **Express**, and **MongoDB**. It supports features for both customers and admins, including product management, order processing, user authentication, payment handling, and review system.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
  - [Authentication Routes](#authentication-routes)
  - [Profile Routes](#profile-routes)
  - [Product Routes](#product-routes)
  - [Admin Routes](#admin-routes)
  - [Payment Routes](#payment-routes)
  - [Rating & Review Routes](#rating--review-routes)
- [Middleware](#middleware)
- [Database Models](#database-models)

---

## Tech Stack

- **Node.js**: Backend runtime environment.
- **Express**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing user, product, and order data.
- **Mongoose**: ODM for MongoDB.
- **Razorpay**: Payment gateway integration.
- **JWT**: JSON Web Tokens for user authentication.
- **Nodemailer**: For sending order-related emails.

---

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/brewbytes-backend.git
   ```

2. Navigate to the project directory:

   ```bash
   cd brewbytes-backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add the following:

   ```env
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   EMAIL_HOST=smtp.your-email.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   ```

5. Run the server:

   ```bash
   npm run dev
   ```

   The backend will be running at `http://localhost:5000`.

---

## API Endpoints

### Authentication Routes

- `POST /api/v1/auth/login` - Log in a user.
- `POST /api/v1/auth/signup` - Register a new user.
- `POST /api/v1/auth/sendotp` - Send an OTP to the user's email for verification.
- `POST /api/v1/auth/changepassword` - Change the password of the logged-in user.
- `POST /api/v1/auth/reset-password-token` - Request a password reset token.
- `POST /api/v1/auth/reset-password` - Reset the user's password.
- `POST /api/v1/auth/contact-us` - Contact form submission.

### Profile Routes

- `DELETE /api/v1/profile/deleteProfile` - Delete the logged-in user's account.
- `PUT /api/v1/profile/updateProfile` - Update the user's profile information.
- `GET /api/v1/profile/getUserDetails` - Get the details of the logged-in user.
- `GET /api/v1/profile/getAllOrdersOfUser` - Get all orders made by the logged-in user.
- `PUT /api/v1/profile/updateDisplayPicture` - Update the user's display picture.

### Product Routes

- `GET /api/v1/product/getAvailableProducts` - Get all available products for sale.
- `GET /api/v1/product/getProductAllDetails` - Get detailed information for a specific product.
- `GET /api/v1/product/getMenuItems` - Get the menu items available for customers.

### Admin Routes

- `GET /api/v1/admin/getAllProducts` - View all products.
- `POST /api/v1/admin/addProduct` - Add a new product to the inventory.
- `PUT /api/v1/admin/updateProduct` - Update an existing product.
- `DELETE /api/v1/admin/deleteProduct` - Delete a product from the inventory.
- `PUT /api/v1/admin/updateOrderStatus` - Update the status of an order (Pending, Delivered, Canceled).
- `GET /api/v1/admin/logs` - View admin activity logs.
- `POST /api/v1/admin/addMenuItem` - Add an item to the menu.
- `DELETE /api/v1/admin/removeMenuItem` - Remove an item from the menu.

### Payment Routes

- `POST /api/v1/payment/capturePayment` - Capture payment for an order using Razorpay.
- `POST /api/v1/payment/verifyPayment` - Verify the payment after capture.
- `POST /api/v1/payment/sendPaymentSuccessEmail` - Send an email confirming successful payment.

### Rating & Review Routes

- `POST /api/v1/rating/createRating` - Add a rating and review for a product.
- `PUT /api/v1/rating/updateRating` - Update an existing rating and review.
- `DELETE /api/v1/rating/deleteRating` - Delete a rating and review.
- `GET /api/v1/rating/getRatings` - Get all ratings and reviews for a product.

---

## Middleware

- `auth`: Ensures that the user is authenticated using JWT.
- `isAdmin`: Checks if the authenticated user has admin privileges.
- `isCustomer`: Ensures the authenticated user is a customer.

---

## Database Models

### User

- `name`: String
- `email`: String
- `password`: String (hashed)
- `loyaltyPoints`: Number
- `purchase`: Array of order references

### Product

- `name`: String
- `description`: String
- `price`: Number
- `stock`: Number
- `category`: String
- `menuItem`: Boolean

### Order

- `customer`: User reference
- `items`: Array of ordered items (product reference, quantity, price)
- `totalAmount`: Number
- `orderDate`: Date
- `status`: String (Pending, Delivered, Canceled)
- `loyaltyPointsEarned`: Number
- `paymentStatus`: String (Paid, Unpaid)

### Payment

- `order`: Order reference
- `customer`: User reference
- `amount`: Number
- `paymentStatus`: String (Completed, Failed)

---

## Conclusion

This backend for BrewBytes provides a robust API for managing users, products, orders, and payments. The admin has full control over product inventory, while customers can seamlessly browse, order, and review products. Payment integration with Razorpay ensures secure transactions, and loyalty points are rewarded based on customer activity.

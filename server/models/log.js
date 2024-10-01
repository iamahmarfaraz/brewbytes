const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    action: {
        type: String,
        required: true, // Description of the action taken
        enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SIGNUP' , 'ORDER_PLACED', 'ORDER_STATUS_CHANGED'], // Specify possible actions
    },
    details: {
        type: String, // Additional details about the action
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now 
    }
});

// Create the Log model
const Log = mongoose.model('Log', logSchema);
module.exports = Log;

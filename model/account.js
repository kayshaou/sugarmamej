const mongoose = require("mongoose");
const { Schema } = mongoose;


const account = mongoose.model('Account', Schema({
    accountId: {
        type: String
    },
    emailAddress: String,
    password: String,
    name: String,
    dob: {
        type: Date,
    },
    createdDate: { // joined date
        type: Date
    },
    lastLoginDate: { // last activity date
        type: Date
    },
    subscription: { // ref to subscription schema if any
        subscriptionRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription"
        }
    },
    address: [{ // one to many with address schema: array
        addressRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address"
        }
    }],
}, { optimisticConcurrency: true }));

module.exports = account;
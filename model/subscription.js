const mongoose = require("mongoose");
const { Schema } = mongoose;

const subscription = mongoose.model('Subscription', Schema({
    subscriptionId: {
        type: String
    },
    emailaddress: String,
    ipAddress: String,
    createdDate: { // stocked date
        type: Date, default: Date.Now, required: true
    }
}, { optimisticConcurrency: true }));

module.exports = subscription;

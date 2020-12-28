const mongoose = require("mongoose");
const { Schema } = mongoose;

const productTransaction = mongoose.model('ProductTransaction', Schema({
    transactionId: {
        type: String, required: true
    },
    transactionDate: {
        type: Date, default: Date.Now
    },
    transactionStatus: String, // RESERVED, PLACED
    productIds: [{ //ref to product schema
        productRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        purchasedUnit: Number
    }],
    reservedDate: {
        type: Date, default: Date.Now
    },
    purchaser: { //purchaser

        type: mongoose.Schema.Types.ObjectId,
        ref: "Purchaser"
    }

}, { optimisticConcurrency: true }));

module.exports = productTransaction;
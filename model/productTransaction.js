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
    productId: { //ref to product schema
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    reservedDate: {
        type: Date, default: Date.Now
    }
}, { optimisticConcurrency: true }));

module.exports = productTransaction;
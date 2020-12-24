const mongoose = require("mongoose");
const { Schema } = mongoose;


const product = mongoose.model('Product', Schema({
    productId: {
        type: String
    },
    productName: String,
    productDescription: String,
    productRemark: String,
    productAdditionalInformation: String,
    createdDate: { // stocked date
        type: Date, default: Date.Now, required: true
    },
    restockedDate: { // stocked date
        type: Date
    },
    productStatus: {
        type: String, default: 'INS'
    }, // OOS - out of stock, INS - in-stock, BKO - backorder
    inStock: Number // number of available stocks.
}, { optimisticConcurrency: true }));

module.exports = product;
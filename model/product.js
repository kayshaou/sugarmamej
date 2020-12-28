const mongoose = require("mongoose");
const { Schema } = mongoose;


const product = mongoose.model('Product', Schema({
    productId: {
        type: String
    },
    productCategory: {
        type: String, index: true
    },
    productName: {
        type: String, index: true
    },
    productDescription: {
        type: String, index: true
    },
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

// these settings don't work
//product.createIndexes({
//     productCategory: "text",
//     productName: "text",
//     productDescription: "text"
// })


module.exports = product;
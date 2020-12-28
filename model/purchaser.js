const mongoose = require("mongoose");
const { Schema } = mongoose;

const purchaser = mongoose.model('Purchaser', Schema({
    purchaserId: {
        type: String, required: true
    },
    purchaserName: {
        type: String, required: true
    },
    purchaserUsername: {
        type: String, required: true
    },
    purchaserPassword: {
        type: String, required: true
    },
    purchaserDOB: {
        type: Date, required: true
    },
    purchaserAddress: [
        {
            purchaserAddressRef: { //ref to product schema
                type: mongoose.Schema.Types.ObjectId,
                ref: "PurchaserAddress"
            },
        }
    ],
    createdDate: { // stocked date
        type: Date, default: Date.Now, required: true
    },
    activatedDate: Date
}, { optimisticConcurrency: true }));



module.exports = purchaser;
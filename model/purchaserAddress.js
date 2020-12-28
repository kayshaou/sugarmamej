const mongoose = require("mongoose");
const { Schema } = mongoose;

const purchaserAddress = mongoose.model('PurchaserAddress', Schema({
    isPreffered: Boolean,
    purchaserAddressLineOne: String,
    purchaserAddressLineTwo: String,
    purchaserPostalCode: String,
    createDate: {
        type: Date, default: Date.now
    },
    isDeleted: Boolean
}, { optimisticConcurrency: true })
);


module.exports = purchaserAddress;
const mongoose = require("mongoose");
const { Schema } = mongoose;


const address = mongoose.model('Address', Schema({
    addressId: {
        type: String
    },
    addressLineOne: String,
    addressLineTwo: String,
    postalCode: String,
    isPrimary: Boolean,
    country: String
}, { optimisticConcurrency: true }));


module.exports = address;
// const axios = require("axios");
const request = require("request");
let express = require('express');
const router = express.Router();

const paypalApi = require("../middleware/paypal");

let cookieParser = require('cookie-parser');
//setup express app 
let app = express();
app.use(cookieParser());
require('dotenv').config();

const handleError = (err, res, status) => {
    let stat = 500;
    if (status != undefined) {
        stat = status;
    }
    res.status(stat).send({ error: err })
}

// Get auth token 
router.get("/paypal/auth", (req, res) => {
    paypalApi.getAuthToken(req, res);
});


module.exports = router;
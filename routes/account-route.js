const request = require("request");
let express = require('express');
const router = express.Router();

const Account = require("../model/account");
const handleError = (err, res, status) => {
    let stat = 500;
    if (status != undefined) {
        stat = status;
    }
    res.status(stat).send({ error: err })
}

router.get("/create", (req, res) => {
    try {

    } catch (error) {
        handleError(error);
    }
    // res.send("create routes ");
});

const isValid = req => {
    try {
        const {
            name,
            emailAddress,
            dob
        } = req.body;
        // todo
    } catch (error) {

    }
    return false;
}


module.exports = router;
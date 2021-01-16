
const request = require("request");
let express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
var AsyncLock = require('async-lock');
var lock = new AsyncLock();
// schema
const Subscription = require("../model/subscription");
const moment = require("moment");

const handleError = (err, res, status) => {
    let stat = 500;
    if (status != undefined) {
        stat = status;
    }
    res.status(stat).send({ error: err })
}

//list down subscription

router.get("/list", (req, res) => {
    try {
        Subscription.find((err, entity) => {
            res.status(200).send({ entity });
        });
    } catch (error) {
        handleError(err, res);
    }
});
// newsletter subscription : requires no auth?
router.post("/subscribe", (req, res) => {
    try {
        const {
            emailAddress
        } = req.body;

        lock.acquire("add-subscribe-key", async (done) => {

            console.log("lock acquire " + process.pid);
            const query = Subscription.findOne({
                emailaddress: emailAddress
            });

            const subscription = await query.exec();
            if (subscription) { // if already exist will not be created again
                done(null, "Email address already exists"); // for lock
                return handleError('Email address already exists', res, 422);
            }

            const subscriptionObj = {
                emailaddress: emailAddress,
                createdDate: moment(),
                ipAddress: req.connection.remoteAddress
            }

            Subscription.create(subscriptionObj, function (err, entity) {
                if (err) return handleError(err, res);
                // saved!
                done(null, "subscription-info-created");
                res.status(200).send({ message: 'subscription-info-created', entity: entity })
            });

        }, (err, ret) => {
            if (err) console.log(" there's error over here " + err);
            else {
                // lock released
                console.log("lock release " + process.pid + " ret " + ret);
            }
        });
    }
    catch (error) {
        handleError(error, res);
    }

});


module.exports = router;
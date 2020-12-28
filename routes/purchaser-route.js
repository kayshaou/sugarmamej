const express = require("express");
const router = express.Router();
const moment = require("moment");
// models
const PurchaserAddress = require("../model/purchaserAddress");
const Purchaser = require("../model/purchaser");
const helper = require("../helper/utils");
var AsyncLock = require('async-lock');
const authentication = require("../middleware/auth");
var lock = new AsyncLock();

const handleError = (err, res, status) => {
    let stat = 500;
    if (status != undefined) {
        stat = status;
    }
    res.status(stat).send({ error: err })
}

// create-
router.post("/create", (req, res) => {
    try {

        const {
            purchaserName,
            purchaserUsername,
            purchaserPassword,
            purchaserDOB,
            purchaserPostalCode,
            purchaserAddressLineOne, purchaserAddressLineTwo
        } = req.body;

        lock.acquire("add-cart-key", async (done) => {
            const query = Purchaser.findOne({
                purchaserUsername
            });

            const purchaser = await query.exec();

            if (purchaser) { // if already exist will not be created again
                done(null, "Username already exists");
                return handleError(new Error('Username already exists'), res);
            }

            const PurchaserAddressArray = [];
            const PurchaserAddressObj = {
                purchaserPostalCode,
                purchaserAddressLineOne, purchaserAddressLineTwo,
                isPreffered: true,
                isDeleted: false,
                createDate: moment()
            }

            PurchaserAddress.create(
                PurchaserAddressObj,
                async (err, purchaserAdrs) => {
                    if (err) {
                        done(err, "Insufficient stock");
                        return handleError(err, res);
                    }
                    // saved!
                    PurchaserAddressArray.push(PurchaserAddressObj);

                    const purchaserPasswordEncrypted = await helper.hashPassword(purchaserPassword);
                    console.log("purchaserPassword " + purchaserPasswordEncrypted);

                    const PurchaserTx = {
                        purchaserId: helper.generateRunningNumber("PCU"),
                        purchaserName,
                        purchaserUsername,
                        purchaserPassword: purchaserPasswordEncrypted,
                        purchaserDOB,
                        purchaserAddress: [{
                            purchaserAddressRef: purchaserAdrs._id
                        }],
                        createdDate: moment()
                    }

                    Purchaser.create(
                        PurchaserTx,
                        function (err, entity) {
                            if (err) {
                                done(err, "Purchaser-not-created");
                                return handleError(err, res);
                            }
                            // saved!
                            done(null, "Purchaser-created");
                            res.send({ message: 'created', entity: entity })
                        });
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

// verify log in; if succeeds. return jwt token //
router.post("/verify", async (req, res) => {
    try {
        const { username, password } = req.body

        // check username 
        const query = Purchaser.findOne({
            purchaserUsername: username
        });

        const purchaser = await query.exec();

        if (!purchaser) {
            return handleError(new Error('Credentials do not exist'), res, 403);
        } else { // if exists, check password 
            // encrypted password
            try {
                const hPassword = purchaser.purchaserPassword;
                const result = await helper.verifyPassword(hPassword, password);
                if (result === true) {
                    const token = authentication.sign(username, hPassword);
                    res.status(200).send({ token });
                } else {
                    return handleError(new Error("Unauthorized"), res, 401);
                }
            } catch (error) {
                return handleError(error, res);
            }
        }
    } catch (error) {
        return handleError(error, res);
    }
})


module.exports = router;
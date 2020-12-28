const express = require("express");
const router = express.Router();
const moment = require("moment");
// models
const PurchaserAddress = require("../model/purchaserAddress");
const Purchaser = require("../model/purchaser");
const helper = require("../helper/utils");
var AsyncLock = require('async-lock');
var lock = new AsyncLock();

const handleError = (err, res) => {
    res.status(500).send({ error: 'Error occurred ' + err })
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


        lock.acquire("lock", async function () {

            const query = Purchaser.findOne({
                purchaserUsername
            });

            const purchaser = await query.exec();

            if (purchaser) { // if already exist will not be created again
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
                function (err, purchaserAdrs) {
                    if (err) return handleError(err, res);
                    // saved!
                    PurchaserAddressArray.push(PurchaserAddressObj);

                    const PurchaserTx = {
                        purchaserId: helper.generateRunningNumber("PCU"),
                        purchaserName,
                        purchaserUsername,
                        purchaserPassword,
                        purchaserDOB,
                        purchaserAddress: [{
                            purchaserAddressRef: purchaserAdrs._id
                        }],
                        createdDate: moment()
                    }

                    Purchaser.create(
                        PurchaserTx,
                        function (err, entity) {
                            if (err) return handleError(err, res);
                            // saved!
                            res.send({ message: 'created', entity: entity })
                        });
                });

        }).then(function () {
            console.log(" locked released ");
        }).catch(function (err) {
            handleError(err, res);
        });
    }
    catch (error) {
        handleError(error, res);
    }
});


module.exports = router;
const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const ProductTransaction = require("../model/productTransaction")
const helper = require("../helper/utils");
const moment = require("moment");
const escapeStringRegexp = require('escape-string-regexp');

var AsyncLock = require('async-lock');
const purchaser = require("../model/purchaser");
var lock = new AsyncLock();

const handleError = (err, res) => {
    console.log(" send ? ");
    res.status(500).send({ error: 'Error occurred ' + err })
    return;
}

// list product based on category; category can be emptied
router.get("/list/:category", async (req, res) => {
    try {
        const { category: productCategory } = req.params;
        const _regexproductCategory = escapeStringRegexp(productCategory);

        const query = Product.find(
            {
                productCategory:
                {
                    $regex: _regexproductCategory,
                    $options: "i" //ignore case
                }
            });

        const productList = await query.exec();

        res.status(200).send({
            productList
        });

    } catch (error) {
        handleError(error, res);
    }

});

// getProductDetail 24/12/2020 1:08pm
router.get("/detail/:prodobjid", async (req, res) => {
    try {
        const { prodobjid: prodObjId } = req.params;
        //Adventure.findById(id, function (err, adventure) {});

        Product.findById(prodObjId, (err, product) => {
            if (err) return handleError(err, res);

            res.status(200).send({
                product
            })
        })
    } catch (error) {
        handleError(error, res);
    }
})
// searchProduct 1:22pm
router.post("/search", async (req, res) => {
    try {

        const { keyword } = req.body;
        // category, name, description
        Product.find({ $text: { $search: keyword } })
            //.skip(20)
            .limit(10)
            .exec((err, product) => {
                if (err) return handleError(err, res)

                res.status(200).send({
                    product
                })
            })
    } catch (error) {
        handleError(error, res);
    }
});

//  create product
router.post("/create-product", (req, res) => {
    const { name,
        productDescription,
        productRemark,
        productAdditionalInformation,
        inStock,
        productCategory } = req.body;

    const product = {
        productId: helper.generateRunningNumber("PDU"),
        productName: name,
        productDescription,
        productRemark,
        productAdditionalInformation,
        inStock,
        createdDate: moment(),
        productCategory
    }
    Product.create(
        product,
        function (err, entity) {
            if (err) return handleError(err);
            // saved!
            res.send({ message: 'created', entity: entity })
        });
});

const manageStock = async (prod, res, callback) => {

    if (prod === undefined) return;
    // lock.acquire("manageStock-key", async function () {
    const { productObjId, purchasedUnit } = prod;
    try {
        const productQuery = await Product.findById(productObjId).exec();

        if (null != productQuery) {

            let currentStock = productQuery.inStock;

            if (currentStock === 0) {
                return callback('insufficient-stock', {}, productQuery);
            }
            currentStock = currentStock - purchasedUnit;
            console.log(productObjId + " purchasing " + purchasedUnit + " before deduction " + productQuery.inStock + " balance: " + currentStock);
            if (currentStock === 0) {
                productQuery.productStatus = "OOS"; // marked as out of stock 
            }

            productQuery.inStock = currentStock;
            //productQuery.save();

            var tmp = {
                purchasedUnit,
                productRef: productQuery._id
            }
            // return tmp;
            return callback('sufficient-stock', tmp, productQuery);
        }
    } catch (error) {
        console.error(error);
    }
    // }).then(function () {
    //     console.error("manageStock-key release");
    // });
}

const OpsPromise = (producttransations, res) => {
    // return new Promise(() => {
    const productQueryAry = [];
    try {
        let stockCnt = 0;
        producttransations.forEach((obj) => {
            manageStock(obj, res, (msg, ob, productObj) => {
                //  console.log(ob + " msg " + msg + " productObj " + productObj);
                var tmp = {
                    purchasedUnit: obj.purchasedUnit,
                    // productRef: productObj._id,
                    productRef: productObj,
                    msg
                }
                productQueryAry.push(tmp);
            });

        });

        // console.log("mProductObj.length === producttransations.length " + mProductObj.length === producttransations.length);

        // if (mProductObj.length === producttransations.length) {
        //     for (let i = 0; i < mProductObj.length; i++) {
        //         console.log("unit " + mProductObj[i].purchasedUnit + "mProductObj.inStock " + mProductObj[i].productRef.inStock + " mProductObj._id " + mProductObj[i].productRef._id);
        //         mProductObj[i].productRef.save();
        //         var tmp = {
        //             purchasedUnit: mProductObj[i].purchasedUnit,
        //             // productRef: productObj._id,
        //             productRef: mProductObj[i].productRef._id
        //         }
        //         productQueryAry.push(tmp)
        //     }
        // }
    } catch (error) {
        console.error(error);
    }
    return Promise.all(productQueryAry);
}


const getProduct = async (product, res) => {
    // lock.acquire("get-prod-key", async function () {
    const { productObjId, purchasedUnit } = product;
    console.error("get-prod-key hold " + productObjId);
    try {

        // return value or promise
        const prod = await Product.findById(productObjId).exec();

        if (prod != null && (prod.inStock - purchasedUnit) >= 0) {
            let obj = {
                productObjId: prod._id, purchasedUnit
            }
            console.log("prod.inStock " + prod.inStock + " purchasedUnit " + purchasedUnit);
            return obj;
        }
    }
    catch (error) {
        console.error(error);
    }
}

const ProductPromise = async (producttransations, res) => {
    const promises = producttransations.map(async producttransation => {
        const product = await Product.findById(producttransation.productObjId).exec();
        const tmp = {
            product: product,
            purchasedUnit: producttransation.purchasedUnit
        }
        return tmp;
    });
    return Promise.all(promises);
}

// add-to-cart
router.post("/add-cart", (req, res) => {
    const { producttransation, purchaserobjid } = req.body;

    lock.acquire("add-cart-key", done => {
        console.log(" start locking " + process.pid);
        ProductPromise(producttransation, res).then((productList) => {
            const products = productList;
            if (products.length > 0) {

                let validPurchaseCnt = 0;
                let insuffientProd = [];
                for (let i = 0; i < products.length; ++i) {
                    // manage stocks here.. if what we have deductable

                    const currentStock = products[i].product.inStock;
                    const purchasedUnit = products[i].purchasedUnit;

                    console.log(" currentStock " + currentStock + " purchasedUnit" + purchasedUnit);

                    if (currentStock != null && (currentStock - purchasedUnit) >= 0) {
                        // sufficient stock
                        validPurchaseCnt++
                    } else {
                        // store insufficient stock product
                        insuffientProd.push(products[i].product.productName);
                    }
                }

                let productQueryAry = []

                if (validPurchaseCnt === products.length) {
                    // go ahead and minus all the stocks
                    for (let i = 0; i < products.length; ++i) {
                        const currentStock = products[i].product.inStock;
                        const purchasedUnit = products[i].purchasedUnit;


                        const availableStock = currentStock - purchasedUnit;
                        if (availableStock <= 0) { //purchase 6 - curently have 6
                            products[i].product.productStatus = "OOS";
                        }

                        products[i].product.inStock = availableStock;
                        products[i].product.save();
                        console.log(products[i].product.productStatus + ": availableStock " + availableStock + " previous stock " + currentStock + " purchasedUnit " + purchasedUnit);

                        var productTmp = {
                            purchasedUnit,
                            productRef: products[i].product._id
                        }
                        productQueryAry.push(productTmp);
                    }

                    if (productQueryAry.length > 0) {
                        purchaser.findById(purchaserobjid, (err, purchaserDoc) => {
                            if (err) return handleError(new Error(err), res);

                            const productTx = new ProductTransaction({
                                transactionStatus: 'RESERVED',
                                reservedDate: moment(),
                                transactionId: helper.generateRunningNumber("TXU"),
                                productId: productQueryAry,
                                // assign the _id from the Product
                                purchaser: purchaserDoc._id // assign purchaser
                            });

                            ProductTransaction.create(
                                productTx,
                                function (err, entity) {
                                    if (err) return handleError(err, res);
                                    // saved!
                                    res.send({ message: 'product-transaction-created', entity: entity })
                                });
                            done(null, "product-transaction-created");
                        });
                    } else {
                        done(err, "Insufficient stock")
                        return handleError(new Error("Insufficient stock " + JSON.stringify(insuffientProd)), res);
                    }
                } else {
                    done(null, "Insufficient stock")
                    return handleError(new Error("Insufficient stock " + JSON.stringify(insuffientProd)), res);
                }
            }
        });

    }, (err, ret) => {
        if (err) console.log(" there's error over here " + err);
        else {
            // lock released
            console.log("lock release " + process.pid + " ret " + ret);
        }
    });
});






// get transaction based on type of productname, category, time
router.get("/transaction", async (req, res) => {



});




var timer;

var stopTimer = () => {
    clearInterval(timer);
}

router.get("/check-timer", (req, res) => {
    if (document.cookie.indexOf(timer_cookie_name + "=") >= 0) {
        // time is up, the item will be released
    }
})



router.get("/start-timer", (req, res) => {
    let start = new Date();
    let end = moment(start).add(1, 'm');

    let interval = end - start;

    console.log("start " + new Date(start));
    console.log("end " + new Date(end));


    // this code should be at the front end.
    timer = setInterval(
        () => {
            var rightnow = new Date();
            var displayTimer = end - rightnow; // 

            if (displayTimer < -1) { // if the interval equals to 
                // clear timer

                stopTimer(timer);

                res.clearCookie('SMGTimer');
                res.send({ message: 'Times up' });
            } else {
                // console.log(moment(date).format("mm:ss"));
                //console.log(moment.utc(displayTimer).format('mm:ss'));
                //  res.setHeader('Set-Cookie', 'SMGTimer=' + end + ';expires=' + new Date(end) + '; HttpOnly')
                res.cookie(process.env.timer_cookie_name, new Date(end).getTime().toString(), {
                    //expires: process.env.cookie_expire_ms,
                    maxAge: process.env.cookie_expire_ms,
                    httpOnly: true
                });

            }
        }, // callback,
        1000// seconds
    )


});

const getInterval = (interval) => {
    var rightnow = moment();
    var displayTimer = interval - rightnow;

    console.log(moment(displayTimer).format("hh:mm"));
}






module.exports = router;
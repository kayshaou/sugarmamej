const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const ProductTransaction = require("../model/productTransaction")
const helper = require("../helper/utils");
const moment = require("moment");
const escapeStringRegexp = require('escape-string-regexp');

const handleError = (err, res) => {
    res.status(500).send({ error: 'Error occurred ' + err })
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
// add-to-cart
router.post("/add-cart", (req, res) => {
    const { productObjId } = req.body;

    // find Obj Id make sure can be found 
    Product.findById(productObjId, function (err, product) {
        if (err) return handleError(err, res);

        const productTx = new ProductTransaction({
            transactionStatus: 'RESERVED',
            reservedDate: moment(),
            transactionId: helper.generateRunningNumber("TXU"),
            productId: product._id    // assign the _id from the Product
        });

        ProductTransaction.create(
            productTx,
            function (err, entity) {
                if (err) return handleError(err, res);
                // saved!
                res.send({ message: 'product-transaction-created', entity: entity })
            });
    });
})


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
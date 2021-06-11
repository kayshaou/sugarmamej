const express = require("express");
var cookieParser = require('cookie-parser');
const helper = require("./helper/utils");

const app = express();

// import 
const auth = require("./middleware/auth");
const dbconnect = require("./middleware/dbconnect");

// routes 
const productRoutes = require("./routes/product-route");
const purchaserRoutes = require("./routes/purchaser-route");
const paymentRoutes = require("./routes/payment-route");
const subscriptionRoutes = require("./routes/subscription-route");
const accountRoutes = require("./routes/account-route")

const paypalapi = require("./middleware/paypal")
var cors = require('cors');
app.use(cookieParser());
app.use(express.json());
// to use cors

app.use(express.urlencoded({ extended: false }));
app.use(cors());


app.use("/product", productRoutes);
app.use("/purchaser", purchaserRoutes);
app.use("/payment", paymentRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/account", accountRoutes);

dbconnect.connect();

app.get("/token", (req, res) => {
    // const response = paypalapi.getAuthToken();
    //console.log(response);
    paypalapi.getAuthToken(req, res);
})

app.get("/", (req, res) => {
    res.send({ message: 'Welcome Adrian' });
    // helper.sendEmail('anocha.t@gmail.com', 'anocha.t@gmail.com', '<h2>Welcome to the world</h2>')
})

app.post("/sign", (req, res) => {
    auth.sign(req, res);
})






app.post("/verify", auth.verify, (req, res) => {
    res.send({ message: 'Welcome' });
})

let port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(" listening at port " + port);
})

module.exports = app
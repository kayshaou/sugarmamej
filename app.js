const express = require("express");
var cookieParser = require('cookie-parser');


const app = express();
// import 
// const auth = require("./middleware/auth");
const dbconnect = require("./middleware/dbconnect");

const productRoutes = require("./routes/product-route");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/product", productRoutes);

dbconnect.connect();

app.get("/", (req, res) => {
    // res.send({ message: 'Welcome' });
})

app.post("/sign", (req, res) => {
    auth.sign(req, res);
})

// app.post("/verify", auth.verify, (req, res) => {
//     res.send({ message: 'Welcome' });
// })

let port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(" listening at port 5000");
})

module.exports = app;
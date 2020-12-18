const express = require("express");
const app = express();
// import 
const auth = require("./middleware/auth");

const dbconnect = require("./middleware/dbconnect");

app.use(express.json());

dbconnect.connect();

app.get("/", (req, res) => {
    res.send({ message: 'Welcome' });
})

app.post("/sign", (req, res) => {
    auth.sign(req, res);
})

app.post("/verify", auth.verify, (req, res) => {
    res.send({ message: 'Welcome' });
})




app.listen(5000, () => {
    console.log(" listening at port 5000");
})
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const app = express();

// import 
const auth = require("./middleware/auth");
const paypalapi = require("./middleware/paypal");
// dbconnection
const dbconnect = require("./middleware/dbconnect");

app.use('/graphQL', graphqlHTTP({
    graphiql: true
}));

app.use(express.json());

// dbconnect.connect();


app.get("/", paypalapi.getAuthToken, (req, res) => {
    // const response = paypalapi.getAuthToken();
    //console.log(response);
    res.send({ message: 'Welcome ' });

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
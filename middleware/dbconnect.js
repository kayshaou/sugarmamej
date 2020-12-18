const mongoose = require("mongoose");
require('dotenv').config();

const connectionstring = "mongodb+srv://" + process.env.mongodbusername + ":" + process.env.mongodbpassword + "@cluster0.euviq.mongodb.net/myDatabase?retryWrites=true&w=majority"


const dbConnect = {
    connect: () => {
        const mongoose = require('mongoose');
        mongoose.connect(connectionstring,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }).then(
                console.log("mongo DB connected")
            ).catch((err) => console.log(err.message));
    }
}



module.exports = dbConnect;


const axios = require("axios");
const request = require("request");
let express = require('express');
let cookieParser = require('cookie-parser');

//setup express app 
let app = express();
app.use(cookieParser());
require('dotenv').config();

const rootEndPoint = process.env.paypalsandboxurl;
const paypalclientid = process.env.paypalclientid;
const paypalsecret = process.env.paypalsecret;

const paypalAPI = {
    // get auth token 
    // getAuthToken: (reques, response, next) => {
    getAuthToken: (reques, response) => {
        try {
            // const token = paypalclientid + ':' + paypalsecret;

            // let bufferObj = Buffer.from(token, "utf8");
            // // const hash = Base64.encode(token);
            // let hash = bufferObj.toString("base64");
            // //let base64String = bufferObj.toString("base64"); 
            // console.log(hash);

            request.post({
                uri: rootEndPoint + '/oauth2/token',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Language': 'en_US',
                    'content-type': 'application/x-www-form/urlencoded'
                },
                auth: {
                    'user': paypalclientid,
                    'pass': paypalsecret
                },
                form: {
                    "grant_type": "client_credentials"
                }
            }, function (err, res, body) {
                // console.log(body);
                if (body != undefined) {
                    const reply = JSON.parse(body);
                    console.log(reply.access_token);
                    response.send({ token: reply.access_token })

                    // response.setHeader('Set-Cookie', 'pToken=' + reply.access_token + '; HttpOnly');
                    // next();
                } else {
                    response.send({ message: 'error ' + err.message })
                }
            });


        } catch (error) {
            console.error(error);
        }
    },
    verifyToken: () => {

    }
}




/*
async function getUser() {
  try {
    const response = await axios.get('/user?ID=12345');
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

*/

module.exports = paypalAPI;
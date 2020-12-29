const jwt = require("jsonwebtoken");
const fs = require("fs");
const { compareSync } = require("bcrypt");

require('dotenv').config();

// const publicKey = fs.readFileSync(process.env.pub_key_path);
// const privateKey = fs.readFileSync(process.env.pem_key_path);

const secretKey = process.env.secret_key;
const authentication = {
    sign: (username, password) => {
        //const { username, password } = req.body;
        try {
            const token = jwt.sign(
                {
                    username: username,
                    password: password
                }, //payload
                secretKey,
                {
                    expiresIn: '1m',
                    // algorithm: process.env.algo,
                    issuer: process.env.issuer
                });
            return token;
        } catch (error) {
            console.error(error);
            return undefined
        }
    },
    verify: (req, res, next) => {
        // TODO
        var token = req.headers['authorization'];
        if (token === undefined) {
            res.status(403).send({ message: 'Forbidden' });
        }


        token = token.split(' ')[1];

        jwt.verify(token,
            secretKey
            // ,
            // { algorithm: process.env.algo }
            ,
            function (err, decoded) {

                if (err) {
                    var errorMsg = '';
                    if (err) {
                        errorMsg = err.message;
                    }
                    res.status(401).send({ message: 'Unauthorized', reason: errorMsg });
                } else {
                    console.log(decoded);
                    if (decoded.iss === process.env.issuer) {
                        next();
                    }
                }
            });
    }
}


module.exports = authentication;
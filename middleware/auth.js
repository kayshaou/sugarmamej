const jwt = require("jsonwebtoken");
const fs = require("fs");

require('dotenv').config();

const publicKey = fs.readFileSync("./keys/public.pub");
const privateKey = fs.readFileSync("./keys/private.pem");

const authentication = {
    sign: (req, res) => {
        const { username, password } = req.body;

        const token = jwt.sign(
            {
                username: username,
                password: password
            }, //payload
            privateKey,
            {
                expiresIn: '1m',
                algorithm: process.env.algo,
                issuer: process.env.issuer
            });
        res.header('authorization', 'Bearer ' + token);
        res.status(200).send({ 'token': token });

    },
    verify: (req, res, next) => {
        // TODO
        var token = req.headers['authorization'];
        if (token === undefined) {
            res.status(403).send({ message: 'Forbidden' });
        }


        token = token.split(' ')[1];

        jwt.verify(token,
            publicKey,
            { algorithm: process.env.algo },
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
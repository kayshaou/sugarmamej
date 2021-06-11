const uuid4 = require("uuid4");
const moment = require("moment");
const bcrypt = require('bcrypt');
require("dotenv").config();

const helper = {
    generateRunningNumber: (abbrev) => {
        let prefix = process.env.running_prefix;
        let formattedDate = moment().format("YYMMDD");
        // SGM201223
        return prefix + abbrev + formattedDate + Math.round(new Date().getTime());
    }
    ,
    hashPassword: (rawPassword) => {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(parseInt(process.env.salt_round), function (err, salt) {
                if (err) return reject(err)
                bcrypt.hash(rawPassword, salt, function (err, hash) {
                    // Store hash in your password DB.
                    if (err) return reject(err)
                    resolve(hash);
                });
            })
        });
    },
    verifyPassword: (hash, myPlaintextPassword) => {
        return new Promise((resolve, reject) => {
            bcrypt.compare(myPlaintextPassword, hash, function (err, result) {
                // result == true
                if (err) return reject(err)
                resolve(result);
            });
        })
    },
    sendEmail: (from, to, html) => {
        const sendmail = require('sendmail')({
            logger: {
                debug: console.log,
                info: console.info,
                warn: console.warn,
                error: console.error
            },
            silent: false,

            devPort: 25, // Default: False
            devHost: 'localhost', // Default: localhost
            smtpPort: 25, // Default: 25
            smtpHost: 'localhost' // Default: -1 - extra smtp host after resolveMX
        })

        sendmail({
            from,
            to,
            subject: 'test sendmail',
            html
        }, function (err, reply) {
            console.log(err && err.stack);
            console.dir(reply);
        });
    }
}




module.exports = helper;







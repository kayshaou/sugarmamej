const uuid4 = require("uuid4");
const moment = require("moment");
require("dotenv").config();

const helper = {
    generateRunningNumber: (abbrev) => {
        let prefix = process.env.running_prefix;
        let formattedDate = moment().format("YYMMDD");
        // SGM201223
        return prefix + abbrev + formattedDate + Math.round(new Date().getTime());
    }
}

module.exports = helper;







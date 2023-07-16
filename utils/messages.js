const moment = require('moment');

function formatMessage(username, text) {
    
    // to show time in Indian Standard Time (IST) since India has been on time offset of UTC+5:30
    // console.log(moment().utcOffset("+05:30").format('h:mm a'));
    
    return {
        username,
        text,
        time: moment().utcOffset("+05:30").format('h:mm a')
    };
}

module.exports = formatMessage;

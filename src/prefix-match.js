const _ = require('lodash');

function prefix_match(prefix_str, match_str) {
    let prefixes = _.words(prefix_str);
    let match = _.words(match_str);
    for (let p of prefixes) {
        let got_a_prefix = false;
        for (let m of match) {
            if (_.startsWith(m, p)) {
                got_a_prefix = true;
                break;
            }
        }
        if (!got_a_prefix) {
            return false;
        }
    }
    return true;
}

module.exports = prefix_match;

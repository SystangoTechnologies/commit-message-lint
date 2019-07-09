/**
 * Match input string with regex
 * @param {String} inputString
 * @param {String} pattern
 */
module.exports.checkRegex = (inputString, pattern) => {
    try {
        let patt = '';
        let status = false;
        if (pattern) {
            let regexObj = module.exports.regexExtractor(pattern);
            patt = new RegExp(regexObj.regexPattern, regexObj.flags);
            status = patt.test(inputString);
        } else {
            status = true;
        }
        return status;
    } catch (error) {
        return false;
    }
};

/**
 * regex Extractor
 * @param {String} rawRegexString 
 */
module.exports.regexExtractor = (rawRegexString) => {
    try {
        let result = {
            regexPattern: '',
            flags: ''
        };
        let splited = rawRegexString.split('/');
        result.flags = splited[splited.length - 1];
        splited[splited.length - 1] = '';
        result.regexPattern = splited.join('');
        return result;
    } catch (error) {
        return error;
    }
};

module.exports.checkRegex = (inputString, pattern) => {
    try {
        let patt = '';
        let status = false;
        if (pattern && pattern.regexPattern && pattern.flags) {
            patt = new RegExp(pattern.regexPattern, pattern.flags);
            status = patt.test(inputString);
        } else {
            patt = new RegExp(pattern);
            status = patt.test(inputString);
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

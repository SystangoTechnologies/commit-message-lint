const { regexExtractor } = require('../utilities/regexUtil');
const { searchFileInRepository, getFileData } = require('./repository');
const defaultJson = require('../default.json');
let exportObject = module.exports;

/**
 * get Config Data from file
 * @param {String} fileName
 * @param {String} owner
 * @param {String} repository
 * @param {Object} app
 */
module.exports.getConfigData = async (app, owner, repository, fileName) => {
    try {
        let searchFileResult;
        let fileUrl = '';
        let fileDataString = '';
        searchFileResult = await searchFileInRepository(fileName, owner, repository);
        app.log(searchFileResult);
        // files found
        if (searchFileResult && searchFileResult.items && Array.isArray(searchFileResult.items)) {
            for (let index = 0; index < searchFileResult.items.length; index++) {
                const item = searchFileResult.items[index];
                if (item.name.search(fileName) !== -1 && item.git_url) {
                    fileUrl = item.git_url;
                    break;
                }
            }
            if (fileUrl) {
                fileDataString = await getFileData(fileUrl);
            }
        }
        return fileDataString;
    } catch (error) {
        app.log(error);
    }
};

/**
 * get Regex From Config file
 * @param {String} fileName
 * @param {String} owner
 * @param {String} repository
 * @param {Object} app
 */
module.exports.getRegexFromConfig = async (app, owner, repository, fileName) => {
    try {
        let regexPatterns = {
            prTitle: '',
            commitMsg: ''
        };
        let fileDataString = await exportObject.getConfigData(app, owner, repository, fileName);
        app.log(fileDataString);
        let fileDataArray = fileDataString.split('\n');
        for (let index = 0; index < fileDataArray.length; index++) {
            const element = fileDataArray[index];
            if (element.search(defaultJson.REGEX.PR_TITLE_REGEX) !== -1) {
                const splitted = element.split('=');
                regexPatterns.prTitle = (splitted.length > 1) ? regexExtractor(splitted[1]) : '';
            }
            if (element.search(defaultJson.REGEX.COMMIT_MESSAGE_REGEX) !== -1) {
                const splitted = element.split('=');
                regexPatterns.commitMsg = (splitted.length > 1) ? regexExtractor(splitted[1]) : '';
            }
        }
        return regexPatterns;
    } catch (error) {
        return error;
    }
};

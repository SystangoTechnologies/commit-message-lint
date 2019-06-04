const defaultJson = require('../default.json');
const rp = require('request-promise');
const { base64ToString } = require('../utilities/dataConverter');
/**
 * search File In Repository
 * @param {String} fileName 
 * @param {String} owner 
 * @param {String} repository 
 */
module.exports.searchFileInRepository = async (fileName, owner, repository) => {
    try {
        let searchFileResult;
        if (fileName && owner && repository) {
            // search file in repository
            let options = {
                uri: `${process.env.GITHUB_BASE_PATH}/search/code?q=+in:file+filename:${fileName}+repo:${owner}/${repository}`,
                headers: {
                    'User-Agent': defaultJson.USER_AGENT
                },
                json: true
            };
            searchFileResult = await rp(options);
        }
        return searchFileResult;
    } catch (error) {
        return error;
    }
};

/**
 * get File Data
 * @param {String} fileUrl 
 */
module.exports.getFileData = async (fileUrl) => {
    try {
        let fileDataString = '';
        // get file data from github
        let fileInfoOption = {
            uri: fileUrl,
            headers: {
                'User-Agent': defaultJson.USER_AGENT
            },
            json: true
        };
        let fileInfo = await rp(fileInfoOption);
        if (fileInfo && fileInfo.content) {
            fileDataString = base64ToString(fileInfo.content);
        }
        return fileDataString;
    } catch (error) {

    }
}
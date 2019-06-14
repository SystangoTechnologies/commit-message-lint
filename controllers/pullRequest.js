const { checkRegex } = require('../utilities/regexUtil');
const { getRegexFromConfig } = require('../helpers/config');
const { createCheckSuite, createCheckRun, listCheckSuite } = require('../helpers/checks');
const { listCommitsOfPullRequest } = require('../helpers/pullRequest');
const defaultJson = require('../default.json');
const conclusionStatus = defaultJson.conclusion_status;
const messages = defaultJson.messages;
const checkRunStatusCompleted = defaultJson.CHECK_RUN_STATUS_COMPLETED;
const checkRunName = defaultJson.CHECK_RUN_NAME;
const outputTitleSuccess = defaultJson.output_title_success;
const outputTitleFail = defaultJson.output_title_fail;

module.exports.commitAndTitleValidator = async (app, context) => {
    try {
        let owner = context.payload.repository.owner.login;
        let repository = context.payload.repository.name;
        let pullRequestTitle = context.payload.pull_request.title;
        let pullNumber = context.payload.number;
        let regexData = await getRegexFromConfig(app, owner, repository, process.env.REGEX_CONFIG_FILE_NAME);
        // find commits
        let commits = await listCommitsOfPullRequest(context, owner, repository, pullNumber);
        let result = checkMessagesFormat(pullRequestTitle, commits.data, regexData.prTitle, regexData.commitMsg);
        if (result && result.commitIds && Array.isArray(result.commitIds) && result.commitIds.length) {
            for (let index = 0; index < result.commitIds.length; index++) {
                const commitId = result.commitIds[index];
                /**
                *  check if checkSuite exists or not for the commit
                */
                let checkSuiteList = await listCheckSuite(context, owner, repository, commitId);
                if (!checkSuiteList || (checkSuiteList && checkSuiteList.data && checkSuiteList.data.total_count && checkSuiteList.data.total_count === 0)) {
                    // create check suite for a particular commit
                    await createCheckSuite(context, owner, repository, commitId);
                }
                // create check run
                await createCheckRun(context, owner, repository, commitId, result.status, result.checkRunName, result.conclusion, result.output);
            }
        }
    } catch (error) {
        app.log(error);
    }
};

/**
 * check Messages Format
 * @param {String} pullRequestTitle 
 * @param {Array} commits
 * @param {Object} prTitleRegex
 * @param {Object} commitMsgRegex
 */
function checkMessagesFormat(pullRequestTitle, commits, prTitleRegex, commitMsgRegex) {
    try {
        let result = {};
        let commitIds = [];
        let invalidCommits = '';
        let invalidCommitsCount = 0;
        let otherInvalidCommitMessages = '';
        let conclusion = conclusionStatus.FAILURE;
        let pullReqTitleStatus = false;
        let pullReqTitleStatusMsg = '';
        let commitMsgStatus = true;
        let commitMsgStatusMsg = messages.valid_commit_message;
        let outputTitle = outputTitleFail;
        let output = {};
        /**
         * pull Request Title check : starts
         */
        // pull request title format
        let mergePattern = /^(Merge pull request)/;
        if (checkRegex(pullRequestTitle, prTitleRegex)) {
            pullReqTitleStatus = true;
            pullReqTitleStatusMsg = messages.valid_pull_request_message;
        } else {
            pullReqTitleStatus = false;
            pullReqTitleStatusMsg = messages.invalid_pull_request_message;
            // invalid pull Request title
        }
        /**
        * pull Request Title check : ends
        */
        /**
         * commit message check : starts
         */
        // find commits
        if (commits && Array.isArray(commits) && commits.length) {
            // check all commit messages
            for (let index = 0; index < commits.length; index++) {
                const element = commits[index];
                const commitMessage = element.commit.message;
                commitIds.push(commits[index].sha);
                if (!checkRegex(commitMessage, commitMsgRegex) && !checkRegex(commitMessage, mergePattern)) {
                    invalidCommitsCount++;
                    commitMsgStatus = false;
                    commitMsgStatusMsg = messages.invalid_commit_message;
                    if (invalidCommitsCount <= defaultJson.INVALID_COMMIT_LIMIT) {
                        invalidCommits += `${defaultJson.invalid_commit_list.commit_id} ${commits[index].sha} | ${defaultJson.invalid_commit_list.commit_message} ${commitMessage} <br/>`;
                        if (invalidCommitsCount === 1) {
                            otherInvalidCommitMessages = messages.single_other_invalid_message;
                        } else {
                            otherInvalidCommitMessages = messages.multiple_other_invalid_message;
                        }
                    }
                }
            }
            /**
             * commit message check : ends
             */
            /**
             * check if both the messages are valid for regex
             */
            if (pullReqTitleStatus && commitMsgStatus) {
                conclusion = conclusionStatus.SUCCESS;
                outputTitle = outputTitleSuccess;
            }

            /**
             * set check run status
             */
            output = {
                title: outputTitle,
                summary: `${pullReqTitleStatusMsg}<br/>${commitMsgStatusMsg}<br/>${invalidCommits}<br/>`
            };
            let status = checkRunStatusCompleted;
            if ((!prTitleRegex || !prTitleRegex.regexPattern) && (!commitMsgRegex || !commitMsgRegex.regexPattern)) {
                // pull request and commit message configration regex not set
                output.title = `${messages.pr_and_commit_message_configuration_not_set}`;
                output.summary = `${messages.pr_and_commit_message_configuration_not_set}<br/>`;
            } else if (!commitMsgRegex || !commitMsgRegex.regexPattern) {
                // commit message configration regex not set
                output.title = `${messages.commit_message_configuration_not_set}`;
                output.summary = `${pullReqTitleStatusMsg}<br/>${messages.commit_message_configuration_not_set}<br/>`;
            } else if (!prTitleRegex || !prTitleRegex.regexPattern) {
                // pull request configration regex not set
                output.title = `${messages.pr_configuration_not_set}`;
                output.summary = `${messages.pr_configuration_not_set}<br/>${commitMsgStatusMsg}<br/>${invalidCommits}<br/>`;
            }
            // set invalid commit messages and count
            if (invalidCommitsCount && invalidCommitsCount >= defaultJson.INVALID_COMMIT_LIMIT) {
                output.summary += `${invalidCommitsCount} ${otherInvalidCommitMessages}`;
            }
            result = {
                commitIds,
                status,
                checkRunName,
                conclusion,
                output
            };
        }
        return result;
    } catch (error) {
        console.error(error);
    }
}
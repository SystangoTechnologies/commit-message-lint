/**
 * Utils
 */
const { checkRegex } = require('../utilities/regexUtil');
/**
 * Helpers
 */
const { createCheckSuite, createCheckRun, listCheckSuite, updateCheckRun } = require('../helpers/checks');
const { listCommitsOfPullRequest, getPullRequest } = require('../helpers/pullRequest');
/**
 * Constants
 */
const constants = require('../constants.js');
const rp = require('request-promise');
const mergeCommitRegex = constants.REGEX.MERGE_COMMIT_REGEX;
const conclusionStatus = constants.conclusion_status;
const messages = constants.messages;
const checkRunStatusCompleted = constants.CHECK_RUN_STATUS_COMPLETED;
const checkRunName = constants.CHECK_RUN_NAME;
let outputTitleSuccess = constants.output_title_success;
let outputTitleFail = constants.output_title_fail;

/**
 * Commit messages and PR title Validator
 * @param {Object} app Probot app object
 * @param {Object} context Github event context
 * @param {Object} configuration Contains data (i.e regex for PR and Commits) from config.yml file
 * @param {Boolean} updateCheckRunFlag Update existing check run
 *  @param {Boolean} createCheckRunFlag Create existing check run
 */
module.exports.commitAndTitleValidator = async (app, context, configuration, updateCheckRunFlag, createCheckRunFlag) => {
    try {
        console.log('config received using single file:', configuration)
        let { owner, repository, pullRequestTitle, pullNumber } = prDetailsExtractor(context);

        if (!configuration || !configuration.PR_TITLE_REGEX || !configuration.COMMIT_MESSAGE_REGEX) {
            console.log('configuration object not found');
        }
        let { prTitleRegex, commitTitleRegex } = regexExtractor(configuration);
        /**
         * Find all commits for a pull request
         */
        let commits = await listCommitsOfPullRequest(context, owner, repository, pullNumber);
        /**
         * If `PR title` is not present in `context`
         */
        if (!pullRequestTitle) {
            /**
             * In case of new check suite requested, check re-run and check suite re-run or Re-run all checks, get
             * pull request data
             */
            const pullRequestDetails = await getPullRequest(context, owner, repository, pullNumber);
            /**
             * Get PR title
             */
            if (pullRequestDetails && pullRequestDetails.data && pullRequestDetails.data.title) {
                pullRequestTitle = pullRequestDetails.data.title;
            }
        }
        let result = checkMessagesFormat(pullRequestTitle, commits.data, prTitleRegex, commitTitleRegex, configuration);
        await createOrUpdateCheckRun(context, owner, repository, result, updateCheckRunFlag, createCheckRunFlag);
    } catch (error) {
        console.log('------error------', error);
        app.log(error);
    }
};

/**
 * Check Messages Format
 * @param {String} pullRequestTitle 
 * @param {Array} commits
 * @param {String} prTitleRegex
 * @param {String} commitMsgRegex
 */
function checkMessagesFormat(pullRequestTitle, commits, prTitleRegex, commitMsgRegex, configuration) {
    try {
        const commitMsgStatusMsg = configuration.VALID_COMMIT_MESSAGE || messages.valid_commit_message;
        let result = {};
        let commitIds = [];
        let flags = {
            pullReqTitleStatus: false,
            pullReqTitleStatusMsg: '',
            commitMsgStatus: true,
            commitMsgStatusMsg,
            invalidCommits: '',
            invalidCommitsCount: 0,
            otherInvalidCommitMessages: ''
        };
        checkPrTitle(pullRequestTitle, prTitleRegex, flags, configuration);
        if (commits && Array.isArray(commits) && commits.length) {
            /**
             * Check all commit messages
             */
            checkCommitMessages(commits, commitIds, commitMsgRegex, mergeCommitRegex, flags, configuration);
            result = concludeCheckRunParams(prTitleRegex, commitMsgRegex, commitIds, flags, configuration);
        }
        return result;
    } catch (error) {
        console.error(error);
    }
}

/**
 * Match pull request Title with regex
 * @param {String} pullRequestTitle 
 * @param {String} prTitleRegex 
 * @param {Object} flags 
 */
function checkPrTitle(pullRequestTitle, prTitleRegex, flags, configuration) {
    /**
     * Check pull request title format
     */
    const validPullRequestMessage = configuration.VALID_PULL_REQUEST_MESSAGE || messages.valid_pull_request_message;
    const invalidPullRequestMessage = configuration.INVALID_PULL_REQUEST_MESSAGE || messages.invalid_pull_request_message;

    if (checkRegex(pullRequestTitle, prTitleRegex)) {
        flags.pullReqTitleStatus = true;
        flags.pullReqTitleStatusMsg = validPullRequestMessage;
    } else {
        /**
         * Invalid pull Request title
         */
        flags.pullReqTitleStatus = false;
        flags.pullReqTitleStatusMsg = invalidPullRequestMessage;
    }
}

/**
 * Match commit messages with regex
 * @param {Array} commits
 * @param {Array} commitIds
 * @param {String} commitMsgRegex
 * @param {String} mergeCommitRegex
 * @param {Object} flags
 */
function checkCommitMessages(commits, commitIds, commitMsgRegex, mergeCommitRegex, flags, configuration) {
    /**
     * Check all commit messages
     */
    const commitMsgStatusMsg = configuration.INVALID_COMMIT_MESSAGE || messages.invalid_commit_message;
    const singleOtherInvalidMessage = configuration.SINGLE_OTHER_INVALID_MESSAGE || messages.single_other_invalid_message;
    const multipleOtherInvalidMessage = configuration.MULTIPLE_OTHER_INVALID_MESSAGE || messages.multiple_other_invalid_message;

    for (let index = 0; index < commits.length; index++) {
        const element = commits[index];
        const commitMessage = element.commit.message;
        commitIds.push(commits[index].sha);
        if (!checkRegex(commitMessage, commitMsgRegex) && !checkRegex(commitMessage, mergeCommitRegex)) {
            flags.invalidCommitsCount++;
            flags.commitMsgStatus = false;
            flags.commitMsgStatusMsg = commitMsgStatusMsg;
            if (flags.invalidCommitsCount <= constants.INVALID_COMMIT_LIMIT) {
                flags.invalidCommits += `${constants.invalid_commit_list.commit_id} ${commits[index].sha} | ${constants.invalid_commit_list.commit_message} ${commitMessage} <br/>`;
                if (flags.invalidCommitsCount === 1) {
                    flags.otherInvalidCommitMessages = singleOtherInvalidMessage;
                } else {
                    flags.otherInvalidCommitMessages = multipleOtherInvalidMessage;
                }
            }
        }
    }
}

/**
 * Conclude check run params according to regex match status
 * @param {String} prTitleRegex 
 * @param {String} commitMsgRegex 
 * @param {Array} commitIds 
 * @param {Object} flags 
 */
function concludeCheckRunParams(prTitleRegex, commitMsgRegex, commitIds, flags, configuration) {
    let checkRunParams = {};
    let output = {};
    outputTitleFail = configuration.OUTPUT_TITLE_FAIL || outputTitleFail;
    outputTitleSuccess = configuration.OUTPUT_TITLE_SUCCESS || outputTitleFail;
    console.log('outputTitleFail', outputTitleFail)
    console.log('outputTitleSuccess', outputTitleSuccess)
    let outputTitle = outputTitleFail;
    let conclusion = conclusionStatus.FAILURE;
    /**
     * check if both the messages are valid for regex
     */
    if (flags.pullReqTitleStatus && flags.commitMsgStatus) {
        conclusion = conclusionStatus.SUCCESS;
        outputTitle = outputTitleSuccess;
    }

    /**
     * set check run status
     */
    output = {
        title: outputTitle,
        summary: `${flags.pullReqTitleStatusMsg}<br/>${flags.commitMsgStatusMsg}<br/>${flags.invalidCommits}<br/>`
    };
    let status = checkRunStatusCompleted;
    if (!prTitleRegex && !commitMsgRegex) {
        /**
         * Pull request and commit message configration regex not set
         */
        output.title = `${messages.pr_and_commit_message_configuration_not_set}`;
        output.summary = `${messages.pr_and_commit_message_configuration_not_set}<br/>`;
    } else if (!commitMsgRegex) {
        /**
         * Commit message configration regex not set
         */
        output.title = `${messages.commit_message_configuration_not_set}`;
        output.summary = `${flags.pullReqTitleStatusMsg}<br/>${messages.commit_message_configuration_not_set}<br/>`;
    } else if (!prTitleRegex) {
        /**
         * Pull request configration regex not set
         */
        output.title = `${messages.pr_configuration_not_set}`;
        output.summary = `${messages.pr_configuration_not_set}<br/>${flags.commitMsgStatusMsg}<br/>${flags.invalidCommits}<br/>`;
    }
    /**
     * Set invalid commit messages and count
     */
    if (flags.invalidCommitsCount && flags.invalidCommitsCount >= constants.INVALID_COMMIT_LIMIT) {
        output.summary += `${flags.invalidCommitsCount} ${flags.otherInvalidCommitMessages}`;
    }
    checkRunParams = {
        commitIds,
        status,
        checkRunName,
        conclusion,
        output
    };
    return checkRunParams;
}

/**
 * Extractor pull request details from context
 * @param {Object} context 
 */
function prDetailsExtractor(context) {
    let result = {
        owner: '',
        repository: '',
        pullRequestTitle: '',
        pullNumber: 0
    };
    if (context.payload) {
        /**
         * Extract repository details
         */
        if (context.payload.repository) {
            if (context.payload.repository.owner && context.payload.repository.owner.login) {
                result.owner = context.payload.repository.owner.login;
            }
            if (context.payload.repository.name) {
                result.repository = context.payload.repository.name;
            }
        }
        /**
         * Extract PR title and pull number
         */
        if (context.payload.pull_request && context.payload.pull_request.title) {
            result.pullRequestTitle = context.payload.pull_request.title;
        }
        if (context.payload.number) {
            result.pullNumber = context.payload.number;
        } else if (context.payload.check_run && context.payload.check_run.check_suite && context.payload.check_run.check_suite.pull_requests && context.payload.check_run.check_suite.pull_requests.length && context.payload.check_run.check_suite.pull_requests[0].number) {
            result.pullNumber = context.payload.check_run.check_suite.pull_requests[0].number;
        } else if (context.payload.check_suite && context.payload.check_suite.pull_requests.length && context.payload.check_suite.pull_requests[0].number) {
            result.pullNumber = context.payload.check_suite.pull_requests[0].number;
        }
    }
    return result;
}

/**
 * Extract regex from configuration file in .github folder in user's repository
 * @param {Object} configuration 
 */
function regexExtractor(configuration) {
    let result = {
        prTitleRegex: '',
        commitTitleRegex: ''
    };
    result.prTitleRegex = (configuration && configuration.PR_TITLE_REGEX) ? configuration.PR_TITLE_REGEX : '';
    result.commitTitleRegex = (configuration && configuration.COMMIT_MESSAGE_REGEX) ? configuration.COMMIT_MESSAGE_REGEX : '';
    return result;
}

/**
 * Create Or Update Check Run as per conditions
 * @param {Object} context 
 * @param {String} owner 
 * @param {String} repository 
 * @param {Object} result 
 * @param {boolean} updateCheckRunFlag
 *  @param {boolean} createCheckRunFlag
 */
async function createOrUpdateCheckRun(context, owner, repository, result, updateCheckRunFlag, createCheckRunFlag) {
    if (result && result.commitIds && Array.isArray(result.commitIds) && result.commitIds.length) {
        for (let index = 0; index < result.commitIds.length; index++) {
            const commitId = result.commitIds[index];
            if (updateCheckRunFlag) {
                /**
                 * Update existing check run
                 */
                const checkRunId = context.payload.check_run.id;
                await updateCheckRun(context, owner, repository, commitId, result.status, result.conclusion, result.output, checkRunId);
            } else if (createCheckRunFlag) {
                /**
                 * Create check new run
                 */
                /**
                 *  check if checkSuite exists or not for the commit
                 */
                let checkSuiteList = await listCheckSuite(context, owner, repository, commitId);
                if (!checkSuiteList || (checkSuiteList && checkSuiteList.data && checkSuiteList.data.total_count && checkSuiteList.data.total_count === 0)) {
                    /**
                     * create check suite for a particular commit
                     */
                    await createCheckSuite(context, owner, repository, commitId);
                }
                /**
                 * create check run
                 */
                await createCheckRun(context, owner, repository, commitId, result.status, result.checkRunName, result.conclusion, result.output);
            }
        }
    }
}
/**
 * create Check Suite
 * @param {Object} context The title of the pull request.
 * @param {String} owner
 * @param {String} repo
 * @param {String} commitId
 */
module.exports.createCheckSuite = async (context, owner, repo, commitId) => {
    try {
        let params = {
            owner: owner,

            repo: repo,
            /**
             * The sha of the head commit.
             */
            head_sha: commitId,
        };
        let checkSuite = await context.github.checks.createSuite(params);
        return checkSuite;
    } catch (error) {
        return error;
    }
};

/**
 * create CheckRun for a commit
 * @param {Object} context The title of the pull request.
 * @param {String} owner
 * @param {String} repo
 * @param {String} commitId
 * @param {String} status
 * @param {String} checkRunName
 * @param {String} conclusion
 */
module.exports.createCheckRun = async (context, owner, repo, commitId, status, checkRunName, conclusion, output) => {
    try {
        let params = {
            owner: owner,
            repo: repo,
            /**
             * The name of the check. For example, "code-coverage".
             */
            name: checkRunName,
            /**
             * The SHA of the commit.
             */
            head_sha: commitId,
            /**
             * The current status. Can be one of `queued`, `in_progress`, or `completed`.
             */
            status: status,
            /**
             * The time that the check run began in ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`.
             */
            started_at: new Date().toISOString(),
            conclusion: conclusion,
            completed_at: new Date().toISOString(),
            output: output
        };
        let checkRun = await context.github.checks.create(params);
        return checkRun;
    } catch (error) {
        return error;
    }
};

/**
 * list Check Suite for a commit
 * @param {Object} context The title of the pull request.
 * @param {String} owner
 * @param {String} repo
 * @param {String} ref
 */
module.exports.listCheckSuite = async (context, owner, repo, ref) => {
    try {
        let params = {
            owner: owner,
            repo: repo,
            ref: ref
        };
        let checkRun = await context.github.checks.listSuitesForRef(params);
        return checkRun;
    } catch (error) {
        return error;
    }
};
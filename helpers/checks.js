/**
 * create Check Suite
 * @param {Object} context
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
 * @param {Object} context
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
 * @param {Object} context
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

/**
 * Update CheckRun for a commit
 * @param {Object} context
 * @param {String} owner
 * @param {String} repo
 * @param {String} commitId
 * @param {String} status
 * @param {String} checkRunName
 * @param {String} conclusion
 */
module.exports.updateCheckRun = async (context, owner, repo, commitId, status, conclusion, output, checkRunId) => {
    try {
        let params = {
            check_run_id: checkRunId,
            owner: owner,
            repo: repo,
            /**
             * The name of the check. For example, "code-coverage".
             */
            name: context.payload.check_run.name,
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
          await context.github.checks.update(params);
    } catch (error) {
        return error;
    }
};

/**
 * list Check runs for a check suite
 * @param {Object} context
 * @param {String} owner
 * @param {String} repo
 * @param {String} checkSuiteId
 */
module.exports.listCheckSuite = async (context, owner, repo, checkSuiteId) => {
    try {
        let params = {
            owner: owner,
            repo: repo,
            check_suite_id: checkSuiteId
        };
        let checkRunList = await context.github.checks.listForSuite(params);
        return checkRunList;
    } catch (error) {
        return error;
    }
};

/**
 * list of check runs For a check Suite
 * @param {Object} context
 * @param {String} owner
 * @param {String} repo
 * @param {String} checkSuiteId
 */
module.exports.listForSuite = async (context, owner, repo, checkSuiteId) => {
    try {
        let params = {
            owner: owner,
            repo: repo,
            check_suite_id: checkSuiteId
        };
        let listForSuite = await context.github.checks.listForSuite(params);
        return listForSuite;
    } catch (error) {
        return error;
    }
};

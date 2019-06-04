/**
 * list Commits Of Pull Request
 * @param {Object} context The title of the pull request.
 * @param {String} owner
 * @param {String} repo
 * @param {String} pullNumber
 * @param {String} perPage
 * @param {String} pageNo
 */
module.exports.listCommitsOfPullRequest = async (context, owner, repo, pullNumber, perPage, pageNo) => {
    try {
        let params = {
            owner: owner,
            repo: repo,
            number: pullNumber
        };
        if (perPage) {
            params.per_page = perPage;
        }
        if (pageNo) {
            params.page = pageNo;
        }
        // find commits
        let commits = await context.github.pullRequests.listCommits(params);
        return commits;
    } catch (error) {
        return error;
    }
};
const { listForSuite } = require('../helpers/checks');

module.exports.listForSuite = async (app, context) => {
    try {
        const owner = context.payload.repository.owner.login;
        const repository = context.payload.repository.name;
        const checkSuiteId = context.payload.check_suite.id;
        const listOfCheckRuns =  await listForSuite(context, owner, repository, checkSuiteId);
        return listOfCheckRuns;
    } catch (error) {
        app.log(error);
        return error;
    }
};

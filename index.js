const { commitAndTitleValidator } = require('./controllers/pullRequest');
const express = require('express');
const expressApp = express();
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = async app => {
  /**
   * pull request event listener
   */
  app.on('pull_request.opened', async (context) => {
    await commitAndTitleValidator(app, context);
  });

  expressApp.get('/', (req, res) => {
    res.send('Commit Validator Message App');
  });

  app.router.use('/', expressApp);
};


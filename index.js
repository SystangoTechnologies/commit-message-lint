const { commitAndTitleValidator } = require('./controllers/pullRequest');
const { messages, events } = require('./default.json');
const express = require('express');
const expressApp = express();
const path = require('path');
const publicDirectory = `${__dirname}/public`;

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
const ConfigFilename = process.env.REGEX_CONFIG_FILE_NAME;

module.exports = async app => {
  /**
   * Created pull request event listener
   */
  app.on(events.PULL_REQUEST_OPEN, async (context) => {
    const configuration = await context.config(ConfigFilename);
    await commitAndTitleValidator(app, context, configuration);
  });

  expressApp.get('/', (req, res) => {
    res.send(messages.home_page_message);
  });

  expressApp.get('/privacy', (req, res) => {
    res.sendFile(path.join(`${publicDirectory}/privacy.html`));
  });

  app.router.use('/', expressApp);
};

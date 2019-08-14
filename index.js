/**
 * Packages
 */
const express = require('express');
const expressApp = express();
const path = require('path');

/**
 * Controllers
 */
const { commitAndTitleValidator } = require('./controllers/pullRequest');
const { listForSuite } = require('./controllers/checks');

/**
 * Constants
 */
const { configFileName, messages, events } = require('./constants.js');
const publicDirectory = path.join(`${__dirname}`, 'public');

/**
 * This is the main entrypoint to Probot app
 * @param {import('probot').Application} app
 */
module.exports = async app => {
  /**
   * Created pull request event listener
   */
  app.on(events.PULL_REQUEST_OPEN, async (context) => {
    try {
      const configuration = await context.config(configFileName);
      await commitAndTitleValidator(app, context, configuration, false, true);
    } catch (error) {
      app.log(error);
    }
  });
  /**
   * Check re-run event listener
   */
  app.on(events.CHECK_RUN_REREQUESTED, async (context) => {
    try {
      const configuration = await context.config(configFileName);
      await commitAndTitleValidator(app, context, configuration, true, false);
    } catch (error) {
      app.log(error);
    }
  });
  /**
   * Re-run all checks (Check Suite Re-requested) event listener
   */
  app.on(events.CHECK_SUITE_REREQUESTED, async (context) => {
    try {
      const listOfCheckRuns = await listForSuite(app, context);
      context.payload.check_run = {
        id: listOfCheckRuns.data.check_runs[0].id
      };
      const configuration = await context.config(configFileName);
      await commitAndTitleValidator(app, context, configuration, true, false);
    } catch (error) {
      app.log(error);
    }
  });
  /**
   * Run all checks (Check Suite Requested) event listener
   */
  app.on(events.CHECK_SUITE_REQUESTED, async (context) => {
    try {
      const configuration = await context.config(configFileName);
      await commitAndTitleValidator(app, context, configuration, false, true);
    } catch (error) {
      app.log(error);
    }
  });

  /**
   * Web APIs
   */
  /**
   * Home page API 
   */
  expressApp.get('/', (req, res) => {
    res.send(messages.home_page_message);
  });
  /**
   * Privacy page API
   */
  expressApp.get('/privacy', (req, res) => {
    res.sendFile(path.join(`${publicDirectory}`, 'privacy.html'));
  });

  app.router.use('/', expressApp);
};

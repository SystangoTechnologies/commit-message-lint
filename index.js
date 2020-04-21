/**
 * Packages
 */
const express = require('express');
const expressApp = express();
const path = require('path');
const bodyParser = require('body-parser');
const {
  verifyWebhookData
} = require('./middleware/verifyWebhooks');
/**
 * Controllers
 */
const {
  commitAndTitleValidator
} = require('./controllers/pullRequest');
const {
  marketplaceEventHandlers,
  getAccessToken
} = require('./controllers/marketplace');
const {
  listForSuite
} = require('./controllers/checks');

/**
 * Constants
 */
const {
  configFileName,
  messages,
  events
} = require('./constants.js');
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
      console.log('Error while performing operation in Event PULL_REQUEST_OPEN', error);
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
      console.log('Error while performing operation in Event CHECK_RUN_REREQUESTED', error);
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
      console.log('Error while performing operation in Event CHECK_SUITE_REREQUESTED', error);
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
      console.log('Error while performing operation in Event CHECK_SUITE_REQUESTED', error);
      app.log(error);
    }
  });

  app.on(events.CHECK_SUITE, async context => {
    try {
      const configuration = await context.config(configFileName);
      await commitAndTitleValidator(app, context, configuration, false, true);
    } catch (error) {
      console.log('Error while performing operation in Event CHECK_SUITE', error);
      app.log(error);
    }
  });

  /**
   * Middlewares
   */
  expressApp.use(bodyParser.json());
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
  /**
   * Marketplace API
   * This API gets hit by github on any marketplace event
   */
  expressApp.post('/marketplace', verifyWebhookData, marketplaceEventHandlers);

  /**
   * This API gets hit when redirected by `POST: /marketplace` API
   * This API exchanges code with github for accessToken
   */
  expressApp.get('/auth', getAccessToken);

  app.router.use('/', expressApp);
};
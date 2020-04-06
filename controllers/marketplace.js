/**
 * Packages
 */
const rp = require('request-promise');
/**
 * Constants
 */
const { OAUTH_ENDPOINT } = require('../constants');

/**
 * Controllers
 */
module.exports.marketplaceEventHandlers = async (req, res) => {
   try {
      let body = req.body;
      if(body.action && eventHandlers[body.action]) {
         await eventHandlers[body.action](req, res, body);
      }
   } catch (error) {
      console.log(error);
   }
};

module.exports.getAccessToken = async (req, res) => {
   try {
      const query = req.query;
      const getAccessToken = `${OAUTH_ENDPOINT}/access_token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${query.code}&redirect_uri=${process.env.REDIRECT_URI}&state=${query.STATE}`;
      let accessToken = await rp(getAccessToken);
      res.json(accessToken);
   } catch (error) {
      console.log(error);
   }
};

/**
 * Market place event handlers
 * TODO: Move to separate file after finalizing structure
 */
let eventHandlers = {
   purchased: async (req, res, eventData) => {
      let purchaserData = eventData.marketplace_purchase;
      const oAuthUrl = `${OAUTH_ENDPOINT}/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&state=${process.env.STATE}&login=${purchaserData.account.login}`;
      res.redirect(oAuthUrl);
   }
};
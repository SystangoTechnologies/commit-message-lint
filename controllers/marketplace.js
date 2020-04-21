/**
 * Packages
 */
const rp = require('request-promise');
/**
 * Constants
 */
const { OAUTH_ENDPOINT, INSTALLATION_PATH } = require('../constants');

/**
 * Controllers
 */
module.exports.marketplaceEventHandlers = async (req, res) => {
   try {
      let body = req.body;
      console.log('marketplaceEventHandlers ==> ', body);
      if(body.action && eventHandlers[body.action]) {
         await eventHandlers[body.action](req, res, body);
      }
   } catch (error) {
      console.log('Error while marketplaceEventHandlers => ', error);
   }
};

module.exports.getAccessToken = async (req, res) => {
   try {
      const query = req.query;
      console.log('AccessToken API call started');
      const getAccessToken = `${OAUTH_ENDPOINT}/access_token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${query.code}&redirect_uri=${process.env.REDIRECT_URI}&state=${query.STATE}`;
      let accessToken = await rp(getAccessToken);
      console.log('AccessToken API call completed');
      res.redirect(INSTALLATION_PATH);
   } catch (error) {
      console.log('Error while getAccessToken => ', error);
   }
};

/**
 * Market place event handlers
 * TODO: Move to separate file after finalizing structure
 */
let eventHandlers = {
   purchased: async (req, res, eventData) => {
      let purchaserData = eventData.marketplace_purchase;
      console.log('Event purchased triggered', purchaserData);
      /**
       * TODO: Authenticate user with github in future if we maintian user information in our database and we need to call user specific detials from github.
       */
      // const oAuthUrl = `${OAUTH_ENDPOINT}/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&state=${process.env.STATE}&login=${purchaserData.account.login}`;
      // console.log('oAuthUrl', oAuthUrl);
      // res.redirect(oAuthUrl);
      return res.json().status(200);
   },
   cancelled: async (req, res, eventData) => {
      let purchaserData = eventData.marketplace_purchase;
      console.log('Event cancelled triggered', purchaserData);
      return res.json().status(200);
   },
   pending_change: async (req, res, eventData) => {
      let purchaserData = eventData.marketplace_purchase;
      console.log('Event pending_change triggered', purchaserData);
      return res.json().status(200);
   },
   pending_change_cancelled: async (req, res, eventData) => {
      let purchaserData = eventData.marketplace_purchase;
      console.log('Event pending_change_cancelled triggered', purchaserData);
      return res.json().status(200);
   },
   changed: async (req, res, eventData) => {
      let purchaserData = eventData.marketplace_purchase;
      console.log('Event changed triggered', purchaserData);
      return res.json().status(200);
   }
};
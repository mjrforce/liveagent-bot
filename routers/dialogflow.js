//init constants
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const constants = require('../constants');
const dialogflow = require('../helpers/dialogflow');

router.use(bodyParser.json());

//Create the endpoint for Dialogflow (API.AI) webhook
router.post('/', function (req, res) {
  //compare auth token from header to value on server
  if (constants.APIAI_REQUIRE_AUTH) {
    if (req.headers['auth-token'] !== constants.APIAI_AUTH_TOKEN) {
      return res.status(401).send('Unauthorized')
    }
  };

  // and some validation too
  if (!req.body || !req.body.result || !req.body.result.parameters) {
    return res.status(400).send('Bad Request. hombre.')
  }

  var webhookReply = dialogflow.processWebhook(req.body);
  console.log(webhookReply);

  //Send the response
  res.status(200).json({
    source: 'webhook',
    speech: webhookReply,
    displayText: webhookReply
  });
});

module.exports = router

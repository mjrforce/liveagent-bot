const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const dialogflow = require('../helpers/dialogflow');
const constants = require('../constants');
const twilio = require('twilio');
const client = new twilio(constants.TWILIO_ACCOUNT_SID, constants.TWILIO_AUTH_TOKEN);
const VoiceResponse = twilio.twiml.VoiceResponse;
// middleware that is specific to this router

router.use(bodyParser.urlencoded({extended: false}));

router.get('/sms', function (req, res) {
  res.send('You must POST your request')
});

router.get('/voice', function (req, res) {
  res.send('You must POST your request')
});

// define the post route for SMS
router.post('/sms', function (req, res) {
  console.log(req.body);
  dialogflow.processMessage(req.body.Body, req.body.From, 'SMS',
    {
      id: req.body.From,
      name: req.body.From
    }).then(function(result){

     if(result.result.fulfillment.speech != '')
     res.send("<Response><Message>" + result.result.fulfillment.speech + "</Message></Response>");
    });
});

// define the post route for voice
router.post('/voice', function (req, res) {
     var twiml = new VoiceResponse();
     twiml.say('Never gonna give you up.', {
       voice: 'alice'
     });
     // Render the response as XML in reply to the webhook request
     res.type('text/xml');
     res.send(twiml.toString());
});

module.exports = router

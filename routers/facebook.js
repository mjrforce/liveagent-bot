//Init constants
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const facebook = require('../helpers/facebook');
const dialogflow = require('../helpers/dialogflow');
const constants = require('../constants');

router.use(bodyParser.json());

//Handler for all get requests. Use as facebook webhook.
router.get('/', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === constants.FB_AUTH_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

//Handler for all post requests
router.post('/', (req, res) => {

  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      //entry.messaging.forEach((event) => {

         var event = entry.messaging[0];
         console.log(JSON.stringify(event));
        if (event.message && event.message.text) {
          facebook.getName(event.sender.id)
          .then(function(result){
            var r = JSON.parse(result);
            return dialogflow.processMessage(event.message.text,
                                             event.sender.id,
                                             'Facebook',
                                            {
                                              id: event.sender.id,
                                              name: r.first_name + ' ' + r.last_name
                                            }
                                          );
          }).then(function(result){
               if(result.result.fulfillment.speech != '')
               return facebook.post(event.sender.id, result.result.fulfillment.speech);
          });
        }
      //});
    });
    res.status(200).end();
  }
});

module.exports = router

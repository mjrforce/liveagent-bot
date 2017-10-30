//Init constants
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bootstrap = require('alexa-bootstrap');
const salesforce = require('../helpers/salesforce');
const alexa = new bootstrap();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//Launch intent
alexa.launch( function( request, response ) {
  //What to say when Alexa app is first opened.
  response.say('Welcome to My App.' );
}) ;

//Example of an intent that uses slots
alexa.intent('welcomeUser',
  (req,res, slots) => {
    res.say("Welcome "+ slots.name).end();
    var name = slots.name;
    //log Bot Chat to Salesforce
    salesforce.logToSalesforce('Bot',
                               'Alexa',
                               {id: req.data.session.sessionId  , name: name},
                               req.data.session.sessionId,
                               'My name is ' + name,
                               'Hello ' + name
                              );
  });

//end point for Alexa config. https://<myapp>.herokuapp.com/alexa/myapp
router.post('/myapp', function(req, res){
  alexa.request(req.body).then(function(response){
    res.json(response);
  })
});
module.exports = router

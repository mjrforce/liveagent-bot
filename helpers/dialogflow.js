const request = require('request-promise');
const constants = require('../constants');
const salesforce = require('../helpers/salesforce');
const liveagent = require('../helpers/liveagent');
const apiai = require('apiai-promise');
const apiaiApp = apiai(constants.APIAI_CLIENT_ACCESS_TOKEN);

exports.processMessage = function(msg, sessionId, source, sender){
  console.log('process message');
  return apiaiApp.textRequest(msg, {
    sessionId: sessionId,
    contexts: [{
    name: source,
    parameters: {
      source: source,
      senderid: sender.id,
      sendername: sender.name
    }
  }]
});
};

exports.processWebhook = function(aresult){

  console.log('start webhook');
  var routeTo = 'Bot';
  var webhookReply = aresult.result.fulfillment.speech;
  var source = 'Google';
  var sender = { id: 'n/a', name: 'TEST'}
  if(typeof aresult.result.contexts != 'undefined'){
    source = aresult.result.contexts[0].parameters.source;
    sender = {id: aresult.result.contexts[0].parameters.senderid,
              name: aresult.result.contexts[0].parameters.sendername} ;
  }

  if(source == '' || source == null)
    source = 'Google';

  if(aresult.result.metadata.intentName == 'Request Agent' ||
     aresult.result.metadata.intentName == 'Fallback' ){
    routeTo = 'CSR';
  }

  var sf = salesforce.logToSalesforce(routeTo, source, sender, aresult.sessionId, aresult.result.resolvedQuery, webhookReply);
  if(source == 'Facebook' || source == 'SMS')
    liveagent.start(sf);
  return webhookReply;
};

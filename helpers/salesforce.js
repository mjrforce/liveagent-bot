const constants = require('../constants');
const liveagent = require('./liveagent');
const nforce = require('nforce');

function getOrg(){
    return nforce.createConnection({
    clientId: constants.SF_CLIENT_ID,
    clientSecret: constants.SF_CLIENT_SECRET,
    redirectUri: constants.SF_REDIRECT_URL,
    apiVersion: constants.SF_API_VERSION,  // optional, defaults to current salesforce API version
    environment: constants.SF_ENVIRONMENT,  // optional, salesforce 'sandbox' or 'production', production default
    mode: 'single' // optional, 'single' or 'multi' user mode, multi default
  });
};

exports.getOrg = getOrg;

function logToSalesforce(routeTo, source, sender, sessionId, botRequest, botResponse){
  var botchat;
  var org = getOrg();
  return org.authenticate({ username: constants.SF_USERNAME, password: constants.SF_PASSWORD})
    .then(function(oauth){
      console.log('upsert');
      botchat = nforce.createSObject('Bot_Chat__c', {Source__c: source, Sender_Name__c: sender.name, Sender_Id__c: sender.id, Route_To__c: routeTo });
      botchat.setExternalId('Session_Id__c', sessionId);
      return org.upsert({ sobject: botchat });
  }).then(function(){
      console.log('query');
      return org.query({ query: 'SELECT Id, Route_To__c, Live_Chat_Key__c, Live_Chat_Session_Id__c, Live_Chat_Affinity_Token__c, Live_Chat_Sequence__c FROM Bot_Chat__c WHERE Session_Id__c = \'' + sessionId + '\' LIMIT 1' });
  }).then(function(result){
      console.log('insert message');
      console.log(result.records[0].get('id'));
      var botmessage = nforce.createSObject('Bot_Chat_Message__c', {	Bot_Chat__c: result.records[0].get('id'), Bot_Request__c: botRequest, Bot_Response__c: botResponse, Type__c: routeTo});
      return org.insert({ sobject: botmessage });
  });

}

exports.logToSalesforce = logToSalesforce;

const nforce = require('nforce');
const request = require('request-promise');
const constants = require('../constants');
const salesforce = require('../helpers/salesforce');

function post(session, sobj, msg){

	var seq = sobj.get('Live_Chat_Sequence__c') + 1;
  var org = salesforce.getOrg();
  sobj.set('Live_Chat_Sequence__c', seq);

  org.authenticate({ username: constants.SF_USERNAME, password: constants.SF_PASSWORD})
    .then(function(oauth){
       org.update({sobject: sobj}, function(err, resp){
       console.log(err);
	     });
    });

	request({
	url: constants.LIVE_AGENT_URL + 'Chasitor/ChatMessage',
	method: 'POST',
	headers: {
		'X-LIVEAGENT-API-VERSION': 40,
		'X-LIVEAGENT-AFFINITY': session.affinityToken,
		'X-LIVEAGENT-SESSION-KEY': session.key,
		'X-LIVEAGENT-SEQUENCE': seq
	  },
	json: {
         text: msg
	}
}).then(function(result){
  console.log(result);
}).catch(function(error){
  console.log(error);
});
};

exports.post = post;

function startSession(sobj){

    request({
		  uri: constants.LIVE_AGENT_URL + 'System/SessionId',
		  method: 'GET',
		  headers: {
			'X-LIVEAGENT-API-VERSION': 40,
			'X-LIVEAGENT-AFFINITY': 'null'
		  }
		}).then(function(response){

      var session = JSON.parse(response);
      var org = salesforce.getOrg();
      console.log(JSON.stringify(sobj));
      sobj.Live_Chat_Key__c = session.key;
      sobj.Live_Chat_Session_Id__c = session.id;
      sobj.Live_Chat_Affinity_Token__c = session.affinityToken;
      sobj.Live_Chat_Sequence__c = 0;

      var u = nforce.createSObject('Bot_Chat__c', sobj);
      console.log(JSON.stringify(u));
      org.authenticate({ username: constants.SF_USERNAME, password: constants.SF_PASSWORD})
        .then(function(oauth){
           org.update({sobject: u}, function(err, resp){
           console.log(err);
    	     });
        });

      return ChasitorInit(session, sobj);

    })
};

function ChasitorInit(session, sobj){

  return request({
	url: constants.LIVE_AGENT_URL + 'Chasitor/ChasitorInit',
	method: 'POST',
	headers: {
		'X-LIVEAGENT-API-VERSION': 40,
		'X-LIVEAGENT-AFFINITY': session.affinityToken,
		'X-LIVEAGENT-SESSION-KEY': session.key,
		'X-LIVEAGENT-SEQUENCE': 1
	  },
	json: {
			organizationId: "00D3D000000D1gO",
			deploymentId: "5723D000000000p",
			buttonId: "5733D000000001s",
			sessionId: session.id,
			doFallback: true,
			userAgent: sobj.Source__c,
			screenResolution: "N/A",
			language: "en-US",
			visitorName: sobj.Sender_Name__c,
			prechatDetails: [
			{
				label: 'Session Id',
				value: sobj.Session_Id__c,
				transcriptFields: ['Bot_Chat_Session_Id__c'],
				entityMaps:[
					{
					   entityName: 'Bot_Chat__c',
					   fieldName: 'Session_Id__c'
					}
				],
				displayToAgent: true
			},
			{
				label: 'Bot Chat Id',
				value: sobj.Id,
				transcriptFields: [
				  'Bot_Chat__c'
				],
				entityMaps:[
					{
					   entityName: 'Bot_Chat__c',
					   fieldName: 'Id'
					}
				],
				displayToAgent: true
			}
			],
			prechatEntities: [
			{
				entityName: 'Bot_Chat__c',
				showOnCreate: true,
				entityFieldsMaps:[
				{
					fieldName: 'Session_Id__c',
					label: 'Session Id',
					doFind: true,
					isExactMatch: true,
					doCreate: false
				},
				{
					fieldName: 'Id',
					label: 'Id',
					doFind: true,
					isExactMatch: true,
					doCreate: false
				}
				]
			}
			],
			receiveQueueUpdates: true,
			isPost: true
	}
	});
}

exports.start = function(message){

  var org = salesforce.getOrg();

  org.authenticate({ username: constants.SF_USERNAME, password: constants.SF_PASSWORD})
  .then(function(oAuth){
      return message;
  }).then(function(result){);
      return org.query({ query: 'SELECT Id, Bot_Chat__r.id, Bot_Chat__r.Route_To__c, Bot_Chat__r.Live_Chat_Key__c, Bot_Chat__r.Live_Chat_Session_Id__c, Bot_Chat__r.Live_Chat_Affinity_Token__c, Bot_Chat__r.Live_Chat_Sequence__c, Bot_Chat__r.Source__c, Bot_Chat__r.Session_Id__c, Bot_Response__c, 	Bot_Request__c FROM Bot_Chat_Message__c WHERE Id = \'' + result.id + '\' LIMIT 1' });
  }).then(function(result){
      var session = {
        id: result.records[0].get('bot_chat__r').Live_Chat_Session_Id__c,
        key: result.records[0].get('bot_chat__r').Live_Chat_Key__c,
        affinityToken: result.records[0].get('bot_chat__r').Live_Chat_Affinity_Token__c,
        sequence: result.records[0].get('bot_chat__r').Live_Chat_Sequence__c
      };

    if(result.records[0].get('bot_chat__r').Route_To__c == 'CSR' && session.key == null){
      startSession(result.records[0].get('bot_chat__r'));
    }
    else if(result.records[0].get('bot_chat__r').Route_To__c == 'CSR' && session.key != null){
      post(session, nforce.createSObject('Bot_Chat__c', result.records[0].get('bot_chat__r')), result.records[0].get('Bot_Request__c'));
    }
  });
}

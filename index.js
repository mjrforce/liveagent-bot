const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');

const twilio = require('./routers/twilio');
const facebook = require('./routers/facebook');
const dialogflow = require('./routers/dialogflow');
const alexa = require('./routers/alexa');

const app = express();
app.set('port', (process.env.PORT || 5000))

app.use('/twilio', twilio);
app.use('/facebook', facebook);
app.use('/webhook', dialogflow);
app.use('/alexa', alexa);

app.get('/', function (req, res) {
  res.send('Use the endpoint.')
});

app.listen(app.get('port'), function () {
  console.log('* Webhook service is listening on port:' + app.get('port'))
})

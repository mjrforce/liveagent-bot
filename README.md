# Alexa and Dialogflow (API.AI / Google Home) bot, integrated with Salesforce and Salesforce Live Agent.

This is one webhook to rule them all. This project uses the following platforms:
1. [Heroku](https://www.heroku.com/)
2. [Dialogflow (formerly API.AI)](https://dialogflow.com/)
3. [Amazon Alexa](https://developer.amazon.com/)
4. [Facebook](https://developer.facebook.com/)
5. [Twilio](https://www.twilio.com/)
6. [Salesforce](https://www.salesforce.com/)


# Set up Dialogflow (API.AI)

1. Log into Dialogflow and create a new agent.

2. Click on the gear icon, the Export and Import tab, and the RESTORE FROM ZIP button. Upload [this zip file](bots/dialogflow/liveagent-bot.zip).

# Set up Amazon Alexa

1. Log in to the [Amazon Developer Console](https://developer.amazon.com/edw/home.html#/) and click on Alexa Skills Kit. Then click on Add a new skill.

2. Give your skill a name and invocation phrase.

![Amazon Step 1](bots/alexa/steps/Step1.JPG)

3. Fill out the [Schema](bots/alexa/intentSchema.json) and [Utterances](bots/alexa/utterances.txt)
![Amazon Step 2](bots/alexa/steps/step2.JPG)
![Amazon Step 2b](bots/alexa/steps/step2b.JPG)
![Amazon Step 2c](bots/alexa/steps/step2c.JPG)

# Set up Heroku

1. Deploy this webhook to heroku

    [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)


# The Code

Let's check out the code.

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
app.set('port', (process.env.PORT || 5000))
```

You're probably too familiar with these lines. So what we have is a node app, created with express, listening to port 5000 (unless PORT is defined). 

```javascript
app.post('/webhook', function (req, res) {
  ...
}
```

Now, this is the part that captures the data from API.AI. It's not required to use `/webhook` as the route but we'll just use it for clarities sake. You can use `/` if you wanted to. The JSON payload will be stored in `req.body`.

```javascript
const REQUIRE_AUTH = true
const AUTH_TOKEN = 'an-example-token'

...

  if (REQUIRE_AUTH) {
    if (req.headers['auth-token'] !== AUTH_TOKEN) {
      return res.status(401).send('Unauthorized')
    }
  }

```

Here lies a very primitive check where the `auth-token` header is verified against a single token. Customize this to your needs.


```javascript
  if (!req.body || !req.body.result || !req.body.result.parameters) {
    return res.status(400).send('Bad Request')
  }
```

Just to be sure that we receive the information we need, we did some validation here. Again, expand it base on what you needed.


```javascript
  var userName = req.body.result.parameters['given-name']
  var webhookReply = 'Hello ' + userName + '! Welcome from the webhook.'

  // the most basic response
  res.status(200).json({
    source: 'webhook',
    speech: webhookReply,
    displayText: webhookReply
  })
```

Here's the main event. We took the value of the parameter `given-name` and used it for the return response. The response needs to be of `Content-Type: application/json`, so `res.json` takes care of that for us.

In an example response in the [webhook documentation](https://docs.api.ai/docs/webhook), we should have a format like:

```javascript
{
    source: 'source-of-the-response',
    speech: 'Response to the request.',
    displayText: 'Text displayed on the user device screen.'
}
```

This is the simplest response. You can check out [Rich Messages](https://docs.api.ai/docs/rich-messages) and [Response design for Actions on Google](https://docs.api.ai/docs/response-design-for-actions-on-google) for other types of responses.

# Tools for Development

We of course need to develop and test the webhook before being deployed to the host. Below are the utilities I used. 

* [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop) - Use it to send some test payloads to the webhook. So I don't need to "talk" using api.ai during initial tests.

* [ngrok](https://ngrok.com/) - Creates a public https tunnel mapped to a port on my machine. It gives me a url that I can use as a webhook for my agent. Use this to actually integrate your agent to the webhook.

* [heroku-cli](https://devcenter.heroku.com/articles/heroku-cli) - Well, only if you'll be deploying to heroku.

"# liveagent-bot" 

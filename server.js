const express = require('express');
const request = require('request');
const app = express();
const dialogflowSessionClient =
    require('./dialogflow_session_client.js');
const bodyParser = require('body-parser');
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
const projectId = 'chat-bot-whatsapp-mgsc';
const phoneNumber = "18646631874";
const accountSid = 'AC7b79983c85fad017ab1c3f6f0138dbce';
const authToken = '9d797d425c7be2e46f84b584ee894bf8';
 
const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const sessionClient = new dialogflowSessionClient(projectId);
 
const listener = app.listen(process.env.PORT, function() {
   console.log('Your Twilio integration server is listening on port '
       + listener.address().port);
});
 
app.post('/', async function(req, res) {
   const body = req.body;
   const text = body.Body;
   const id = body.From;
   const dialogflowResponse = (await sessionClient.detectIntent(
       text, id, body)).fulfillmentText;
   const twiml = new  MessagingResponse();
   const message = twiml.message(dialogflowResponse);
   res.send(twiml.toString());
});
 
 process.on('SIGTERM', () => {
   listener.close(() => {
     console.log('Closing http server.');
     process.exit(0);
   });
 });
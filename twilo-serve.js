require("dotenv").config();
const dialogflow = require("@google-cloud/dialogflow");
const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));
const port = 3000;

const projectId = "chat-bot-whatsapp-mgsc";

//create the twilioClient
const client = require("twilio")(
  process.env.TWILIO_API_KEY_SID,
  process.env.TWILIO_API_KEY_SECRET,
  { accountSid: process.env.TWILIO_ACCOUNT_SID }
);

async function sendToDialogflow(projectId, sessionId, query) {
  const sessionClient = new dialogflow.SessionsClient();
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,

    sessionId
  );

  // The text query request
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: "pt-BR",
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    return responses[0];
  } catch (err) {
    console.log("Dialogflow error: " + err);
  }
  return false;
}

async function sendToTwilio(response, conversationSid) {
  try {
    await client.conversations
      .conversations(conversationSid)
      .messages.create({ author: "system", body: response });
    return true;
  } catch (err) {
    console.log("Twilio error: " + err);
    return false;
  }
}

app.post("/dialogflow", async (req, res) => {
  let sessionId = req.body.ConversationSid;
  let query = req.body.Body;

  let response = await (
    await sendToDialogflow(projectId, sessionId, query)
  ).queryResult.fulfillmentText;
  if (!response) {
    res.status(500).send();
  }

  let result = await sendToTwilio(response, sessionId);
  if (result) {
    res.status(201).send();
  }
  res.status(500).send();
});

app.listen(port, () => {
  console.log(`Dialogflow integration listening on port ${port}`);
});

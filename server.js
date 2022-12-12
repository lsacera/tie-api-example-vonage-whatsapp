/**
 * Copyright 2019 Artificial Solutions. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const http = require('http');
const https = require ('https');
const express = require('express');
const bodyParser = require('body-parser');
//const MessagingResponse = require('twilio').twiml.MessagingResponse;
const TIE = require('@artificialsolutions/tie-api-client');
require('dotenv').config();

//Vonage server api and types of messages
const { Vonage } = require('@vonage/server-sdk')
const { Text } = require('@vonage/messages/dist/classes/WhatsApp/Text');
const { Image } = require('@vonage/messages/dist/classes/WhatsApp/Image');
const { Video } = require('@vonage/messages/dist/classes/WhatsApp/Video');


const port = process.env.PORT || 4338;
const teneoEngineUrl = process.env.TENEO_ENGINE_URL;
const vonageApiKey = process.env.VONAGE_API_KEY;
const vonageApiSecret = process.env.VONAGE_API_SECRET;
const vonageAppId = process.env.VONAGE_APP_ID;
const vonageServer = process.env.VONAGE_SERVER_URL;
const vonagePrivateKeyPath = process.env.VONAGE_PRIVATE_KEY_FILE_PATH
const whatsappNumber=process.env.WHATSAPP_NUMBER;

const app = express();

// initalise teneo API
const teneoApi = TIE.init(teneoEngineUrl);

//Vonage api this is for authentication and setting the api server
const vonage = new Vonage({
  apiKey: vonageApiKey, 
  apiSecret: vonageApiSecret,
  applicationId: vonageAppId,
  privateKey: vonagePrivateKeyPath 
}, {
  apiHost: vonageServer
})

// initialise session handler, to store mapping between sender's phone number and the engine session id
const sessionHandler = SessionHandler();

//body parser capabilities, taken from vonage documentation
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// vonage message comes in, this is TESTING
app.post("/", handleVonageMessages(sessionHandler));

//handle vonage incoming message (this is the http post endpoint function)
function handleVonageMessages(sessionHandler) {
  return async (req, res) => {
    // get the sender's phone number
    const from = req.body.from;
    console.log(`from: ${from}`);

    // get message from user
    const userInput = req.body.text;
    console.log(`userInput: ${userInput}`);

    // check if we have stored an engine sessionid for this sender
    const teneoSessionId = sessionHandler.getSession(from);

    // send input to engine using stored sessionid and retreive response
    const teneoResponse = await teneoApi.sendInput(teneoSessionId, { 'text': userInput, 'channel': 'vonage-whatsapp' });
    console.log(`teneoResponse: ${teneoResponse.output.text}`)

    // store engine sessionid for this sender
    sessionHandler.setSession(from, teneoResponse.sessionId);

    //write messages to whatsapp 
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    
    var text_sent = false; //variable to control if we sent Teneo response as long with images or videos 
    //check if we have teneo parameters (image, video, etc) and process them  
    if((teneoResponse.output.parameters != null) && (Object.keys(teneoResponse.output.parameters).length > 0)){
        for (var m in teneoResponse.output.parameters){  
        switch (m){
          case "imageUrl":
            sendImageMessage(teneoResponse.output.parameters.imageUrl,teneoResponse.output.text,from);
            text_sent=true;
            break;
          case "videoUrl":
            sendVideoMessage(teneoResponse.output.parameters.videoUrl,teneoResponse.output.text,from);
            text_sent=true;
            break;
          default:
            break;  
        }//end switch
        
      }//end for
    }//end if

    if (!text_sent){
      sendTextMessage(teneoResponse.output.text,from); //here from turns into to
    }

    //end of call
    res.end(teneoResponse.output.text); 
  }//end return async
}//end function

// compose and send a text message to whatsapp
function sendTextMessage(message,to) {
  vonage.messages.send(
    new Text(
      message,
      to,
      whatsappNumber //this is the number of the actual sandbox
    )
  )
    .then(resp => console.log(resp.message_uuid))
    .catch(err => console.error(err));
}

// compose and send a video message to whatsapp
function sendVideoMessage(videoUrl, caption, to){
  vonage.messages.send(
	  new Video({ url: videoUrl, caption:caption }, to, WHATSAPP_NUMBER)
  )
	  .then(resp => console.log(resp.message_uuid))
	  .catch(err => console.error(err));
}

// compose and send an image to whatsapp
function sendImageMessage(imageUrl, caption, to){
  vonage.messages.send(
    new Image({ url: imageUrl,caption:caption }, to, whatsappNumber)
  )
    .then(resp => console.log(resp.message_uuid))
    .catch(err => console.error(err));
}


/***
 * SESSION HANDLER
 ***/
function SessionHandler() {
  // Map the sender's phone number to the teneo engine session id. 
  // This code keeps the map in memory, which is ok for testing purposes
  // For production usage it is advised to make use of more resilient storage mechanisms like redis
  const sessionMap = new Map();

  return {
    getSession: (userId) => {
      if (sessionMap.size > 0) {
        return sessionMap.get(userId);
      }
      else {
        return "";
      }
    },
    setSession: (userId, sessionId) => {
      sessionMap.set(userId, sessionId)
    }
  };
}

http.createServer(app).listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

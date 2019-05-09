# Dialogflow Webhook Response Parser
## Abstracts the format for sending response to Dialogflow
---
### Steps to follow:
1. Install the package using following command:  
`npm i dialogflow-webhook-parser`
2. This module needs an object of messages if we need to override default dialogflow response. This message object will be a key-value pair where value will be fetched for respective key mentioned while overriding dialogflow response. (Find all the formats below that it needs)
3. Import the package using following command  
 `const agent = require('dialogflow-webhook-parser').agent;`
4. After you import the package, you need to configure the module by sending message object as an argument. You can view all formats required at the bottom of document.
`agent.config(MessageObject);`
5. Now you can utilize the package to perform following actions:
    - Trigger an intent forcefully
    - Override dialogflow response completely
    - Provide selective text boxes from multiple dialogflow response lists
    - Set a context
    - Send custom payload
6. Let's see how we can perform each of the above tasks
---
### Agent Methods:  
- Config Method:  
```
agent.config(MessageObject);
Return value: -  
```  
- Send Method:
```
agent.send(request, rawObject);
Return value: ResponseObject 
```  

---
### How to:
- Trigger an intent forcefully
```
const triggerObj = {
    trigger: eventName, // Here eventName is event defined in Dialogflow console for an intent
}
return agent.send(request, triggerObj);
```  
- Override dialogflow response completely
```
const MessageObj = {
    "name": "What is your name?"
}
agent.config(MessageObject);
const overrideObj = {
    "message": "name", // *name* is the key in MessageObj
}
return agent.send(request, overrideObj);
```
- Provide selective text boxes from multiple dialogflow response lists
```
const filterObj = {
    filterDialoglowResponseList: [0,1,4] // Here, 0,1,4 are indexes of text responses defined in Dialogflow for an intent
}
return agent.send(request, filterObj);
```
- Set a context
```
const contextObj = {
    contextList: [{ name: 'test', lifespan: '2' }] // This will set the context test active for next query in dialogflow. Here, lifespan parameter is optional. By default, it will set lifespan as 1.
}
return agent.send(request, contextObj);
```
- Send custom payload
```
const payloadObj = {
    customPayloadParams: "{JSON Object}" // Stringified JSON object or any plain text 
}
return agent.send(request, payloadObj);
```

---
### Formats/Schema

Following schema is used to store all the messages at one place that we would be overriding from dialogflow. So, once we need to override, we can pass the key in message atrribute and it will fetch the response from MessageObject and override the dialogflow response

Schema:
```
MessageObject = {
    "key": ["value1","value2"]
}
```
Example:
```
const a = require('dialogflow-webhook-parser').agent;

MessageObject = {
    "name": ["What is your name"],
    "email": ["What is your email"]
}

agent.config(MessageObject);
```

request Object: This contains the request object we get from Dialogflow
Schema:
```
{
  "responseId": "",
  "queryResult": {
    "queryText": "",
    "parameters": {
      "CampusOfInterest": "",
      "DegreeOfInterest": "",
      "Specialization": "",
      "ProgramOfInterest": "",
      "Country": "",
      "State": ""
    },
    "allRequiredParamsPresent": ,
    "fulfillmentText": "",
    "fulfillmentMessages": [
      {
        "text": {
          "text": [
            ""
          ]
        }
      }
    ],
    "intent": {
      "name": "",
      "displayName": ""
    },
    "intentDetectionConfidence": ,
    "languageCode": "en"
  },
  "originalDetectIntentRequest": {
    "payload": {}
  },
  "session": ""
}
```
rawObject: This contains custom object that tells the package to perform respective actions
#### Various attributes it supports are:
- trigger: Used to trigger an intent from webhook into Dialogflow changing the flow of conversation
- message: Used to override the default dialogflow response using MessageObject that was configured
- contextList: Used to set context from webhook in dialogflow
- suggestions: Used to provide suggestions to user from webhook (Actions on Google)
- customPayloadParams: Used to provide custom payload response from webhook

ResponseObject: This is processed response that we get as a result. This can be directly sent as a resposne to dialogflow
Schema:
```
{
    "fulfillmentMessages": [
        {
            "text": {
                "text": []
            }
        },
        {
            "platform": "ACTIONS_ON_GOOGLE",
            "suggestions": {
                "suggestions": [
                    {
                        "title": ""
                    },
                    {
                        "title": ""
                    }
                ]
            }
        }
    ],
    "fulfillmentText": "",
    "outputContexts": [
        {
            "name": "",
            "lifespanCount": 1
        },
        {
            "name": "",
            "lifespanCount": 1
        },
        {
            "name": "",
            "lifespanCount": 1,
            "parameters": {}
        }
    ]
}
```
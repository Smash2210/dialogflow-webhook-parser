
const schema = require('./schema');

const self = {};
module.exports.agent = {
    config: (messageFile) => {
        self['messages'] = messageFile;
    },
    send: (request, response) => {
        if (!response) {
            console.log('Response was found undefined and thus providing default dialogflow response');
            response = {}
        }

        if (response.trigger) {
            console.log('Triggering other intent: ' + response.trigger);
            let triggerObject = JSON.parse(JSON.stringify(schema.trigger));
            triggerObject.followupEventInput.name = response.trigger;
            return triggerObject;
        }

        // Clean fulfillment Message from dialogflow
        let tempFulfillmentMessages = request.queryResult.fulfillmentMessages;
        request.queryResult.fulfillmentMessages = tempFulfillmentMessages.filter(obj => { 
            return obj.text && obj.text.text && obj.text.text.length && obj.text.text[0] })

        // Create an empty fulfillmentMessages dialogflow object to fill it based on response
        var fulfillmentMessages = [];

        if (response.message) { // check if resposne contains message to send customized message from webhook
            if (!self.messages) {
                console.log('Error while fetching messages from message object, Please configure it first');
                return {}
            }
            let messageList = self.messages[response.message];
            for (let item in messageList) {
                let cloneFulfillmentObject = JSON.parse(JSON.stringify(schema.fulfillmentMessages));
                cloneFulfillmentObject.text.text = [messageList[item]];
                fulfillmentMessages.push(cloneFulfillmentObject);
            }
        } else { // if no message attribute is present send default dialogflow resposne or send Knowledge base response
            fulfillmentMessages = request.queryResult.fulfillmentMessages;
            let newFulfillmentObject = [];
            if (response.filterDialoglowResponseList) { // check if one needs to send customized message from dialogflow
                for (let index in response.filterDialoglowResponseList) {
                    newFulfillmentObject.push(fulfillmentMessages[response.filterDialoglowResponseList[index]]);
                }
            } else {
                newFulfillmentObject = fulfillmentMessages;
            }
            fulfillmentMessages = newFulfillmentObject[0].text.text.length > 0 ? newFulfillmentObject : request.queryResult.fulfillmentMessages;
        }

        var fulfillmentText = fulfillmentMessages[0] ? fulfillmentMessages[0].text.text[0]: '';

        var outputContext = request.queryResult.outputContexts;

        if (response.contextList) { // check if one needs to set an output context
            if (!outputContext) {
                outputContext = [];
            }
            for (let item in response.contextList) {
                let contextObject = JSON.parse(JSON.stringify(schema.context));
                contextObject.name = `${request.session}/contexts/${response.contextList[item].name}`;
                if (response.contextList[item].lifespan) {
                    contextObject.lifespanCount = response.contextList[item].lifespan;
                }
                for (let i in outputContext) {
                    if (outputContext[i].name == contextObject.name.toLowerCase()) {
                        outputContext.splice(i, 1);
                    }
                }
                outputContext.push(contextObject);
            }
        }

        // Check for suggestionObject
        if (response.suggestions) {
            let suggestionObject = JSON.parse(JSON.stringify(schema.suggestions));
            for (let item in response.suggestions) {
                suggestionObject.suggestions.suggestions.push({ title: response.suggestions[item] });
            }
            fulfillmentMessages.push(suggestionObject);
        }

        var processedResposne = {};
        processedResposne.fulfillmentMessages = fulfillmentMessages;
        processedResposne.fulfillmentText = fulfillmentText;
        if (outputContext)
            processedResposne.outputContexts = outputContext
        if (response.customPayloadParams)
            processedResposne.payload = response.customPayloadParams
        return JSON.stringify(processedResposne);
    },
}
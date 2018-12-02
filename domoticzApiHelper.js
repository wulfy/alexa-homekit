/*********
Helper to translate Amazon commands to Domoticz commands
******/
const env = require('dotenv').config();
const { DOMOTICZ_ALEXA_DISCOVERY_MAPPING, 
		ALEXAMAPPING
	} = require("./config/mapping")

const {sendStatsd} = require('./config/metrics');
const domoticz = require('./domoticz');
const AlexaMapper = require('./AlexaMapper');

const PROD_MODE = process.env.PROD_MODE === "true";
const alexaMapper = new AlexaMapper(ALEXAMAPPING);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //self signed ssl certificate

//use global because it has to be overriden while testing :
// so getDomoticzFromToken can return a domoticz mocked class for tests
global.getDomoticzFromToken = (token) => {
	return new domoticz(token);
}


// Alexa discovery full process
// retrieve user, getdevices, map them to domoticz then return them in Alexa format
async function alexaDiscoveryEndpoints(requestToken){
	const domoticzConnector = getDomoticzFromToken(requestToken);
	const devices = await domoticzConnector.getAllDevices();
	const mappedDevices = alexaMapper.fromDomoticzDevices(devices);
	return alexaMapper.handleDiscovery(mappedDevices);
}


/********* EXPORT FUNCTIONS USED BY INDEX  *****************************/

exports.alexaDiscovery = alexaDiscoveryEndpoints;
exports.PROD_MODE = PROD_MODE

//send alexa response and stop lambda by context.succeed call
// same response for getState or command
exports.sendAlexaCommandResponse = function(request,context,contextResult,isStateReport){
	const endpointId = request.directive.endpoint.endpointId;
    const requestHeader = request.directive.header;
    // get user token pass in request
    const requestToken = request.directive.endpoint.scope.token;
    let response = alexaMapper.handleSendCommandResponse(contextResult,requestHeader,requestToken,endpointId,isStateReport)
    console.log("DEBUG: " + requestHeader.namespace + JSON.stringify(response));
    const cardTst = {
			  "version": "1.0",
			  "response": {
			    "outputSpeech": {"type":"PlainText","text":"Text to speak back to the user."},
			    "card": {
			      "type": "Simple",
			      "title": "Example of the Card Title",
			      "content": "Example of card content. This card has just plain text content.\nThe content is formatted with line breaks to improve readability."
			    }
			  }
			};
    response = {...reponse,...cardTst};
    sendStatsd("calls.answer."+requestHeader.name+":1|c");
    context.succeed(response);
}

//send command to the device handler (ex domoticz)
exports.sendDeviceCommand = async function (request, value){
	console.log("send device command");
	const requestToken = request.directive.endpoint.scope.token;
	let cookieInfos = request.directive.endpoint.cookie;
	let directiveValue = value;
	const directive = request.directive.header.name;
	const deviceId = request.directive.endpoint.endpointId.split("_")[0];
	const subtype = request.directive.endpoint.endpointId.split("_")[2];
	const domoticzConnector = getDomoticzFromToken(requestToken);

	return await domoticzConnector.sendCommand(subtype,deviceId,directive,directiveValue)
}

//return an alexa device using an alexa command using the alexa endpointId
exports.getAlexaDeviceState= async function (requestToken,endpointId){
	const domoticzId = endpointId.split("_")[0];
	console.log("getDevicesState, domo id " + domoticzId);
	const domoticzConnector = getDomoticzFromToken(requestToken);
	const device = await domoticzConnector.getDevice(domoticzId);
	if(! device) 
		return null;

	return alexaMapper.getAlexaDeviceContextState(device);
}

console.log("RUNNING PROD : " + (PROD_MODE ? "ON" : "OFF"));
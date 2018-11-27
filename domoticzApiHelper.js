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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //self signed ssl certificate

const alexaMapper = new AlexaMapper(ALEXAMAPPING);


//use global because it has to be overriden while testing :
// by re-defining getDevices as device, tests can overwrite it while testing
// Getdevices do an http request to retrieve domoticz devices
// Alexa give a token (oauth) then we have to find out which client correspond to the given token
// and list his devices.
global.getDevices = async function getDevices (token,domoticzDeviceId) {
	const domoticzConnector = getDomoticzFromToken(token);
	return await domoticzConnector.getDevices(domoticzDeviceId);
}

global.getDomoticzFromToken = (token) => {
	return new domoticz(token);
}

// Alexa discovery full process
// retrieve user, getdevices, map them to domoticz then return them in Alexa format
async function alexaDiscoveryEndpoints(request){
	const requestToken = request.directive.payload.scope.token;
	const devices = await getDevices(requestToken);
	const alexaMapper = new AlexaMapper(ALEXAMAPPING);
	const mappedDevices = alexaMapper.fromDomoticzDevices(devices);
	return alexaMapper.handleDiscovery(mappedDevices);
}


/********* EXPORT FUNCTIONS USED BY INDEX  *****************************/

exports.alexaDiscovery = alexaDiscoveryEndpoints;
exports.PROD_MODE = PROD_MODE

//send alexa response and stop lambda by context.succeed call
exports.sendAlexaCommandResponse = function(request,context,contextResult,stateReport){
	const endpointId = request.directive.endpoint.endpointId;
    let responseHeader = request.directive.header;
    responseHeader.namespace = "Alexa";
    responseHeader.name = stateReport ? "StateReport":"Response";
    responseHeader.messageId = responseHeader.messageId + "-R";
    // get user token pass in request
    const requestToken = request.directive.endpoint.scope.token;

    const response = {
        context: contextResult,
        event: {
            header: responseHeader,
            endpoint: {
                scope: {
                    type: "BearerToken",
                    token: requestToken
                },
                endpointId: endpointId
            },
            payload: {}
        }
    };
    console.log("DEBUG: " + responseHeader.namespace + JSON.stringify(response));
    sendStatsd("calls.answer."+responseHeader.name+":1|c");
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
	const domoticzState = await getDevices(requestToken,domoticzId);
	if(! domoticzState) 
		return null;

	return alexaMapper.handleGetStateForDomoticzDevice(domoticzState[0]);
}

console.log("RUNNING PROD : " + (PROD_MODE ? "ON" : "OFF"));

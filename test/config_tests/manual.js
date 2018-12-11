process.env.PROD_MODE = "false";
const {handler} = require("../../index")
const base_config = require("./base_config");
const {
        getStateFromAlexaDevice,
        getAlexaDevice,
        sendAlexaCommandResponse,
        sendDeviceCommand,
        BASE_REQUEST,
        LIST_DEVICE_REQUEST
    } = require("../../domoticzApiHelper");

const { ALEXA_REPORTSTATE_REQUEST_EXAMPLE, 
        ALEXA_SETPERCENT_REQUEST_EXAMPLE,
        ALEXA_SETPERCENT_REQUEST_EXAMPLE2,
        ALEXA_DISCOVERY_REQUEST_EXAMPLE,
        ALEXA_TURNON_REQUEST,
        ALEXA_TURNOFF_REQUEST,
        ALEXA_SETPERCENT_REQUEST_VENITIAN,
    } = require("../mockups/alexaMockups")

const { 
        DOMOTICZ_STATE_ANSWER, 
    } = require("../mockups/domoticzMockups")

const { DOMOTICZ_GET_DEVICES } = require("../mockups/domoticzMockups");

async function handleReportState(request, context) {
    const endpointId = request.directive.endpoint.endpointId;
	const alexaDevice = await getAlexaDevice(endpointId);
	if(!alexaDevice) return null;

	const deviceStateContext = getStateFromAlexaDevice(alexaDevice);
	sendAlexaCommandResponse(request,context,deviceStateContext);
}

async function handlePowerControl(request, context) {
    const setValue = null;
    const requestMethod = request.directive.header.name;
    if (requestMethod === "TurnOff" || requestMethod === "TurnOn") {
    	await sendDeviceCommand(request,setValue);

    	sendAlexaCommandResponse(request,context,contextResult);
    }

}

async function handlePercentControl(request, context) {
    const endpointId = request.directive.endpoint.endpointId;
    const setValue = request.directive.payload.percentage;
    const requestMethod = request.directive.header.name;
    if (requestMethod === "SetPercentage") {
    	await sendDeviceCommand(request,setValue);
    	const alexaDevice = await getAlexaDevice(endpointId);
    	if(!alexaDevice) return null;
    	const contextResult = getStateFromAlexaDevice(alexaDevice);
    	sendAlexaCommandResponse(request,context,contextResult);
    }
}


async function test()
{
    const request = BASE_REQUEST+"?"+LIST_DEVICE_REQUEST
    console.log(request)
	const devices = await getDevices();

	return devices;
}

async function test2()
{
	const data = await test();
	console.log("done " + JSON.stringify(data));
}

//comment this for tests in real situations
global.getDomoticzFromToken = (token) => {
    return new base_config.mockedDomoticz(token,DOMOTICZ_GET_DEVICES);
}


global.getDevices = (token,domoticzDeviceId) => {
    return JSON.parse(DOMOTICZ_GET_DEVICES).result;
}

global.getBase = (token) => "";

console.log("---- TEST RUNNING ---- ")
//handleDiscovery(ALEXA_DISCOVERY_REQUEST_EXAMPLE);
//handleReportState(ALEXA_REPORTSTATE_REQUEST_EXAMPLE);
//console.log("GO")
//handlePercentControl(ALEXA_SETPERCENT_REQUEST_EXAMPLE)

let context = {};
context.succeed = (data) => console.log("CONTEXT ENDED");

//TEST FOR INDEX.JS
handler(ALEXA_DISCOVERY_REQUEST_EXAMPLE,context);
//handler(ALEXA_DISCOVERY_REQUEST_EXAMPLE);
//handler(ALEXA_SETPERCENT_REQUEST_VENITIAN);
//handler(ALEXA_REPORTSTATE_REQUEST_EXAMPLE("2_aeon"));
//handler(ALEXA_TURNON_REQUEST);
console.log(context);
console.log("---- TEST ENDED ---- ")
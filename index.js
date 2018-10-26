const {
        getStateFromAlexaDevice,
        getAlexaDevice,
        sendAlexaCommandResponse,
        sendDeviceCommand,
        alexaDiscovery,
        PROD_MODE
    } = require("./domoticzApiHelper");

const {sendStatsd} = require('./config/metrics');

exports.handler = function (request, context) {

    //send stats about request receive
    sendStatsd("request."+request.directive.header.namespace+"."+request.directive.header.name+":1|c");

    console.log(request);
    if (request.directive.header.namespace === 'Alexa.Discovery' && request.directive.header.name === 'Discover') {
        console.log("DEBUG: Discover request " + JSON.stringify(request));
        handleDiscovery(request, context, "");
    }
    else if (request.directive.header.namespace === 'Alexa.PercentageController') {
        if (request.directive.header.name === 'SetPercentage') {
            console.log("DEBUG: SetPercentage " + JSON.stringify(request));
            handlePercentControl(request, context);
        }
    }
    else if (request.directive.header.namespace === 'Alexa.PowerController'){
        if (request.directive.header.name === 'TurnOff' || request.directive.header.name === 'TurnOn') {
            console.log("DEBUG: switch on/off " + JSON.stringify(request));
            handlePowerControl(request, context);
        }
    }
    else if (request.directive.header.namespace === 'Alexa') {
        if (request.directive.header.name === 'ReportState') {
            handleReportState(request,context);
        }
    }


    async function handleDiscovery(request,context){
        const endPoints = await alexaDiscovery(request);
        let header = request.directive.header;
        header.name = "Discover.Response";
        const response = {event:{ header: header, payload: endPoints }};
        console.log("DEBUG: Discovery Response >>>>>>>> " + JSON.stringify(response));
        
        PROD_MODE ? context.succeed(response) : console.log("no context sent");
    }

    async function handleReportState(request, context) {
        const endpointId = request.directive.endpoint.endpointId;
        const requestToken = request.directive.endpoint.scope.token;
        const alexaDevice = await getAlexaDevice(requestToken,endpointId);
        if(!alexaDevice) return null;

        const deviceStateContext = getStateFromAlexaDevice(alexaDevice);
        sendAlexaCommandResponse(request,context,deviceStateContext,true);
    }

    async function handlePowerControl(request, context) {
        const endpointId = request.directive.endpoint.endpointId;
        const requestToken = request.directive.endpoint.scope.token;
        const setValue = null;
        const requestMethod = request.directive.header.name;
        if (requestMethod === "TurnOff" || requestMethod === "TurnOn") {
            await sendDeviceCommand(request,setValue);
            const alexaDevice = await getAlexaDevice(requestToken,endpointId);
            if(!alexaDevice) return null;
            const contextResult = getStateFromAlexaDevice(alexaDevice);
            sendAlexaCommandResponse(request,context,contextResult);
        }

    }

    async function handlePercentControl(request, context) {
        const endpointId = request.directive.endpoint.endpointId;
        const setValue = request.directive.payload.percentage;
        const requestToken = request.directive.endpoint.scope.token;
        const requestMethod = request.directive.header.name;
        if (requestMethod === "SetPercentage") {
            await sendDeviceCommand(request,setValue);
            const alexaDevice = await getAlexaDevice(requestToken,endpointId);
            if(!alexaDevice) return null;
            const contextResult = getStateFromAlexaDevice(alexaDevice);
            sendAlexaCommandResponse(request,context,contextResult);
        }
    }
};
const {
        getAlexaDeviceState,
        sendAlexaCommandResponse,
        sendDeviceCommand,
        alexaDiscovery,
        PROD_MODE
    } = require("./domoticzApiHelper");

const {sendStatsd} = require('./config/metrics');

const { performance } = require('perf_hooks');

exports.handler = async function (request, context) {
    let durationStart = performance.now();

    //send stats about request receive
    sendStatsd("request."+request.directive.header.namespace+"."+request.directive.header.name+":1|c");

    console.log(request);
    if (request.directive.header.namespace === 'Alexa.Discovery' && request.directive.header.name === 'Discover') {
        console.log("DEBUG: Discover request " + JSON.stringify(request));
        await handleDiscovery(request, context, "");
    }
    else if (request.directive.header.namespace === 'Alexa.PercentageController') {
        if (request.directive.header.name === 'SetPercentage') {
            console.log("DEBUG: SetPercentage " + JSON.stringify(request));
         await handlePercentControl(request, context);
        }
    }
    else if (request.directive.header.namespace === 'Alexa.PowerController'){
        if (request.directive.header.name === 'TurnOff' || request.directive.header.name === 'TurnOn') {
            console.log("DEBUG: switch on/off " + JSON.stringify(request));
         await handlePowerControl(request, context);
        }
    }
    else if (request.directive.header.namespace === 'Alexa') {
        if (request.directive.header.name === 'ReportState') {
          await handleReportState(request,context);
        }
    }


    async function handleDiscovery(request,context){
        const requestToken = request.directive.payload.scope.token;
        const endPoints = await alexaDiscovery(requestToken);
        let header = request.directive.header;
        header.name = "Discover.Response";
        const response = {event:{ header: header, payload: endPoints }};
        console.log("DEBUG: Discovery Response >>>>>>>> " + JSON.stringify(response));

        context.succeed(response);
    }

    async function handleReportState(request, context) {
        const endpointId = request.directive.endpoint.endpointId;
        const requestToken = request.directive.endpoint.scope.token;
        const deviceStateContext = await getAlexaDeviceState(requestToken,endpointId);
        sendAlexaCommandResponse(request,context,deviceStateContext,true);
    }

    async function handlePowerControl(request, context) {
        const endpointId = request.directive.endpoint.endpointId;
        const requestToken = request.directive.endpoint.scope.token;
        const setValue = null;
        const requestMethod = request.directive.header.name;
        if (requestMethod === "TurnOff" || requestMethod === "TurnOn") {
            await sendDeviceCommand(request,setValue);
            const contextResult = await getAlexaDeviceState(requestToken,endpointId);
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
            const contextResult = await getAlexaDeviceState(requestToken,endpointId);
            sendAlexaCommandResponse(request,context,contextResult);
        }
    }

    const totalDuration = parseInt(performance.now() - durationStart);
    console.log("Duration : " + totalDuration + " ms");
    sendStatsd("request."+request.directive.header.namespace+"."+request.directive.header.name+":"+totalDuration+"|ms");
};
require('newrelic');
const {
        getAlexaDeviceState,
        sendAlexaCommandResponse,
        sendDeviceCommand,
        alexaDiscovery,
        PROD_MODE
    } = require("./domoticzApiHelper");

const {sendStatsd} = require('./config/metrics');

const { performance } = require('perf_hooks');

const {debugLogger, prodLogger} = require('./config/logger.js');

exports.handler = async function (request, context) {
    let durationStart = performance.now();
    let response;

    // Tag the NR Transaction with rich metadata so dashboards can FACET on
    // these attributes. The legacy timeslice metrics (incrementMetric) are
    // not queryable via NRQL on this NR account.
    const nr = require('newrelic');
    nr.addCustomAttribute(
        'alexa.directive',
        request.directive.header.namespace + '.' + request.directive.header.name
    );
    // ReportState is Alexa polling for device state — separating it from
    // write actions (TurnOn, SetTargetTemperature, …) shows the read/write
    // mix and lets us isolate Alexa-driven polling load.
    nr.addCustomAttribute(
        'alexa.action.type',
        request.directive.header.namespace === 'Alexa' && request.directive.header.name === 'ReportState'
            ? 'read'
            : 'write'
    );
    if (request.directive.endpoint && request.directive.endpoint.endpointId) {
        nr.addCustomAttribute('alexa.endpointId', request.directive.endpoint.endpointId);
    }

    //send stats about request receive
    sendStatsd("request."+request.directive.header.namespace+"."+request.directive.header.name+":1|c");

    debugLogger(request);

    if (request.directive.header.namespace === 'Alexa.Discovery' && request.directive.header.name === 'Discover') {
        prodLogger("DEBUG: Discover request " + JSON.stringify(request));
        response = await handleDiscovery(request, context, "");
    }
    else if (request.directive.header.namespace === 'Alexa.PercentageController') {
        if (request.directive.header.name === 'SetPercentage') {
            prodLogger("DEBUG: SetPercentage " + JSON.stringify(request));
         response = await handlePercentControl(request, context);
        }
    }
    else if (request.directive.header.namespace === 'Alexa.PowerController'){
        if (request.directive.header.name === 'TurnOff' || request.directive.header.name === 'TurnOn') {
            prodLogger("DEBUG: switch on/off " + JSON.stringify(request));
         response = await handlePowerControl(request, context);
        }
    }
    else if (request.directive.header.namespace === 'Alexa.ThermostatController'){
        if (request.directive.header.name === 'SetTargetTemperature') {
            prodLogger("DEBUG: SetTargetTemperature" + JSON.stringify(request));
         response = await handleThermostatControl(request, context);
        }
    }
    else if (request.directive.header.namespace === 'Alexa.ColorController'){
        if (request.directive.header.name === 'SetColor') {
            prodLogger("DEBUG: SetColor" + JSON.stringify(request));
         response = await handleColorControl(request, context);
        }
    }
    else if (request.directive.header.namespace === 'Alexa.BrightnessController'){
        if (request.directive.header.name === 'SetBrightness') {
            prodLogger("DEBUG: SetBrightness" + JSON.stringify(request));
         response = await handleBrightnessControl(request, context);
        }
    }
    else if (request.directive.header.namespace === 'Alexa.SceneController'){
        if (request.directive.header.name === 'Activate' || request.directive.header.name === 'Deactivate') {
            prodLogger("DEBUG: SetBrightness" + JSON.stringify(request));
         response = await handleSceneController(request, context);
        }
    }
    else if (request.directive.header.namespace === 'Alexa') {
        if (request.directive.header.name === 'ReportState') {
          response = await handleReportState(request,context);
        }
    }


    async function handleDiscovery(request,context){
        const requestToken = request.directive.payload.scope.token;
        const endPoints = await alexaDiscovery(requestToken);
        let header = {...request.directive.header};
        header.name = "Discover.Response";
        const response = {event:{ header: header, payload: endPoints }};
        prodLogger("DEBUG: Discovery Response >>>>>>>> " + JSON.stringify(response));
        return response;
    }

    async function handleReportState(request, context) {
        const endpointId = request.directive.endpoint.endpointId;
        const requestToken = request.directive.endpoint.scope.token;
        const deviceStateContext = await getAlexaDeviceState(requestToken,endpointId);
        return sendAlexaCommandResponse(request,context,deviceStateContext,true);
    }

    async function handlePowerControl(request, context) {
        const endpointId = request.directive.endpoint.endpointId;
        const requestToken = request.directive.endpoint.scope.token;
        const setValue = null;
        const requestMethod = request.directive.header.name;
        if (requestMethod === "TurnOff" || requestMethod === "TurnOn") {
            await sendDeviceCommand(request,setValue);
            const contextResult = await getAlexaDeviceState(requestToken,endpointId);
            return sendAlexaCommandResponse(request,context,contextResult);
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
            return sendAlexaCommandResponse(request,context,contextResult);
        }
    }

    async function handleBrightnessControl(request, context) {
        const endpointId = request.directive.endpoint.endpointId;
        const setValue = request.directive.payload.brightness;
        const requestToken = request.directive.endpoint.scope.token;
        const requestMethod = request.directive.header.name;
        if (requestMethod === "SetBrightness") {
            await sendDeviceCommand(request,setValue);
            const contextResult = await getAlexaDeviceState(requestToken,endpointId);
            return sendAlexaCommandResponse(request,context,contextResult);
        }
    }

    async function handleThermostatControl(request, context) {
        const endpointId = request.directive.endpoint.endpointId;
        const setValue = request.directive.payload.targetSetpoint.value;
        const requestToken = request.directive.endpoint.scope.token;
        const requestMethod = request.directive.header.name;
        if (requestMethod === "SetTargetTemperature") {
            await sendDeviceCommand(request,setValue);
            const contextResult = await getAlexaDeviceState(requestToken,endpointId);
            return sendAlexaCommandResponse(request,context,contextResult);
        }
    }

    async function handleColorControl(request, context) {
        const endpointId = request.directive.endpoint.endpointId;
        const setValue = request.directive.payload.color;
        const requestToken = request.directive.endpoint.scope.token;
        const requestMethod = request.directive.header.name;
        if (requestMethod === "SetColor") {
            await sendDeviceCommand(request,setValue);
            const contextResult = await getAlexaDeviceState(requestToken,endpointId);
            return sendAlexaCommandResponse(request,context,contextResult);
        }
    }

    async function handleSceneController(request, context) {
        const endpointId = request.directive.endpoint.endpointId;
        const setValue = request.directive.payload.color;
        const requestToken = request.directive.endpoint.scope.token;
        const requestMethod = request.directive.header.name;
        await sendDeviceCommand(request,setValue);
        const contextResult = await getAlexaDeviceState(requestToken,endpointId,true);
        return sendAlexaCommandResponse(request,context,contextResult);
    }

    const totalDuration = parseInt(performance.now() - durationStart);
    prodLogger("Duration : " + totalDuration + " ms");
    sendStatsd("request."+request.directive.header.namespace+"."+request.directive.header.name+":"+totalDuration+"|ms");

    return response;
};
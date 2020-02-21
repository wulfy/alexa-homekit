const {override} = require("./functions_override");
const {testLogger} = require('../../config/logger.js');
const {handler} = require("../../index")
const { DOMOTICZ_GET_DEVICES } = require("../mockups/deviceTestMockup.js");
const { ALEXA_REPORTSTATE_REQUEST_EXAMPLE, 
        ALEXA_SETPERCENT_REQUEST_EXAMPLE,
        ALEXA_SETPERCENT_REQUEST_EXAMPLE2,
        ALEXA_DISCOVERY_REQUEST_EXAMPLE,
        ALEXA_TURNON_REQUEST,
        ALEXA_TURNOFF_REQUEST,
        ALEXA_SETPERCENT_REQUEST_VENITIAN,
        ALEXA_SET_TARGET_TEMPERATURE_THERMOSTAT,
        ALEXA_SET_COLOR,
        ALEXA_SET_BRIGHTNESS
    } = require("../mockups/alexaMockups")

// true to use mockedData, false to use real domoticz access
override(DOMOTICZ_GET_DEVICES);

testLogger("---- TEST RUNNING ---- ")
//handleDiscovery(ALEXA_DISCOVERY_REQUEST_EXAMPLE);
//handleReportState(ALEXA_REPORTSTATE_REQUEST_EXAMPLE);
//handlePercentControl(ALEXA_SETPERCENT_REQUEST_EXAMPLE)

let context = {};
context.succeed = (data) => console.log("CONTEXT ENDED");

//TEST FOR INDEX.JS
handler(ALEXA_DISCOVERY_REQUEST_EXAMPLE,context);
//handler(ALEXA_SET_BRIGHTNESS,context);
//handler(ALEXA_SET_COLOR,context);
//handler(ALEXA_DISCOVERY_REQUEST_EXAMPLE);
//handler(ALEXA_SETPERCENT_REQUEST_VENITIAN);
//handler(ALEXA_REPORTSTATE_REQUEST_EXAMPLE("2_aeon"));
//handler(ALEXA_TURNON_REQUEST);
//handler(ALEXA_SET_TARGET_TEMPERATURE_THERMOSTAT,context);
testLogger('%j',context);
testLogger("---- TEST ENDED ---- ");
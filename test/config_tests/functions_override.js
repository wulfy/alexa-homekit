const { 
        DOMOTICZ_STATE_ANSWER, 
    } = require("../mockups/domoticzMockups")
const { DOMOTICZ_GET_DEVICES } = require("../mockups/client21Mockup.js");
const {
        getStateFromAlexaDevice,
        getAlexaDevice,
        sendAlexaCommandResponse,
        sendDeviceCommand,
        BASE_REQUEST,
        LIST_DEVICE_REQUEST
    } = require("../../domoticzApiHelper");
const {testLogger} = require('../../config/logger.js');
const base_config = require("./base_config");
process.env.PROD_MODE = "false";

/**
** Override domoticz function to force a mockedDomoticzObject
** it let you forcing domoticz access and response 
**/
exports.override = (withMockedData) =>
{
    //comment this for tests in real situations
    global.getDomoticzFromToken = (token) => {
        testLogger("---- GET MOCKED DOMOTICZ FROM TOKEN ---- ");
        const mockedDeviceData = withMockedData ? DOMOTICZ_GET_DEVICES : null;
        return new base_config.mockedDomoticz(token,mockedDeviceData);
    }

    global.getBase = (token) => "";
}

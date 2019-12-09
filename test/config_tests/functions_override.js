const { 
        DOMOTICZ_STATE_ANSWER, 
    } = require("../mockups/domoticzMockups")
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
exports.override = (mockedData) =>
{
    //comment this for tests in real situations
    global.getDomoticzFromToken = (token) => {
        testLogger("---- GET MOCKED DOMOTICZ FROM TOKEN ---- ");
        const mockedDeviceData = mockedData ? mockedData : null;
        return new base_config.mockedDomoticz(token,mockedDeviceData);
    }

    global.getBase = (token) => "";
}

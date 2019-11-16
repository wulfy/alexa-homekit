/**
** Export mocked objects to test skill without using Alexa
** Mocked object could use hard coded answers or do real request to a domoticz server
**/


process.env.PROD_MODE = "false";
const {debugLogger, prodLogger} = require('../../config/logger.js');
const baseProject = "../../"
const {handler} = require(baseProject+"index")
const {
        getStateFromAlexaDevice,
        alexaMapper,
        sendAlexaCommandResponse,
        sendDeviceCommand,
        getAlexaDeviceState,
        BASE_REQUEST,
        LIST_DEVICE_REQUEST
    } = require(baseProject+"domoticzApiHelper");

const domoticz = require('../../domoticz');
const mockups = require("../mockups/alexaMockups")

const { 
        DOMOTICZ_STATE_ANSWER
    } = require("../mockups/domoticzMockups")

//disable console logs for tests
//global.console.log = (data)=>null;
exports.alexaMapper = alexaMapper;
exports.handler = handler;
exports.mockups = mockups;
exports.sendDeviceCommand = sendDeviceCommand;
exports.getAlexaDeviceState = getAlexaDeviceState;
exports.sendAlexaCommandResponse = sendAlexaCommandResponse;

class mockedDomoticz extends domoticz {

    constructor(token,MOCKED_ANSWER) {
        super(token);
        this.MOCKED_ANSWER = MOCKED_ANSWER;
    }

    getAllDevices() {
        return this.MOCKED_ANSWER 
         ? JSON.parse(this.MOCKED_ANSWER).result
         : super.getAllDevices();
    }

    getDevice(deviceId) {
        if(!this.MOCKED_ANSWER)
        {
            return super.getDevice();
        }
        let jsonDomoticzData = JSON.parse(this.MOCKED_ANSWER);
        let foundDevice = jsonDomoticzData.result[0];
        jsonDomoticzData.result.some((device)=>{
            foundDevice = device
            return deviceId === device.idx;
        });
        return foundDevice;
    }

    getConnectionConfig (token){
        const basicAuth = 'Basic ' + Buffer.from(`foo:bar`).toString('base64');
        prodLogger("CONFIG MOCKED");
        return {
                proto: "http",
                hostname: "foo.bar.com",
                port: "8080",
                path: '/json.htm',
                method: 'GET',
                headers: {
                  'Authorization': basicAuth,
                }
            };
    }

}

const Tester = class Tester{
    constructor(name){
        this.name = name;
    }

    test(){
        //TEST FOR INDEX.JS
        test('DISCOVERY TESTING ' + this.name , done => {

            const { DOMOTICZ_GET_DEVICES } = require("../mockups/"+this.name+"Mockup");

            global.getDevices = (token,domoticzDeviceId) => {
                return JSON.parse(DOMOTICZ_GET_DEVICES).result;
            }
            let context = {};
            context.succeed = function (data){
                const testData = JSON.stringify(data); 
                expect(testData).toMatchSnapshot();
                done();
            };
            
            handler(mockups.ALEXA_DISCOVERY_REQUEST_EXAMPLE,context2);

        });
    }
}

exports.mockedDomoticz = mockedDomoticz;
exports.Tester;
process.env.PROD_MODE = "true";
const baseProject = "../../"
const {handler} = require(baseProject+"index")
const {
        getStateFromAlexaDevice,
        getAlexaDevice,
        sendAlexaCommandResponse,
        sendDeviceCommand,
        BASE_REQUEST,
        LIST_DEVICE_REQUEST
    } = require(baseProject+"domoticzApiHelper");

const { ALEXA_REPORTSTATE_REQUEST_EXAMPLE, 
        ALEXA_SETPERCENT_REQUEST_EXAMPLE,
        ALEXA_DISCOVERY_REQUEST_EXAMPLE,
        ALEXA_TURNON_REQUEST,
        ALEXA_TURNOFF_REQUEST,
    } = require("../mockups/alexaMockups")

const { 
        DOMOTICZ_STATE_ANSWER, 
    } = require("../mockups/domoticzMockups")

global.console.log = (data)=>null;

exports.handler = handler;
exports.ALEXA_DISCOVERY_REQUEST_EXAMPLE = ALEXA_DISCOVERY_REQUEST_EXAMPLE;


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
            
            base_config.handler(base_config.ALEXA_DISCOVERY_REQUEST_EXAMPLE,context2);

        });
    }
}

exports.Tester;
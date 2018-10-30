const base_config = require("../config_tests/base_config");

//TEST FOR INDEX.JS
test('DISCOVERY TESTING client3', done => {

    const { DOMOTICZ_GET_DEVICES } = require("../mockups/client3Mockup");

    global.getDevices = (token,domoticzDeviceId) => {
        return JSON.parse(DOMOTICZ_GET_DEVICES).result;
    }
    let context2 = {};
    context2.succeed = function (data){
        const testData = JSON.stringify(data); 
        expect(testData).toMatchSnapshot();
        done();
    };
    
    base_config.handler(base_config.ALEXA_DISCOVERY_REQUEST_EXAMPLE,context2);

});
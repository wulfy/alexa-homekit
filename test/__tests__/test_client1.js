const base_config = require("../config_tests/base_config");

const { DOMOTICZ_GET_DEVICES } = require("../mockups/client1Mockup");
global.getDomoticzFromToken = (token) => {
    return new base_config.mockedDomoticz(token,DOMOTICZ_GET_DEVICES);
}

//TEST FOR INDEX.JS
test('DISCOVERY TESTING client1', done => {
    let context = {};
    context.succeed = function (data){
        const testData = JSON.stringify(data); 
        expect(testData).toMatchSnapshot();
        done();
    };
    
    base_config.handler(base_config.mockups.ALEXA_DISCOVERY_REQUEST_EXAMPLE,context);
});
const base_config = require("../config_tests/base_config");
const fs = require('fs');

global.getDomoticzFromToken = (token) => {
    return new base_config.mockedDomoticz(token,DOMOTICZ_GET_DEVICES);
}

let clientNumber = 1;
let clientMockupPath = "../mockups/client"+clientNumber+"Mockup";
let watchdog = 1000;
while(fs.existsSync(clientMockupPath) && watchdog >0 )
{
	const { DOMOTICZ_GET_DEVICES } = require("../mockups/client1Mockup");
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

	clientNumber ++;
	clientMockupPath = "../mockups/client"+clientNumber+"Mockup";
	watchdog --;
}
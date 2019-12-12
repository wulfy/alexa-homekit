const base_config = require("../config_tests/base_config");
const {override} = require("../config_tests/functions_override");

let file = '';
let domoticz_mockup = '';
describe('Testing all clients', () => { 
    for(let i = 10; i < 13; i++){
    	file = "../mockups/client"+i+"Mockup";
		domoticz_mockup = { DOMOTICZ_GET_DEVICES } = require(file);
		override(domoticz_mockup.DOMOTICZ_GET_DEVICES);

		it('DISCOVERY TESTING client' + i, done => {
			let context = {};
			context.succeed = function (data){
				const testData = JSON.stringify(data); 
				expect(testData).toMatchSnapshot();
				done();
			};
			base_config.handler(base_config.mockups.ALEXA_DISCOVERY_REQUEST_EXAMPLE,context);
			console.log("testing");
		});
	}
});
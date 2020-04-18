const base_config = require("../config_tests/base_config");
const {override} = require("../config_tests/functions_override");

describe('Testing all clients', () => { 
	for(let id = 1; id <= 27; id++){
		it('Testing client id ' + id, () => { 
			let file = "../mockups/client"+id+"Mockup";
			let domoticz_mockup = { DOMOTICZ_GET_DEVICES } = require(file);
			let context = {};

			override(domoticz_mockup.DOMOTICZ_GET_DEVICES);
			context.succeed = (data) => {
				testData = JSON.stringify(data);
				expect(testData).toMatchSnapshot();
			};
			base_config.handler(base_config.mockups.ALEXA_DISCOVERY_REQUEST_EXAMPLE,context);
		});
	}
});
const base_config = require("../config_tests/base_config");
const {override} = require("../config_tests/functions_override");

describe('Testing all clients', () => {
	for(let id = 1; id <= 33; id++){
		it('Testing client id ' + id, async () => {
			let file = "../mockups/client"+id+"Mockup";
			let domoticz_mockup = { DOMOTICZ_GET_DEVICES } = require(file);

			override(domoticz_mockup.DOMOTICZ_GET_DEVICES);
			const data = await base_config.handler(base_config.mockups.ALEXA_DISCOVERY_REQUEST_EXAMPLE, {});
			expect(JSON.stringify(data)).toMatchSnapshot();
		});
	}
});
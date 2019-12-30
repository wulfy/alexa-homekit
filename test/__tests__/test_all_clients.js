const base_config = require("../config_tests/base_config");
const {override} = require("../config_tests/functions_override");

let file = '';
let domoticz_mockup = '';

const doTest = async _ => {
	for(let id = 10; id < 25; id++){
		let file = "../mockups/client"+id+"Mockup";
		let domoticz_mockup = { DOMOTICZ_GET_DEVICES } = require(file);

		console.log("test " + id);
		let context = {};
		override(domoticz_mockup.DOMOTICZ_GET_DEVICES);
		context.succeed = function (data){
			const testData = JSON.stringify(data); 
			expect(testData).toMatchSnapshot();
		};
		await base_config.handler(base_config.mockups.ALEXA_DISCOVERY_REQUEST_EXAMPLE,context);
	}
	sleep(4000);
}

let testData = '';

beforeEach(() => testData = '');

describe('Testing all clients', () => { 
	for(let id = 10; id < 25; id++){
		it('Testing client id ' + id, async () => { 
			let file = "../mockups/client"+id+"Mockup";
			let domoticz_mockup = { DOMOTICZ_GET_DEVICES } = require(file);

			console.log("test " + id);
			let context = {};
			
			override(domoticz_mockup.DOMOTICZ_GET_DEVICES);
			context.succeed = (data) => {
				testData = JSON.stringify(data);
			};
			base_config.handler(base_config.mockups.ALEXA_DISCOVERY_REQUEST_EXAMPLE,context);
			expect(testData).toMatchSnapshot();
		});
	}
});
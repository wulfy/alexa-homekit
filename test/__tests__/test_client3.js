const base_config = require("../config_tests/base_config");
const { DOMOTICZ_GET_DEVICES } = require("../mockups/client3Mockup");

global.getDomoticzFromToken = (token) => {
    return new base_config.mockedDomoticz(token,DOMOTICZ_GET_DEVICES);
}

//TEST FOR INDEX.JS
test('DISCOVERY TESTING client 3', async () => {
    const data = await base_config.handler(base_config.mockups.ALEXA_DISCOVERY_REQUEST_EXAMPLE, {});
    expect(JSON.stringify(data)).toMatchSnapshot();
});
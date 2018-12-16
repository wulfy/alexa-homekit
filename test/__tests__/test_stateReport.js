const base_config = require("../config_tests/base_config");

const { DOMOTICZ_GET_DEVICES } = require("../mockups/client4Mockup");

global.getDomoticzFromToken = (token) => {
    return new base_config.mockedDomoticz(token,DOMOTICZ_GET_DEVICES);
}

test('GET DEVICE STATE', async done => {
    const data = await base_config.getAlexaDeviceState("notoken","73_RFY_VenetianBlindsUS");
    //removing timestamp data for tests
    data.properties.forEach(property => property.timeOfSample = null);
    expect(data).toEqual({"properties":
                                    [
                                        {
                                            "name": "powerState", 
                                            "namespace": "Alexa.PowerController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "OFF"
                                        }, 
                                        {
                                            "name": "percentage", 
                                            "namespace": "Alexa.PercentageController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "0"
                                        }
                                    ]
                    });
    done();
});


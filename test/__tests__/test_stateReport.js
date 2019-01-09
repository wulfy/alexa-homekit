const base_config = require("../config_tests/base_config");

test('GET DEVICE STATE VENITIAN BLIND', async done => {

    const { DOMOTICZ_GET_DEVICES } = require("../mockups/client4Mockup");
    global.getDomoticzFromToken = (token) => {
        return new base_config.mockedDomoticz(token,DOMOTICZ_GET_DEVICES);
    }

    const data = await base_config.getAlexaDeviceState("notoken","73_RFY_VenetianBlindsUS");
    //removing timestamp data for tests
    data.properties.forEach(property => property.timeOfSample = null);
    expect(data).toEqual({"properties":
                                    [
                                        {
                                            "name": "percentage", 
                                            "namespace": "Alexa.PercentageController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "0"
                                        },
                                        {
                                            "name": "powerState", 
                                            "namespace": "Alexa.PowerController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "ON"
                                        }, 
                                    ]
                    });
    done();
});

test('GET DEVICE STATE BLINDS RFY', async done => {

    const { DOMOTICZ_GET_DEVICES } = require("../mockups/client11Mockup");
    global.getDomoticzFromToken = (token) => {
        return new base_config.mockedDomoticz(token,DOMOTICZ_GET_DEVICES);
    }

    const data = await base_config.getAlexaDeviceState("notoken","2_ASA_Blinds");
    //removing timestamp data for tests
    data.properties.forEach(property => property.timeOfSample = null);
    expect(data).toEqual({"properties":
                                    [
                                        {
                                            "name": "percentage", 
                                            "namespace": "Alexa.PercentageController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "0"
                                        },
                                        {
                                            "name": "powerState", 
                                            "namespace": "Alexa.PowerController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "OFF"
                                        }, 
                                    ]
                    });
    done();
});

test('GET DEVICE STATE BLINDS SWITCH', async done => {

    const { DOMOTICZ_GET_DEVICES } = require("../mockups/client12Mockup");
    global.getDomoticzFromToken = (token) => {
        return new base_config.mockedDomoticz(token,DOMOTICZ_GET_DEVICES);
    }

    const data = await base_config.getAlexaDeviceState("notoken","34_Switch_Blinds");
    //removing timestamp data for tests
    data.properties.forEach(property => property.timeOfSample = null);
    expect(data).toEqual({"properties":
                                    [
                                        {
                                            "name": "percentage", 
                                            "namespace": "Alexa.PercentageController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "100"
                                        },
                                        {
                                            "name": "powerState", 
                                            "namespace": "Alexa.PowerController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "OFF"
                                        }, 
                                    ]
                    });
    done();
});

test('GET DEVICE STATE BLINDS INVERTED', async done => {

    const { DOMOTICZ_GET_DEVICES } = require("../mockups/client3Mockup");
    global.getDomoticzFromToken = (token) => {
        return new base_config.mockedDomoticz(token,DOMOTICZ_GET_DEVICES);
    }

    const data = await base_config.getAlexaDeviceState("notoken","185_AC_BlindsInverted");
    //removing timestamp data for tests
    data.properties.forEach(property => property.timeOfSample = null);
    expect(data).toEqual({"properties":
                                    [
                                        {
                                            "name": "percentage", 
                                            "namespace": "Alexa.PercentageController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "100"
                                        },
                                        {
                                            "name": "powerState", 
                                            "namespace": "Alexa.PowerController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "ON"
                                        }, 
                                    ]
                    });
    done();
});

test('GET DEVICE STATE BLIND PERCENTAGE', async done => {

    const { DOMOTICZ_GET_DEVICES } = require("../mockups/client10Mockup");
    global.getDomoticzFromToken = (token) => {
        return new base_config.mockedDomoticz(token,DOMOTICZ_GET_DEVICES);
    }

    const data = await base_config.getAlexaDeviceState("notoken","201_Switch_BlindsPercentage");
    //removing timestamp data for tests
    data.properties.forEach(property => property.timeOfSample = null);
    expect(data).toEqual({"properties":
                                    [
                                        {
                                            "name": "percentage", 
                                            "namespace": "Alexa.PercentageController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "100"
                                        },
                                        {
                                            "name": "powerState", 
                                            "namespace": "Alexa.PowerController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "OFF"
                                        }, 
                                    ]
                    });
    done();
});

test('GET DEVICE STATE DIMMER', async done => {

    const { DOMOTICZ_GET_DEVICES } = require("../mockups/client6Mockup");
    global.getDomoticzFromToken = (token) => {
        return new base_config.mockedDomoticz(token,DOMOTICZ_GET_DEVICES);
    }

    const data = await base_config.getAlexaDeviceState("notoken","271_Switch_Dimmer");
    //removing timestamp data for tests
    data.properties.forEach(property => property.timeOfSample = null);
    expect(data).toEqual({"properties":
                                    [
                                        {
                                            "name": "percentage", 
                                            "namespace": "Alexa.PercentageController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "100"
                                        },
                                        {
                                            "name": "powerState", 
                                            "namespace": "Alexa.PowerController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "ON"
                                        }, 
                                    ]
                    });
    done();
});

test('GET DEVICE STATE COLOR', async done => {

    const { DOMOTICZ_GET_DEVICES } = require("../mockups/domoticzMockups");
    global.getDomoticzFromToken = (token) => {
        return new base_config.mockedDomoticz(token,DOMOTICZ_GET_DEVICES);
    }

    const data = await base_config.getAlexaDeviceState("notoken","37_Switch_Dimmer");
    //removing timestamp data for tests
    data.properties.forEach(property => property.timeOfSample = null);
    expect(data).toEqual({"properties":
                                    [
                                        {
                                            "name": "brightness", 
                                            "namespace": "Alexa.BrightnessController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": 41
                                        },
                                        {
                                            "name": "color", 
                                            "namespace": "Alexa.ColorController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": {
                                                "hue":273,
                                                "brightness":0.41,
                                                "saturation":1
                                            }
                                        },
                                        {
                                            "name": "powerState", 
                                            "namespace": "Alexa.PowerController",
                                            "timeOfSample":null, 
                                            "uncertaintyInMilliseconds": 500, 
                                            "value": "ON"
                                        }, 
                                    ]
                    });
    done();
});


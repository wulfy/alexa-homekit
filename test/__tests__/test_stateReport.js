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

test('GET SCENE STATE', async done => {

    const { DOMOTICZ_GET_SCENES } = require("../mockups/domoticzMockups");
    const { ALEXA_ACTIVATE_SCENE } = require("../mockups/alexaMockups");
    global.getDomoticzFromToken = (token) => {
        return new base_config.mockedDomoticz(token,DOMOTICZ_GET_SCENES);
    }

    const data = await base_config.getAlexaDeviceState("notoken","1_undefined_undefined",true);
    const context = {
        succeed: function(data){this.response = data},
        response: null,
    }
    //removing timestamp data for tests
    data.properties.forEach(property => property.timeOfSample = null);
    base_config.sendAlexaCommandResponse(ALEXA_ACTIVATE_SCENE,context,data);
    context.response.event.timestamp = null;
    expect(context.response).toEqual({"context": {},
                                        "event": {
                                            "header": {
                                                "namespace": "Alexa.SceneController",
                                                "name": "ActivationStarted",
                                                "payloadVersion": "3",
                                                "messageId": "abc-123-def-456-R",
                                                "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
                                            },
                                            "endpoint": {
                                                "scope": {
                                                    "type": "BearerToken",
                                                    "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
                                                },
                                                "endpointId": "1_undefined_undefined"
                                            },
                                            "payload": {
                                                "cause": {
                                                    "type": "VOICE_INTERACTION"
                                                }
                                            },
                                            "timestamp": null
                                        }
                                    });
    done();
});


const base_config = require("../config_tests/base_config");

const { DOMOTICZ_GET_DEVICES } = require("../mockups/client4Mockup");

global.getDomoticzFromToken = (token) => {
    return new base_config.mockedDomoticz(token);
}

test('SENDING SET PERCENT ON BLINDS INVERTED', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SETPERCENT_REQUEST_BLINDS_INVERTED,50);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=2&switchcmd=Set%20Level&level=50");
});


test('SENDING SET PERCENT ON BLINDS', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SETPERCENT_REQUEST_BLINDS,50);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=2&switchcmd=Set%20Level&level=50");

});

test('SENDING SET PERCENT ON VENITIAN', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SETPERCENT_REQUEST_VENITIAN,50);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=73&switchcmd=Stop&level=0");
});

test('SENDING TURN ON POWER', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=2&switchcmd=On");
});

test('SENDING TURN ON POWER BLINDS', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST_BLINDS);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=3&switchcmd=On");
});

test('SENDING TURN ON POWER BLINDS INVERTED', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST_BLINDS_INVERTED);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=4&switchcmd=On");
});

test('SENDING TURN OFF POWER VENITIAN US (ON INVERTED)', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST_VENITIAN);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=5&switchcmd=Off");
});

test('SENDING TURN OFF POWER VENITIAN EU (ON INVERTED)', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST_VENITIAN_EU);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=77&switchcmd=Off");
});

test('SENDING TURN ON POWER VENITIAN EU (OFF INVERTED)', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNOFF_REQUEST_VENITIAN_EU);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=77&switchcmd=On");
});

test('SENDING TURN OFF', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNOFF_REQUEST);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=ludo&switchcmd=Off");
});

test('SENDING THERMOSTAT SET POINT', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SET_TARGET_TEMPERATURE_THERMOSTAT,21.0);
    expect(data).toBe("/json.htm?type=command&param=setsetpoint&idx=104&setpoint=21");
});

test('SENDING PUSH ON', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST_PUSH_FORCE_ON);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=18&switchcmd=On");
});

test('SENDING PUSH OFF', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNOFF_REQUEST_PUSH_FORCE_ON);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=639&switchcmd=On");
});

test('SENDING PUSH ON FORCING OFF', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST_PUSH_FORCE_OFF);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=11&switchcmd=Off");
});

test('SENDING PUSH OFF FORCING ON', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNOFF_REQUEST_PUSH_FORCE_OFF);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=69&switchcmd=Off");
});

test('SENDING SET COLOR', async () => {
    const HSLvalue = {
                "hue": 350.5,
                "saturation": 0.7138,
                "brightness": 0.6524
            };
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SET_COLOR,HSLvalue);
    expect(data).toBe("/json.htm?type=command&param=setcolbrightnessvalue&idx=37&hue=350.5&brightness=65.24&iswhite=false");
});

test('SENDING SET COLOR WHITE', async () => {
    const HSLvalue = {
                "hue": 350.5,
                "saturation": 0,
                "brightness": 0.6524
            };
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SET_COLOR,HSLvalue);
    expect(data).toBe("/json.htm?type=command&param=setcolbrightnessvalue&idx=37&brightness=65.24&color=%7B%22m%22:3,%22t%22:0,%22r%22:254,%22g%22:254,%22b%22:254,%22cw%22:0,%22ww%22:0%7D");
});

test('SENDING SET BRIGHTNESS', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SET_BRIGHTNESS,42);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=37&switchcmd=Set%20Level&level=42");
});

test('SENDING TO DEVICE WITH MAXDIM', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SETPERCENT_MAXDIM,73);
    expect(data).toBe("/json.htm?type=command&param=switchlight&idx=1503&switchcmd=Set%20Level&level=11");
});

test('SENDING ACTIVATE TO SCENE', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_ACTIVATE_SCENE);
    expect(data).toBe("/json.htm?type=command&param=switchscene&idx=1&switchcmd=On");
});

test('SENDING DEACTIVATE TO SCENE', async () => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_DEACTIVATE_SCENE);
    expect(data).toBe("/json.htm?type=command&param=switchscene&idx=1&switchcmd=Off");
});

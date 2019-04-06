const base_config = require("../config_tests/base_config");

const { DOMOTICZ_GET_DEVICES } = require("../mockups/client4Mockup");

global.getDomoticzFromToken = (token) => {
    return new base_config.mockedDomoticz(token);
}

test('SENDING SET PERCENT ON BLINDS INVERTED', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SETPERCENT_REQUEST_BLINDS_INVERTED,50);
    expect(data).toBe("?type=command&param=switchlight&idx=2&switchcmd=Set%20Level&level=50");
    done();
});


test('SENDING SET PERCENT ON BLINDS', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SETPERCENT_REQUEST_BLINDS,50);
    expect(data).toBe("?type=command&param=switchlight&idx=2&switchcmd=Set%20Level&level=50");
    done();

});

test('SENDING SET PERCENT ON VENITIAN', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SETPERCENT_REQUEST_VENITIAN,50);
    expect(data).toBe("?type=command&param=switchlight&idx=73&switchcmd=Stop&level=0");
    done();
});

test('SENDING TURN ON POWER', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST);
    expect(data).toBe("?type=command&param=switchlight&idx=2&switchcmd=On");
    done();
});

test('SENDING TURN ON POWER BLINDS', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST_BLINDS);
    expect(data).toBe("?type=command&param=switchlight&idx=3&switchcmd=Off");
    done();
});

test('SENDING TURN ON POWER BLINDS INVERTED', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST_BLINDS_INVERTED);
    expect(data).toBe("?type=command&param=switchlight&idx=4&switchcmd=On");
    done();
});

test('SENDING TURN OFF POWER VENITIAN US (ON INVERTED)', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST_VENITIAN);
    expect(data).toBe("?type=command&param=switchlight&idx=5&switchcmd=Off");
    done();
});

test('SENDING TURN OFF POWER VENITIAN EU (ON INVERTED)', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST_VENITIAN_EU);
    expect(data).toBe("?type=command&param=switchlight&idx=77&switchcmd=Off");
    done();
});

test('SENDING TURN ON POWER VENITIAN EU (OFF INVERTED)', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNOFF_REQUEST_VENITIAN_EU);
    expect(data).toBe("?type=command&param=switchlight&idx=77&switchcmd=On");
    done();
});

test('SENDING TURN OFF', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNOFF_REQUEST);
    expect(data).toBe("?type=command&param=switchlight&idx=ludo&switchcmd=Off");
    done();
});

test('SENDING THERMOSTAT SET POINT', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SET_TARGET_TEMPERATURE_THERMOSTAT,21.0);
    expect(data).toBe("?type=command&param=setsetpoint&idx=104&setpoint=21");
    done();
});

test('SENDING PUSH ON', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNON_REQUEST_PUSH,21.0);
    expect(data).toBe("?type=command&param=switchlight&idx=18&switchcmd=On");
    done();
});

test('SENDING PUSH OFF', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNOFF_REQUEST_PUSH,21.0);
    expect(data).toBe("?type=command&param=switchlight&idx=639&switchcmd=On");
    done();
});

test('SENDING SET COLOR', async done => {
    const HSLvalue = {
                "hue": 350.5,
                "saturation": 0.7138,
                "brightness": 0.6524
            };
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SET_COLOR,HSLvalue);
    expect(data).toBe("?type=command&param=setcolbrightnessvalue&idx=37&hue=350.5&brightness=65.24&iswhite=false");
    done();
});

test('SENDING SET COLOR WHITE', async done => {
    const HSLvalue = {
                "hue": 350.5,
                "saturation": 0,
                "brightness": 0.6524
            };
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SET_COLOR,HSLvalue);
    expect(data).toBe("?type=command&param=setcolbrightnessvalue&idx=37&hue=350.5&brightness=65.24&iswhite=true");
    done();
});

test('SENDING SET BRIGHTNESS', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SET_BRIGHTNESS,42);
    expect(data).toBe("?type=command&param=switchlight&idx=37&switchcmd=Set%20Level&level=42");
    done();
});

test('SENDING TO DEVICE WITH MAXDIM', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_SETPERCENT_MAXDIM,73);
    expect(data).toBe("?type=command&param=switchlight&idx=1503&switchcmd=Set%20Level&level=12");
    done();
});

test('SENDING ACTIVATE TO SCENE', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_ACTIVATE_SCENE);
    expect(data).toBe("?type=command&param=switchscene&idx=1&switchcmd=On");
    done();
});

test('SENDING DEACTIVATE TO SCENE', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_DEACTIVATE_SCENE);
    expect(data).toBe("?type=command&param=switchscene&idx=1&switchcmd=Off");
    done();
});
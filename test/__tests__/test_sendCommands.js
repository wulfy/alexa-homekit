const base_config = require("../config_tests/base_config");

const { DOMOTICZ_GET_DEVICES } = require("../mockups/client4Mockup");
global.getDevices = (token,domoticzDeviceId) => {
    return JSON.parse(DOMOTICZ_GET_DEVICES).result;
}

global.getBase = (token) => "";

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

test('SENDING TURN OFF', async done => {
    const data = await base_config.sendDeviceCommand(base_config.mockups.ALEXA_TURNOFF_REQUEST);
    expect(data).toBe("?type=command&param=switchlight&idx=ludo&switchcmd=Off");
    done();
});
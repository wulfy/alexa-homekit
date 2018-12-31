exports.LIST_DEVICE_REQUEST = "type=devices&used=true&order=Name";
const SET_DEVICE_LVL = "switchcmd=Set%20Level";
const PERCENT_VALUE = "level";
const SET_DEVICE_ON = "switchcmd=On";
const SET_DEVICE_OFF = "switchcmd=Off";
const SET_VOLET_STOP = "switchcmd=Stop";
const SET_POINT_VAUE = "setpoint";
const SETPOINT_PARAM = "param=setsetpoint";
const SWITCH_PARAM = "param=switchlight";
exports.STATE_REQUEST = "type=devices";
exports.SET_COMMAND = "type=command";
const VOLET_VENETIAN_SUBTYPE = "VenetianBlindsUS";
const VOLET_SUBTYPE = "BlindsPercentage";
const VOLET_BLINDS = "Blinds";
const PUSH_BUTTON = "PushOnButton";
const SUBTYPE_TOINVERT = [VOLET_SUBTYPE,VOLET_VENETIAN_SUBTYPE,VOLET_BLINDS];
const SUBTYPE_TO_FORCE_ON = [PUSH_BUTTON];
const SUBTYPE_TO_STOP = [VOLET_VENETIAN_SUBTYPE,VOLET_BLINDS];

device_handler_command = (subType,value)=>({
	"SetPercentage": {
		"command" : subType === VOLET_VENETIAN_SUBTYPE && 50 === value 
					? SET_VOLET_STOP
					: SET_DEVICE_LVL,
		"param" : SWITCH_PARAM,
		"value" : SUBTYPE_TO_STOP.includes(subType) && 50 === value 
					? PERCENT_VALUE + "=" + 0
					: PERCENT_VALUE + "=" + value,
	},
	"TurnOff": {
		"command" : (SUBTYPE_TOINVERT.includes(subType) || SUBTYPE_TO_FORCE_ON.includes(subType)) ? SET_DEVICE_ON : SET_DEVICE_OFF,
		"param" : SWITCH_PARAM,
	},
	"TurnOn": {
		"command" : SUBTYPE_TOINVERT.includes(subType) ? SET_DEVICE_OFF : SET_DEVICE_ON,
		"param" : SWITCH_PARAM,
	},
	"SetTargetTemperature": {
		"param" : SETPOINT_PARAM,
		"value" : SET_POINT_VAUE+"="+value,
	}
});

exports.generate_command = (subtype,deviceId,command,value) => {
	console.log(subtype + "->" + command + "->" + value)
	const paramsMapper = device_handler_command(subtype,value)[command];
	let deviceRequest = `${paramsMapper["param"]}&idx=${deviceId}`;

	if(paramsMapper["command"])
	deviceRequest += `&${paramsMapper["command"]}`;

	if(paramsMapper["value"])
		deviceRequest += `&${paramsMapper["value"]}`

	return deviceRequest;
}
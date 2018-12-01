exports.LIST_DEVICE_REQUEST = "type=devices&used=true&order=Name"
const SET_DEVICE_LVL = "switchcmd=Set%20Level"
const PERCENT_VALUE = "level";
const SET_DEVICE_ON = "switchcmd=On"
const SET_DEVICE_OFF = "switchcmd=Off"
const SET_VOLET_STOP = "switchcmd=Stop"
exports.STATE_REQUEST = "type=devices"
exports.SET_COMMAND = "type=command&param=switchlight"
const VOLET_VENETIAN_SUBTYPE = "VenetianBlindsUS";
const VOLET_SUBTYPE = "BlindsPercentage";
const SUBTYPE_TOINVERT = [VOLET_SUBTYPE,VOLET_VENETIAN_SUBTYPE];

device_handler_command = (subType,value)=>({
	"SetPercentage": {
		"command" : subType === VOLET_VENETIAN_SUBTYPE && 50 === value 
					? SET_VOLET_STOP
					: SET_DEVICE_LVL,
		"value" : subType === VOLET_VENETIAN_SUBTYPE && 50 === value 
					? PERCENT_VALUE + "=" + 10
					: PERCENT_VALUE + "=" + value,
	},
	"TurnOff": {
		"command" : SUBTYPE_TOINVERT.includes(subType) ? SET_DEVICE_ON : SET_DEVICE_OFF,
	},
	"TurnOn": {
		"command" : SUBTYPE_TOINVERT.includes(subType) ? SET_DEVICE_OFF : SET_DEVICE_ON,
	},
});

exports.generate_command = (subtype,deviceId,command,value) => {
	console.log(subtype + "->" + command + "->" + value)
	const paramsMapper = device_handler_command(subtype,value)[command];
	let deviceRequest = `&idx=${deviceId}&${paramsMapper["command"]}`;

	if(paramsMapper["value"])
		deviceRequest += `&${paramsMapper["value"]}`

	return deviceRequest; 
}
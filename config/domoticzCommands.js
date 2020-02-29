const {prodLogger} = require('./logger.js');

exports.LIST_DEVICE_REQUEST = "type=devices&used=true&order=Name";
exports.LIST_SCENE_REQUEST = "type=scenes&used=true&order=Name";
const SET_DEVICE_LVL = "switchcmd=Set Level";
const PERCENT_VALUE = "level";
const SET_DEVICE_ON = "switchcmd=On";
const SET_DEVICE_OFF = "switchcmd=Off";
const SET_VOLET_STOP = "switchcmd=Stop";
const SET_POINT_VALUE = "setpoint";
const SETPOINT_PARAM = "param=setsetpoint";
const SETCOLOR_PARAM = "param=setcolbrightnessvalue";
const SCENE_PARAM = "param=switchscene";
const SWITCH_PARAM = "param=switchlight";
exports.STATE_REQUEST = "type=devices";
exports.SET_COMMAND = "type=command";
const VOLET_VENETIAN_US_SUBTYPE = "VenetianBlindsUS";
const VOLET_VENETIAN_EU_SUBTYPE = "VenetianBlindsEU";
const VOLET_SUBTYPE = "BlindsPercentage";
const VOLET_BLINDS = "Blinds";
const PUSH_ON_BUTTON = "PushOnButton";
const PUSH_OFF_BUTTON = "PushOffButton";
const SUBTYPE_TO_INVERT = [VOLET_SUBTYPE,VOLET_VENETIAN_US_SUBTYPE,VOLET_VENETIAN_EU_SUBTYPE,VOLET_BLINDS];
const SUBTYPE_TO_FORCE_ON = [PUSH_ON_BUTTON];
const SUBTYPE_TO_FORCE_OFF = [PUSH_OFF_BUTTON];
const SUBTYPE_TO_STOP = [VOLET_VENETIAN_US_SUBTYPE,VOLET_VENETIAN_EU_SUBTYPE,VOLET_BLINDS];

device_handler_command = (subType,value)=>({
	"SetPercentage": {
		"command" : SUBTYPE_TO_STOP.includes(subType) && 50 === value 
					? SET_VOLET_STOP
					: SET_DEVICE_LVL,
		"param" : SWITCH_PARAM,
		"value" : SUBTYPE_TO_STOP.includes(subType) && 50 === value 
					? PERCENT_VALUE + "=" + 0
					: PERCENT_VALUE + "=" + value,
	},
	"SetBrightness": {
		"command" : SET_DEVICE_LVL,
		"param" : SWITCH_PARAM,
		"value" : PERCENT_VALUE + "=" + value,
	},
	"TurnOff": {
		"command" : (SUBTYPE_TO_INVERT.includes(subType) || SUBTYPE_TO_FORCE_ON.includes(subType)) ? SET_DEVICE_ON : SET_DEVICE_OFF,
		"param" : SWITCH_PARAM,
	},
	"TurnOn": {
		"command" : (SUBTYPE_TO_INVERT.includes(subType) || SUBTYPE_TO_FORCE_OFF.includes(subType)) ? SET_DEVICE_OFF : SET_DEVICE_ON,
		"param" : SWITCH_PARAM,
	},
	"SetTargetTemperature": {
		"param" : SETPOINT_PARAM,
		"value" : SET_POINT_VALUE+"="+value,
	},
	"SetColor": {
		"param" : SETCOLOR_PARAM,
		"value" : (value
					?  value.saturation == 0 
					    ? 'brightness='+ (value.brightness*100) + '&color={"m":3,"t":0,"r":254,"g":254,"b":254,"cw":0,"ww":0}'
					    : ("hue="+value.hue+"&brightness="+ (value.brightness*100)+"&iswhite=" + (value.saturation == 0 ? 'true':'false'))
					: null),
	},
	"Activate": {
		"param" : SCENE_PARAM,
		"value" : "switchcmd=On"
	},
	"Deactivate": {
		"param" : SCENE_PARAM,
		"value" : "switchcmd=Off",
	}

});

exports.generate_command = (subtype,deviceId,command,value) => {
	prodLogger(subtype + "->" + command + "->" + value)
	const paramsMapper = device_handler_command(subtype,value)[command];
	let deviceRequest = `${paramsMapper["param"]}&idx=${deviceId}`;

	if(paramsMapper["command"])
	deviceRequest += `&${paramsMapper["command"]}`;

	if(paramsMapper["value"])
		deviceRequest += `&${paramsMapper["value"]}`

	return encodeURI(deviceRequest);
}
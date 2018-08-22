exports.LIST_DEVICE_REQUEST = "type=devices&used=true&order=Name"
const SET_DEVICE_LVL = "switchcmd=Set%20Level"
const PERCENT_VALUE = "level";
const SET_DEVICE_ON = "switchcmd=On"
const SET_DEVICE_OFF = "switchcmd=Off"
exports.STATE_REQUEST = "type=devices"
exports.SET_COMMAND = "type=command&param=switchlight"

exports.DEVICE_HANDLER_COMMANDS_PARAMS = {
	"SetPercentage": {
		"command" : SET_DEVICE_LVL,
		"value" : PERCENT_VALUE,
	},
	"TurnOff": {
		"command" : SET_DEVICE_OFF,
	},
	"TurnOn": {
		"command" : SET_DEVICE_ON,
	},
}
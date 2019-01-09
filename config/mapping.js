const COMMON_DISCOVERY_MAPPING = {
		"endpointId" : "@idx@_@HardwareName@_@SwitchType@",
		"manufacturerName" : "@HardwareName@",
		"friendlyName" : "@Name@",
		"description" : "@Description@",
}

const COMMON_LEVEL_CAPABILITY = {
			"interface":"Alexa.PercentageController",
			"state":{
				"percentage":"@Level@",
			},
			"command":{
			},
			"supported": [{
	            "name": "percentage",
	            "value" : "@Level@",
	        }],
	        "retrievable": true
		};

const COMMON_PERCENTAGE_CAPABILITY = {
			"interface":"Alexa.PercentageController",
			"state":{
				"percentage":"()=>parseInt('@Data@')",
			},
			"command":{
			},
			"supported": [{
	            "name": "percentage",
	            "value" : "()=>parseInt('@Data@')",
	        }],
	        "retrievable": true
		};

const COMMON_POWER_CONTROLLER_CAPABILITY = {
			"interface":"Alexa.PowerController",
			"state":{
				"powerState":"ON",
			},
			"command":{
			},
			"supported": [{
	            "name": "powerState",
	            "value":"()=> ('@Data@' === 'Off' || '@Data@' === 'Closed') ? 'OFF' : 'ON'",
	        }],
	        "proactivelyReported": true,
	        "retrievable": true
		};

const COMMON_COLOR_CONTROLLER_CAPABILITY = {
			"interface":"Alexa.ColorController",
			"command":{
			},
			"supported": [{
	            "name": "color",
	            "value":"()=>({'hue': @hue@,'saturation': @saturation@, 'brightness': @Level@})",
	        }],
	        "proactivelyReported": true,
	        "retrievable": true
		};

const COMMON_BRIGHT_CONTROLLER_CAPABILITY = {
			"interface":"Alexa.BrightnessController",
			"command":{
			},
			"supported": [{
	            "name": "brightness",
	            "value": "()=>parseInt('@Level@')",
	        }],
	        "proactivelyReported": true,
	        "retrievable": true
		};


const DOMOTICZ_ALEXA_PERCENT_SENSOR = {
	"domoticz_mapping" : {
		"Subtype": "Percentage",
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["LIGHT"],
		"cookie": {
		},
	},
	"capabilities" : [
		COMMON_PERCENTAGE_CAPABILITY
	]
}

const DOMOTICZ_ALEXA_VOLET = {
	"domoticz_mapping" : {
		"Type":"Light/Switch",
		"Subtype": "Switch",
		"Switchtype": "Blinds Percentage"
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["LIGHT"],
		"cookie": {
			/*overrideParams: (requestMethod)=> requestMethod === "TurnOn" ||  requestMethod === "TurnOff"? SET_DEVICE_LVL : null,
			overrideValue : (requestMethod)=> requestMethod === "TurnOn" ? "100" : "0",*/
		},
	},
	"capabilities" : [
		COMMON_LEVEL_CAPABILITY,
		COMMON_POWER_CONTROLLER_CAPABILITY
	]
};

const DOMOTICZ_ALEXA_INVERTED_VOLET = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"Type":"Light/Switch",
		"Subtype": "Switch",
		"Switchtype": "Blinds Percentage Inverted"
	}
};

const DOMOTICZ_ALEXA_BLINDS = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"Subtype" : "Switch",
		"Switchtype" : "Blinds",
	}
};

const DOMOTICZ_ALEXA_YEE_LED = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"Switchtype": "Dimmer"
	},
};

const DOMOTICZ_ALEXA_BLIND_INVERTED_VOLET = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"Switchtype": "Blinds Inverted"
	},
};

const DOMOTICZ_ALEXA_RFY_VOLET = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"Type":"RFY"
	},
};

const DOMOTICZ_ALEXA_ON_OFF = {
	"domoticz_mapping" : {
		"Switchtype": "On/Off"
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["SWITCH"],
		"cookie": {},
	},
	"capabilities" : [
		COMMON_POWER_CONTROLLER_CAPABILITY
	]
};

const DOMOTICZ_ALEXA_PUSH_ON = {
	"domoticz_mapping" : {
		"Switchtype": "Push On Button"
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["SWITCH"],
		"cookie": {},
	},
	"capabilities" : [
		COMMON_POWER_CONTROLLER_CAPABILITY
	]
};

const DOMOTICZ_ALEXA_GROUP = {
	...DOMOTICZ_ALEXA_ON_OFF,
	"domoticz_mapping" : {
		"Type":"Group"
	},
};

const DOMOTICZ_ALEXA_TEMP = {
	"domoticz_mapping" : {
		"Type":"Temp"
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["THERMOSTAT"],
		"cookie": {},
	},
	"capabilities" : [
		{
			"interface":"Alexa.TemperatureSensor",
			"state":{
				"temperature":"@Temp@",
			},
			"command":{
			},
			"supported": [{
	            "name": "temperature",
	            "value":"()=>({value:@Temp@,scale:'CELSIUS'})",
	        }],
	        "proactivelyReported": false,
	        "retrievable": true
		},
		{
              "interface": "Alexa.ThermostatController",
              "supported": [
                  {
                    "name": "targetSetpoint",
	            "value":"()=>({value:@Temp@,scale:'CELSIUS'})"
                  }
                ],
                "proactivelyReported": false,
                "retrievable": true
         }
	],
	"configuration": {
              "supportsScheduling": false,
              "supportedModes": [
                "AUTO"
              ]
    }
};

const DOMOTICZ_ALEXA_THERMOSTAT = {
	"domoticz_mapping" : {
		"Type": "Thermostat"
	},
	"discovery" : DOMOTICZ_ALEXA_TEMP.discovery,
	"capabilities" : [
		{
			"interface":"Alexa.TemperatureSensor",
			"state":{
				"temperature":"@Data@",
			},
			"command":{
			},
			"supported": [{
	            "name": "temperature",
	            "value":"()=>({value:@Data@,scale:'CELSIUS'})",
	        }],
	        "proactivelyReported": false,
	        "retrievable": true
		},
		{
              "interface": "Alexa.ThermostatController",
              "supported": [
                  {
                    "name": "targetSetpoint",
	            	"value":"()=>({value:@SetPoint@,scale:'CELSIUS'})"
                  }
                ],
                "proactivelyReported": false,
                "retrievable": true
         }
	],
};


const DOMOTICZ_ALEXA_TEMP_SPECIFIC = {
	...DOMOTICZ_ALEXA_TEMP,
	"domoticz_mapping" : {
		"Type":"Temp + Humidity"
	},
};

const DOMOTICZ_ALEXA_CONTACT = {
	"domoticz_mapping" : {
		"Type":"General",
		"Subtype": "Alarm"
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["CONTACT_SENSOR"],
		"cookie": {},
	},
	"capabilities" : [
		{
			"interface":"Alexa.ContactSensor",
			"state":{
				"detectionState":"",
			},
			"command":{
			},
			"supported": [{
	            "name": "detectionState",
	            "value":"()=>@Level@>0:'DETECTED':'NOT DETECTED'",
	        }],
	        "proactivelyReported": false,
	        "retrievable": true
		}
	]
};

const DOMOTICZ_ALEXA_SELECTOR_MAPPING = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"Type":"Light/Switch",
		"Subtype": "Selector Switch"
	},
};

const DOMOTICZ_ALEXA_COLOR_LIGHT = {
	"domoticz_mapping" : {
		"Type": "Color Switch"
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["LIGHT"],
		"cookie": {
		},
	},
	"capabilities" : [
		COMMON_BRIGHT_CONTROLLER_CAPABILITY,
		COMMON_COLOR_CONTROLLER_CAPABILITY,
		COMMON_POWER_CONTROLLER_CAPABILITY
	]
}


exports.ALEXAMAPPING = [
							DOMOTICZ_ALEXA_VOLET,
							DOMOTICZ_ALEXA_ON_OFF,
							DOMOTICZ_ALEXA_PUSH_ON,
							DOMOTICZ_ALEXA_TEMP,
							DOMOTICZ_ALEXA_SELECTOR_MAPPING,
							DOMOTICZ_ALEXA_INVERTED_VOLET,
							DOMOTICZ_ALEXA_GROUP,
							DOMOTICZ_ALEXA_RFY_VOLET,
							DOMOTICZ_ALEXA_YEE_LED,
							DOMOTICZ_ALEXA_TEMP_SPECIFIC,
							DOMOTICZ_ALEXA_CONTACT,
							DOMOTICZ_ALEXA_BLIND_INVERTED_VOLET,
							DOMOTICZ_ALEXA_BLINDS,
							DOMOTICZ_ALEXA_THERMOSTAT,
							DOMOTICZ_ALEXA_PERCENT_SENSOR,
							DOMOTICZ_ALEXA_COLOR_LIGHT,
						];

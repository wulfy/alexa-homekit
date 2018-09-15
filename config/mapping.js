const COMMON_DISCOVERY_MAPPING = {
		"endpointId" : "@idx@_@HardwareName@",
		"manufacturerName" : "@HardwareName@",
		"friendlyName" : "@Name@",
		"description" : "@Description@",
}
const DOMOTICZ_ALEXA_VOLET_EXAMPLE = {
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
		{
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
		},
		{
			"interface":"Alexa.PowerController",
			"state":{
				"powerState":"ON",
			},
			"command":{
			},
			"supported": [{
	            "name": "powerState",
	            "value": "()=>@Level@ == 100 ? 'OFF' : 'ON'",
	        }],
	        "proactivelyReported": true,
	        "retrievable": true
		}
	]
};
const DOMOTICZ_ALEXA_PRISE_EXAMPLE = {
	"domoticz_mapping" : {
		"Type":"Light/Switch",
		"Subtype": "Switch",
		"Switchtype": "On/Off"
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["SWITCH"],
		"cookie": {},
	},
	"capabilities" : [
		{
			"interface":"Alexa.PowerController",
			"state":{
				"powerState":"ON",
			},
			"command":{
			},
			"supported": [{
	            "name": "powerState",
	            "value":"()=> '@Status@' === 'On' ? 'ON' : 'OFF'",
	        }],
	        "proactivelyReported": true,
	        "retrievable": true
		}
	]
};

const DOMOTICZ_ALEXA_TEMP_EXAMPLE = {
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


exports.ALEXAMAPPING = [DOMOTICZ_ALEXA_VOLET_EXAMPLE,DOMOTICZ_ALEXA_PRISE_EXAMPLE,DOMOTICZ_ALEXA_TEMP_EXAMPLE];
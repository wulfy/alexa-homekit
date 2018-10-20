const COMMON_DISCOVERY_MAPPING = {
		"endpointId" : "@idx@_@HardwareName@_@SwitchType@",
		"manufacturerName" : "@HardwareName@",
		"friendlyName" : "@Name@",
		"description" : "@Description@",
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
const DOMOTICZ_ALEXA_INVERTED_VOLET = {
	"domoticz_mapping" : {
		"Type":"Light/Switch",
		"Subtype": "Switch",
		"Switchtype": "Blinds Percentage Inverted"
	},
	"discovery" : DOMOTICZ_ALEXA_VOLET.discovery,
	"capabilities" : [
		DOMOTICZ_ALEXA_VOLET.capabilities[0],
		{
    	...DOMOTICZ_ALEXA_VOLET.capabilities[1],
			"supported": [{
	            "name": "powerState",
	            "value": "()=>@Level@ == 100 ? 'ON' : 'OFF'",
	    }],
     }
	]
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

const DOMOTICZ_ALEXA_GROUP = {
	"domoticz_mapping" : {
		"Type":"Group"
	},
	"discovery" : DOMOTICZ_ALEXA_ON_OFF.discovery,
	"capabilities" : DOMOTICZ_ALEXA_ON_OFF.capabilities,
};

const DOMOTICZ_ALEXA_RFY_VOLET = {
	"domoticz_mapping" : {
		"Type":"RFY",
		"Subtype": "RFY",
		"Switchtype": "Blinds"
	},
	"discovery" : DOMOTICZ_ALEXA_ON_OFF.discovery,
	"capabilities" : DOMOTICZ_ALEXA_ON_OFF.capabilities,
};

const DOMOTICZ_ALEXA_YEE_LED = {
	"domoticz_mapping" : {
		"Type":"Color Switch",
		"Subtype": "RGBWW",
		"Switchtype": "Dimmer"
	},
	"discovery" : DOMOTICZ_ALEXA_VOLET.discovery,
	"capabilities" : DOMOTICZ_ALEXA_VOLET.capabilities,
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

const DOMOTICZ_ALEXA_TEMP_SPECIFIC = {
	"domoticz_mapping" : {
		"Type":"Temp + Humidity"
	},
	"discovery" : DOMOTICZ_ALEXA_TEMP.discovery,
	"capabilities" : DOMOTICZ_ALEXA_TEMP.capabilities,
};

const DOMOTICZ_ALEXA_CONTACT_EXAMPLE = {
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
	"domoticz_mapping" : {
		"Type":"Light/Switch",
		"Subtype": "Selector Switch"
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["LIGHT"],
		"cookie": {
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


exports.ALEXAMAPPING = [
							DOMOTICZ_ALEXA_VOLET,
							DOMOTICZ_ALEXA_ON_OFF,
							DOMOTICZ_ALEXA_TEMP,
							DOMOTICZ_ALEXA_SELECTOR_MAPPING,
							DOMOTICZ_ALEXA_INVERTED_VOLET,
							DOMOTICZ_ALEXA_GROUP,
							DOMOTICZ_ALEXA_RFY_VOLET,
							DOMOTICZ_ALEXA_YEE_LED,
							DOMOTICZ_ALEXA_TEMP_SPECIFIC,
							DOMOTICZ_ALEXA_CONTACT_EXAMPLE
						];

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
	            "value":"ON",
	        }],
	        "proactivelyReported": true,
	        "retrievable": true
		}
	]
};

const DOMOTICZ_ALEXA_TEMP_EXAMPLE = {
	"domoticz_mapping" : {
		"Type":"Temp",
		"Subtype": "LaCrosse TX3"
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
                "interface": "Alexa.EndpointHealth",
                "supported": [{
                	"name":"connectivity",
                "value": '()=>({"value": "OK"})'
                }],
            }
	]
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


exports.ALEXAMAPPING = [DOMOTICZ_ALEXA_VOLET_EXAMPLE,DOMOTICZ_ALEXA_PRISE_EXAMPLE,DOMOTICZ_ALEXA_TEMP_EXAMPLE];
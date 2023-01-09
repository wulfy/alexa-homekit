const COMMON_DISCOVERY_MAPPING = {
		"endpointId" : "%idx%_%HardwareName%_%SwitchType%",
		"manufacturerName" : "%HardwareName%",
		"friendlyName" : "%Name%",
		"description" : "%Description%",
}

const COMMON_SCENE_MAPPING_CAPABILITY = {
			"interface":"Alexa.SceneController",
			"version" : "3",
            "supportsDeactivation" : false,
			"state":{
				"status":"%Status%",
			},
			"command":{
			},
			"supported": [],
		};

const FRIENDLY_NAMES = {
	"friendlyNames": [
      {
        "@type": "text",
        "value": {
          "text": "%Name%",
          "locale": "en-US"
        }
      },
      {
        "@type": "text",
        "value": {
          "text": "%Name%",
          "locale": "es-MX"
        }
      },
      {
        "@type": "text",
        "value": {
          "text": "%Name%",
          "locale": "fr-CA"
        }
      }
    ]
}

const COMMON_RANGE_CAPABILITY = {
	  "interface": "Alexa.RangeController",
    "instance": "default",
    "version": "3",
    "capabilityResources": FRIENDLY_NAMES,
    "presets": [
	      {
	        "rangeValue": 1,
	        "presetResources": {
	          ...FRIENDLY_NAMES
	        }
	      },
    ],
	  "properties": {
	        "supported": [
	          {
	            "name": "rangeValue",
	            "value":"()=>parseInt(('%Data%').replace(/[a-z ]/g,''))",
	            "instance": "default"
	          }
	        ],
	        "proactivelyReported": true,
	        "retrievable": true,
	        "nonControllable": true
      }
}

const COMMON_RANGE_HUMIDITY_CAPABILITY = {
	  "interface": "Alexa.RangeController",
    "instance": "default",
    "version": "3",
    "capabilityResources": FRIENDLY_NAMES,
    "presets": [
	      {
	        "rangeValue": 1,
	        "presetResources": {
	          ...FRIENDLY_NAMES
	        }
	      },
    ],
	  "properties": {
        "supported": [
          {
            "name": "rangeValue",
            "value":"()=>parseInt(%Humidity%)",
            "instance": "default"
          }
        ],
        "proactivelyReported": true,
        "retrievable": true,
        "nonControllable": true
    }
}

const COMMON_TOGGLE_CAPABILITY = {
      "type": "AlexaInterface",
      "interface": "Alexa.ToggleController",
      "instance": "default",
      "version": "3",
      "properties": {
	        "supported": [
	          {
	            "name": "toggleState",
	            "value":"%Data%"
	          }
	        ],
	        "proactivelyReported": true,
	        "retrievable": true,
	        "nonControllable": true
	  }
}

const COMMON_LEVEL_CAPABILITY = {
			"interface":"Alexa.PercentageController",
			"state":{
				"percentage":"%Level%",
			},
			"command":{
			},
			"supported": [{
	            "name": "percentage",
	            "value" : "%Level%",
	        }],
	     "retrievable": true
		};

const COMMON_PERCENTAGE_CAPABILITY = {
			"interface":"Alexa.PercentageController",
			"state":{
				"percentage":"()=>parseInt('%Data%')",
			},
			"command":{
			},
			"supported": [{
	            "name": "percentage",
	            "value" : "()=>parseInt('%Data%')",
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
	            "value":"()=> ('%Data%' === 'Off' || '%Data%' === 'Closed') ? ('%ReverseState%' === 'false' ? 'OFF' : 'ON') : ('%ReverseState%' === 'false' ? 'ON' : 'OFF')",
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
	            "value":"()=>({'hue': %hue%,'saturation': (%saturation%/100), 'brightness': (%Level%/100)})",
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
	            "value": "()=>parseInt(%Level%)",
	        }],
	        "proactivelyReported": true,
	        "retrievable": true
		};


const DOMOTICZ_ALEXA_SCENE = {
	"domoticz_mapping" : {
		"Type": "Scene",
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["ACTIVITY_TRIGGER"],
		"cookie": {
			"type":"scene"
		},
	},
	"capabilities" : [
		{
			...COMMON_SCENE_MAPPING_CAPABILITY,
			"supportsDeactivation" : false,
		}
	]
}

const DOMOTICZ_GROUP_SCENE = {
	"domoticz_mapping" : {
		"Type": "Group",
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["ACTIVITY_TRIGGER"],
		"cookie": {
			"type":"scene"
		},
	},
	"capabilities" : [
		{
			...COMMON_SCENE_MAPPING_CAPABILITY,
			"supportsDeactivation" : true,
		}
	]
}

const DOMOTICZ_ALEXA_PERCENT_SENSOR = {
	"domoticz_mapping" : {
		"SubType": "Percentage",
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
		"SubType": "Switch",
		"SwitchType": "Blinds Percentage"
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["LIGHT"],
		"cookie": {
			MaxDimLevel:"%MaxDimLevel%",
			inverted:"%ReversePosition%"
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
		"SubType": "Switch",
		"SwitchType": "Blinds Percentage Inverted"
	}
};

const DOMOTICZ_ALEXA_BLINDS = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"SwitchType" : "Blinds",
	}
};

const DOMOTICZ_ALEXA_BLINDS_STOP = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"SwitchType" : "Blinds + Stop",
	}
};

const DOMOTICZ_ALEXA_DIMMER = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"SwitchType": "Dimmer"
	},
};

const DOMOTICZ_ALEXA_BLIND_INVERTED_VOLET = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"SwitchType": "Blinds Inverted"
	},
};

const DOMOTICZ_ALEXA_RFY_VOLET = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"Type":"RFY"
	},
};

const DOMOTICZ_ALEXA_VENITIAN_EU_VOLET = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"SwitchType":"Venetian Blinds EU"
	},
};

const DOMOTICZ_ALEXA_VENITIAN_US_VOLET = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"SwitchType":"Venetian Blinds US"
	},
};

const DOMOTICZ_ALEXA_ON_OFF = {
	"domoticz_mapping" : {
		"SwitchType": "On/Off"
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
	...DOMOTICZ_ALEXA_ON_OFF,
	"domoticz_mapping" : {
		"SwitchType": "Push On Button"
	}
};

const DOMOTICZ_ALEXA_PUSH_OFF = {
	...DOMOTICZ_ALEXA_ON_OFF,
	"domoticz_mapping" : {
		"SwitchType": "Push Off Button"
	}
};

/*
const DOMOTICZ_ALEXA_GROUP = {
	...DOMOTICZ_ALEXA_ON_OFF,
	"domoticz_mapping" : {
		"Type":"Group"
	},
};*/

const DOMOTICZ_ALEXA_TEMP = {
	"domoticz_mapping" : {
		"Type":"Temp"
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["TEMPERATURE_SENSOR"],
		"cookie": {},
	},
	"capabilities" : [
		{
			"interface":"Alexa.TemperatureSensor",
			"state":{
				"temperature":"%Temp%",
			},
			"command":{
			},
			"supported": [{
	            "name": "temperature",
	            "value":"()=>({value:%Temp%,scale:'CELSIUS'})",
	        }],
	        "proactivelyReported": false,
	        "retrievable": true
		}
	],
};

const DOMOTICZ_ALEXA_THERMOSTAT = {
	"domoticz_mapping" : {
		"Type": "Thermostat"
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
				"temperature":"%Data%",
			},
			"command":{
			},
			"supported": [{
	            "name": "temperature",
	            "value":"()=>({value:%Data%,scale:'CELSIUS'})",
	        }],
	        "proactivelyReported": false,
	        "retrievable": true
		},
		{
              "interface": "Alexa.ThermostatController",
              "supported": [
                  {
                    "name": "targetSetpoint",
	            	"value":"()=>({value:%SetPoint%,scale:'CELSIUS'})"
                  },
                  {
                  	"name": "thermostatMode",
	            	"value":"HEAT"
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


const DOMOTICZ_ALEXA_TEMP_HUMIDITY = {
	...DOMOTICZ_ALEXA_TEMP,
	"domoticz_mapping" : {
		"Type":"Temp + Humidity"
	},
};

const DOMOTICZ_ALEXA_TEMP_HUMIDITY_BARO = {
	...DOMOTICZ_ALEXA_TEMP,
	"domoticz_mapping" : {
		"Type":"Temp + Humidity + Baro"
	},
};

const DOMOTICZ_ALEXA_CONTACT = {
	"domoticz_mapping" : {
		"Type":"General",
		"SubType": "Alarm"
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
	            "value":"()=>%Level%>0?'DETECTED':'NOT_DETECTED'",
	        }],
	        "proactivelyReported": false,
	        "retrievable": true
		},
		{
        	"interface": "Alexa.EndpointHealth",
        	"supported": [{
	            "name": "connectivity",
	            "value": 
			        {
			           "value": "OK"
			        }
	    	}]
    	}
	]
};

const DOMOTICZ_ALEXA_DOOR_CONTACT = {
	"domoticz_mapping" : {
		"SwitchType": "Door Contact"
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
	            "value":"()=>'%Status%'=='Closed'?'NOT_DETECTED':'DETECTED'",
	        }],
	        "proactivelyReported": false,
	        "retrievable": true
		},
		{
        	"interface": "Alexa.EndpointHealth",
        	"supported": [{
	            "name": "connectivity",
	            "value": 
			        {
			           "value": "OK"
			        }
	    	}]
    	}
	]
};

const DOMOTICZ_ALEXA_AC_MAPPING = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"Type":"Light/Switch",
		"SubType": "AC"
	},
};

const DOMOTICZ_ALEXA_SELECTOR_MAPPING = {
	...DOMOTICZ_ALEXA_VOLET,
	"domoticz_mapping" : {
		"Type":"Light/Switch",
		"SubType": "Selector Switch"
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


/* sensors */
const DOMOTICZ_TOGGLE = {
	"domoticz_mapping" : {
		"SubType": "Switch"
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["OTHER"],
		"cookie": {
			MaxDimLevel:"%MaxDimLevel%"
		},
	},
	"capabilities" : [
		COMMON_TOGGLE_CAPABILITY
	]
};

const DOMOTICZ_VOLTAGE_RANGE = {
	"domoticz_mapping" : {
		"SubType": "Voltage"
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["OTHER"]
	},
	"capabilities": [
		{ ...COMMON_RANGE_CAPABILITY,
			"configuration": {
                "supportedRange": {
                  "minimumValue": 1,
                  "maximumValue": 300,
                  "precision": 1
               	}
      }
		}
	]
};

const DOMOTICZ_USAGE_RANGE = {
	"domoticz_mapping" : {
		"Type": "Usage",
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["OTHER"]
	},
	"capabilities": [
		{
			...COMMON_RANGE_CAPABILITY,
			"configuration": {
              "supportedRange": {
                "minimumValue": 1,
                "maximumValue": 1000000,
                "precision": 1
             	}
  		}
		}
	]
};

const DOMOTICZ_LUX_RANGE = {
	"domoticz_mapping" : {
		"Type": "Lux",
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["OTHER"]
	},
	"capabilities": [
		{
			...COMMON_RANGE_CAPABILITY,
			"configuration": {
              "supportedRange": {
                "minimumValue": 1,
                "maximumValue": 255,
                "precision": 1
             	}
  		}
  	}
  ]
};

const DOMOTICZ_AQ_RANGE = {
	"domoticz_mapping" : {
		"SubType": "Air Quality",
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["OTHER"]
	},
	"capabilities": [
		{
			...COMMON_RANGE_CAPABILITY,
			"configuration": {
        "supportedRange": {
          "minimumValue": 1,
          "maximumValue": 1000,
          "precision": 1
       	}
	    }
	  }
	]
};

const DOMOTICZ_NOISE_RANGE = {
	"domoticz_mapping" : {
		"SubType": "Sound Level",
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["OTHER"]
	},
	"capabilities": [
		{
			...COMMON_RANGE_CAPABILITY,
			"configuration": {
        "supportedRange": {
          "minimumValue": 1,
          "maximumValue": 1000,
          "precision": 1
       	}
    	}
    }
	]
};

const DOMOTICZ_UV_RANGE = {
	"domoticz_mapping" : {
		"Type": "UV",
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["OTHER"]
	},
	"capabilities": [
		{
			...COMMON_RANGE_CAPABILITY,
			"configuration": {
              "supportedRange": {
                "minimumValue": 1,
                "maximumValue": 1000,
                "precision": 1
             	}
  		}
  	}
	]
};

const DOMOTICZ_HUMIDITY_RANGE = {
	"domoticz_mapping" : {
		"Type": "Humidity",
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["OTHER"]
	},
	"capabilities": [
		{
			...COMMON_RANGE_HUMIDITY_CAPABILITY,
			"configuration": {
	      "supportedRange": {
	        "minimumValue": 1,
	        "maximumValue": 1000,
	        "precision": 1
	     	}
    	}
    }
	]
};

const DOMOTICZ_CUSTOM_RANGE = {
	"domoticz_mapping" : {
		"SubType": "Custom Sensor",
	},
	"discovery" : {
		...COMMON_DISCOVERY_MAPPING,
		"displayCategories" : ["OTHER"]
	},
	"capabilities": [
		{
			...COMMON_RANGE_CAPABILITY,
			"configuration": {
        "supportedRange": {
          "minimumValue": 1,
          "maximumValue": 1000000,
          "precision": 1
       	}
    	}
    }
	]
};

exports.ALEXAMAPPING = [
							DOMOTICZ_ALEXA_VOLET,
							DOMOTICZ_ALEXA_ON_OFF,
							DOMOTICZ_ALEXA_PUSH_ON,
							DOMOTICZ_ALEXA_PUSH_OFF,
							DOMOTICZ_ALEXA_TEMP,
							DOMOTICZ_ALEXA_SELECTOR_MAPPING,
							DOMOTICZ_ALEXA_INVERTED_VOLET,
							DOMOTICZ_GROUP_SCENE,
							DOMOTICZ_ALEXA_RFY_VOLET,
							DOMOTICZ_ALEXA_TEMP_HUMIDITY,
							DOMOTICZ_ALEXA_TEMP_HUMIDITY_BARO,
							DOMOTICZ_ALEXA_CONTACT,
							DOMOTICZ_ALEXA_DOOR_CONTACT,
							DOMOTICZ_ALEXA_BLIND_INVERTED_VOLET,
							DOMOTICZ_ALEXA_BLINDS,
							DOMOTICZ_ALEXA_BLINDS_STOP,
							DOMOTICZ_ALEXA_THERMOSTAT,
							DOMOTICZ_ALEXA_PERCENT_SENSOR,
							DOMOTICZ_ALEXA_COLOR_LIGHT,
							DOMOTICZ_ALEXA_VENITIAN_EU_VOLET,
							DOMOTICZ_ALEXA_VENITIAN_US_VOLET,
							DOMOTICZ_ALEXA_SCENE,
							DOMOTICZ_ALEXA_AC_MAPPING,
							DOMOTICZ_VOLTAGE_RANGE,
							DOMOTICZ_USAGE_RANGE,
							DOMOTICZ_AQ_RANGE,
							DOMOTICZ_NOISE_RANGE,
							DOMOTICZ_HUMIDITY_RANGE,
							DOMOTICZ_UV_RANGE,
							DOMOTICZ_CUSTOM_RANGE,
							DOMOTICZ_ALEXA_DIMMER,
						];

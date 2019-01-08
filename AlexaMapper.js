const {rgbToHsl} = require('./config/utils');

const escapeSpecialChars = (me) =>   JSON.stringify(""+me);

/**
CLass used to map dmoticz device to Alexa format
**/
class AlexaMapper {

	constructor(alexaMapping){
		this.alexaMapping =  alexaMapping ? alexaMapping : null;
	}

	/*
	*	find and map a domoticz device to his corresponding Alexa format
	*	out => the Alexa template without context 
	* 	@param object domoticsDevice data (exported from json)
    * 	@return object domoticz device mapped to alexa (see mapping.js)
    */
	fromDomoticzDevice(domoticzDevice){
		if(! this.alexaMapping)
			return null;

		let result = null;
		console.log("mapping device --------")

		//search for the right Alexa format based on domoticz type/sybtype/switchtype
		this.alexaMapping.forEach((alexaMap) =>{
	      		const alexaDevice = alexaMap.domoticz_mapping;
				if(	
					(!alexaDevice.Type || alexaDevice.Type === domoticzDevice.Type) &&
					(!alexaDevice.Subtype || alexaDevice.Subtype === domoticzDevice.SubType )&&
					(!alexaDevice.Switchtype|| alexaDevice.Switchtype === domoticzDevice.SwitchType)
				)
				{
			      	console.log("---------mapping----------");
			      	console.log(domoticzDevice);
					result = this.mapAlexaFormatFromDomoticzDevice(domoticzDevice,alexaMap);
					console.log("---------END mapping----------");		
			        return ;
				}
			});
		return result;
	}

	/*
	*	get a Alexa device list from a Domoticz device list
	* 	@param array of domoticsDevice objects (from json)
    * 	@return array of Alexa device objects
    */
	fromDomoticzDevices(domoticzDevices){
		const mappedDevices = [];
		domoticzDevices.forEach( (domoDevice)=>{
	    	const result = this.fromDomoticzDevice(domoDevice);
	    	result ? mappedDevices.push(result) : null;
		});

		return mappedDevices;
	}

	/**
		configure an Alexa device
		Domoticz device json is provided and an array of alexa mapping json 
	 	the function will search the matching mapping and fill the data with domoticz data
	 	Alexa mapping is a "template" with magic words which should be replaced by domoticz data
	 	Fill all the template without context (containing device state)
	 **/
	mapAlexaFormatFromDomoticzDevice(device, alexaFormat) {
		let domoDevice = device;
		if(domoDevice["Color"])
		{
			const RGBcolor = JSON.parse(domoDevice["Color"]);
			const HLScolor = rgbToHsl(RGBcolor.r,RGBcolor.g,RGBcolor.b);
			domoDevice["hue"] = HLScolor[0];
			domoDevice["saturation"] = HLScolor[1];
			domoDevice["brightness"] = HLScolor[2];
		}
		//deep clone alexaFormat
		console.log("-----configure---------")
		let alexaDeviceJson = JSON.stringify(alexaFormat);
		const varRegex = /@[^@#]*@/gm;
		const varToReplace =  alexaDeviceJson.match(varRegex);//get all data to retrieve from Domoticz
		/*console.log(alexaDeviceJson);
		console.log(varToReplace);
		console.log(domoDevice);*/
		//foreach data to replace, get the corresponding value in domoticz
		varToReplace.forEach((toReplace)=>{

			// @level@ => level
			const domoticzVar = toReplace.replace(new RegExp("@", 'g'),"");
			const deviceData = typeof domoDevice[domoticzVar] === 'string' 
								? domoDevice[domoticzVar]
									.replace(/(?:\r\n|\r|\n)/g,'\\n')
									.replace(/"/g,'\\"')
									.replace("\t",'')
								: domoDevice[domoticzVar];
	 		// get the var from tomoticz and replace it in mapping json
			alexaDeviceJson = alexaDeviceJson.replace(toReplace,deviceData);
		});
		const newAlexaDevice =  JSON.parse(alexaDeviceJson);
		//const cleanRegex = new RegExp("(?:(?!^[×Þß÷þø])[-'0-9a-zÀ-ÿ ])", 'gui');
		const cleanRegex = new RegExp("[^-'0-9a-zÀ-ÿ _]", 'gui');
		newAlexaDevice.discovery.friendlyName = newAlexaDevice.discovery.friendlyName.replace(cleanRegex,' ');
	  	newAlexaDevice.discovery.endpointId = newAlexaDevice.discovery.endpointId
	  										.split('_')
	  										.reduce(
	  											(accumulator, currentValue) => (accumulator? accumulator + '_' : '') + currentValue.replace(/[^\w]/gi, '')
	  										);
	  	
	  return newAlexaDevice;

	}

	handleDiscovery(mappedDevices) {
		const discoveryContext = mappedDevices.map((device)=>{
			if(!device) return;

			const capabilitiesHeader = [{
                  "type": "AlexaInterface",
                  "interface": "Alexa",
                  "version": "3"
                }];

			const capabilitiesDetails = device.capabilities.map((capa)=>{
				return {
		                "interface": capa.interface,
		                "version": "3",
		                "type": "AlexaInterface",
		                "properties": {
		                    "supported": capa.supported,
		                     "retrievable": capa.retrievable,
		                     "proactivelyReported": capa.proactivelyReported,
		                }
	             };
			});
			return {
	                ...device.discovery,
	                //add alexa interface version precision in each capabilities list
	                //see alexa doc : https://developer.amazon.com/fr/docs/device-apis/alexa-interface.html#discovery
	                "capabilities": capabilitiesHeader.concat(capabilitiesDetails),
	             }
		});
		const endPoints = {
	            endpoints: discoveryContext,
	        };
		console.log("answer ---------- ");
		console.log(JSON.stringify(endPoints));

	    return endPoints;
	}

	/**
		return alexa mapped device context (taht contains the device state)
	**/
	getAlexaDeviceContextState(domoticzDevice) {
		const alexaDevice = this.fromDomoticzDevice(domoticzDevice);

		if(!alexaDevice)
			return;

		console.log("GET STATE")
		console.log(alexaDevice)
		const properties = [];
		const configuration = alexaDevice.configuration;
		alexaDevice.capabilities.forEach((capability)=>{
		const alexaInterface = capability.interface;
		//TODO remplacer par un reduce
		const alexaSupported = capability.supported.forEach((support)=>{
			const newSupport = support;
			newSupport.value = typeof newSupport.value === "string" && newSupport.value.indexOf("()") >= 0 ? eval(newSupport.value)() : newSupport.value ;
			properties.push({
				      "namespace": alexaInterface,
				      ...newSupport,
				      "timeOfSample": new Date().toISOString(),
				      "uncertaintyInMilliseconds": 500
				    })
			
			});
			return alexaSupported;
		});

		let contextResult = {
	                "properties": properties
	            };

	    configuration ? contextResult.configuration = configuration : null;
	    return contextResult;
	}

	handleSendCommandResponse(contextResult,requestHeader,requestToken,endpointId,isStateReport){
		//build response header based on request header
		let responseHeader = requestHeader;    
		responseHeader.namespace = "Alexa";
		//response is an aswer after a command
		//statereport is an answer after a stateReportRequest
    	responseHeader.name = isStateReport ? "StateReport":"Response";
    	responseHeader.messageId = responseHeader.messageId + "-R";
		const response = {
	        context: contextResult,
	        event: {
	            header: responseHeader,
	            endpoint: {
	                scope: {
	                    type: "BearerToken",
	                    token: requestToken
	                },
	                endpointId: endpointId
	            },
	            payload: {}
	        }
	    };

	    return response;
	}
}

module.exports=AlexaMapper;
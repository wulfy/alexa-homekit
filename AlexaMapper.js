class AlexaMapper {

	constructor(alexaMapping){
		this.alexaMapping =  alexaMapping ? alexaMapping : null;
	}

	fromDomoticzDevice(domoticzDevice){
		if(! this.alexaMapping)
			return null;

		let result = null;
		console.log("mapping device --------")

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

	fromDomoticzDevices(domoticzDevices){
		const mappedDevices = [];
		domoticzDevices.forEach( (domoDevice)=>{
	    	const result = this.fromDomoticzDevice(domoDevice);
	    	result ? mappedDevices.push(result) : null;
		});

		return mappedDevices;
	}

	//configure an Alexa device
	//Domoticz device json is provided and an array of alexa mapping json 
	// the function will search the matching mapping and fill the data with domoticz data
	// Alexa mapping is a "template" with magic words which should be replaced by domoticz data
	mapAlexaFormatFromDomoticzDevice(domoDevice, alexaFormat) {
		//deep clone alexaFormat
		console.log("-----configure---------")
		let alexaDeviceJson = JSON.stringify(alexaFormat);
		const varRegex = /@[^@#]*@/gm;
		const varToReplace =  alexaDeviceJson.match(varRegex);//get all data to retrieve from Domoticz
		console.log(alexaDeviceJson);
		console.log(varToReplace);
		//foreach data to replace, get the corresponding value in domoticz
		varToReplace.forEach((toReplace)=>{
			// @level@ => level
			const domoticzVar = toReplace.replace(new RegExp("@", 'g'),"");
	 		// get the var from tomoticz and replace it in mapping json
			alexaDeviceJson = alexaDeviceJson.replace(toReplace,domoDevice[domoticzVar])
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

	handleGetStateForDomoticzDevice(domoticzDevice) {
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
					newSupport.value = newSupport.value.indexOf("()") >= 0 ? eval(newSupport.value)() : newSupport.value ;
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

	handleSendCommandResponse(){
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
	    console.log("DEBUG: " + responseHeader.namespace + JSON.stringify(response));
	    sendStatsd("calls.answer."+responseHeader.name+":1|c");
	}
}

module.exports=AlexaMapper;
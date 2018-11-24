<<<<<<< HEAD
/**
CLass used to map dmoticz device to Alexa format
**/
=======
>>>>>>> move some code in separated objects
class AlexaMapper {

	constructor(alexaMapping){
		this.alexaMapping =  alexaMapping ? alexaMapping : null;
	}

<<<<<<< HEAD
	/*
		find and map a domoticz device to his corresponding Alexa format
		out => the Alexa template without context 
	* @param object domoticsDevice data (exported from json)
    * @return object domoticz device mapped to alexa (see mapping.js)
    */
=======
>>>>>>> move some code in separated objects
	fromDomoticzDevice(domoticzDevice){
		if(! this.alexaMapping)
			return null;

		let result = null;
		console.log("mapping device --------")

<<<<<<< HEAD
		//search for the right Alexa format based on domoticz type/sybtype/switchtype
=======
>>>>>>> move some code in separated objects
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

<<<<<<< HEAD
	/*
		get a Alexa device list from a Domoticz device list
	* @param array of domoticsDevice objects (from json)
    * @return array of Alexa device objects
    */
=======
>>>>>>> move some code in separated objects
	fromDomoticzDevices(domoticzDevices){
		const mappedDevices = [];
		domoticzDevices.forEach( (domoDevice)=>{
	    	const result = this.fromDomoticzDevice(domoDevice);
	    	result ? mappedDevices.push(result) : null;
		});

		return mappedDevices;
	}

<<<<<<< HEAD
	/**
		configure an Alexa device
		Domoticz device json is provided and an array of alexa mapping json 
	 	the function will search the matching mapping and fill the data with domoticz data
	 	Alexa mapping is a "template" with magic words which should be replaced by domoticz data
	 	Fill all the template without context (containing device state)
	 **/
=======
	//configure an Alexa device
	//Domoticz device json is provided and an array of alexa mapping json 
	// the function will search the matching mapping and fill the data with domoticz data
	// Alexa mapping is a "template" with magic words which should be replaced by domoticz data
>>>>>>> move some code in separated objects
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
<<<<<<< HEAD
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
=======
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
>>>>>>> move some code in separated objects
	             };
			});
			return {
	                ...device.discovery,
<<<<<<< HEAD
	                //add alexa interface version precision in each capabilities list
	                //see alexa doc : https://developer.amazon.com/fr/docs/device-apis/alexa-interface.html#discovery
=======
>>>>>>> move some code in separated objects
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

<<<<<<< HEAD
	/**
		return alexa mapped device context (taht contains the device state)
	**/
	getAlexaDeviceContextState(domoticzDevice) {
=======
	handleGetStateForDomoticzDevice(domoticzDevice) {
>>>>>>> move some code in separated objects
		const alexaDevice = this.fromDomoticzDevice(domoticzDevice);

		if(!alexaDevice)
			return;

		console.log("GET STATE")
		console.log(alexaDevice)
		const properties = [];
		const configuration = alexaDevice.configuration;
		alexaDevice.capabilities.forEach((capability)=>{
<<<<<<< HEAD
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
=======
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
>>>>>>> move some code in separated objects

		let contextResult = {
	                "properties": properties
	            };

	    configuration ? contextResult.configuration = configuration : null;
	    return contextResult;
	}

<<<<<<< HEAD
	handleSendCommandResponse(contextResult,requestHeader,requestToken,endpointId,isStateReport){
		//build response header based on request header
		let responseHeader = requestHeader;    
		responseHeader.namespace = "Alexa";
		//response is an aswer after a command
		//statereport is an answer after a stateReportRequest
    	responseHeader.name = isStateReport ? "StateReport":"Response";
    	responseHeader.messageId = responseHeader.messageId + "-R";

=======
	handleSendCommandResponse(){
>>>>>>> move some code in separated objects
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
<<<<<<< HEAD

	    return response;
=======
	    console.log("DEBUG: " + responseHeader.namespace + JSON.stringify(response));
	    sendStatsd("calls.answer."+responseHeader.name+":1|c");
>>>>>>> move some code in separated objects
	}
}

module.exports=AlexaMapper;
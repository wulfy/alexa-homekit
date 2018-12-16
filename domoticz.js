const {decrypt} = require("./config/security");
const {getUserData} = require("./config/database");
const { LIST_DEVICE_REQUEST, 
		STATE_REQUEST, 
		SET_COMMAND, 
		generate_command
	} = require("./config/domoticzCommands")
const {promiseHttpRequest} = require('./config/httpUtils');
const PROD_MODE = process.env.PROD_MODE === "true";
const {sendStatsd} = require('./config/metrics');

class domoticz {

	constructor(token){
		this.token =  token ? token : null;
	}

	// get Domoticz credentials corresponding to the token
	async getBase(){
		try {
			const user_data = await getUserData(this.token);
			if(!user_data)
				throw "Token Error";
			
			const password = decrypt(user_data.domoticzPassword).slice(1,-1);
			//console.log("after decrypt " + password)
			const { proto, domain } = this.extractDomoticzUrlData(user_data.domoticzHost);
			return `${proto}://${user_data.domoticzLogin}:${password}@${domain}:${user_data.domoticzPort}/json.htm`
		}catch(e){
			throw e.message;
			console.log(e);
		}
	}

	//extract domoticz url data ex: http://my.domoti.cz 
	//to retrieve proto (HTTP/HTTPS) and use correct node http or https lib
	// and domain my.domoti.cz
	extractDomoticzUrlData (request) {
	  let domoticzUrlData = {domain:null,proto:"HTTP"};
	  const result = request.split("//").map((value)=>value.split(":")[0]);
	  console.log(result)
	  if(result.length > 1)
	  {
	      domoticzUrlData.proto = result[0];
	      domoticzUrlData.domain = result[1];
	  }else{
	      domoticzUrlData.domain = result[0];
	  }
 	  return domoticzUrlData;
	}

	//extract domoticz url data ex: http://my.domoti.cz 
	//to retrieve proto (HTTP/HTTPS) and use correct node http or https lib
	// and domain my.domoti.cz
	//request devices using a filter example: &rid=2
	async requestDomoticzWithFilter (filter) {
		if(! this.token)
			return;

		console.log("get devices original");
		const base = await this.getBase();
		const request = base+"?"+LIST_DEVICE_REQUEST + filter;
		console.log("getDevices " + request);
		const devicesJsonList = await promiseHttpRequest(request);
		console.log(devicesJsonList)
		const devicesObjList = JSON.parse(devicesJsonList);
		return devicesObjList.result;
	}

	async getDevice(domoticzDeviceId) {
		const filter = domoticzDeviceId ? "&rid="+domoticzDeviceId:"";
		const deviceList = await this.requestDomoticzWithFilter(filter);
		return deviceList[0];
	}

	async getAllDevices() {
		const deviceList = await this.requestDomoticzWithFilter("");
		return deviceList;
	}

	//send http or https command to a domoticz device
	async sendCommand(deviceSubtype,deviceId,directive,directiveValue){
		const base = await this.getBase();
		let deviceRequest = base + "?" + SET_COMMAND + "&";
		//const params = overrideParams && typeof overrideParams === "function" ? overrideParams(requestMethod) : DEVICE_HANDLER_COMMANDS_PARAMS[requestMethod];
		deviceRequest += generate_command(deviceSubtype,deviceId,directive,directiveValue);

		console.log(deviceRequest);
		try {
			PROD_MODE ? await promiseHttpRequest(deviceRequest) : null ;
			console.log("REQUEST SENT");
			sendStatsd("calls.command."+deviceSubtype+":1|c");

			return deviceRequest;
		}catch(e){
			throw e;
		}

	}

}

module.exports=domoticz;
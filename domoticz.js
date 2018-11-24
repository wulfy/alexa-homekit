const {decrypt} = require("./config/security");
const {getUserData} = require("./config/database");
const { LIST_DEVICE_REQUEST, 
		STATE_REQUEST, 
		SET_COMMAND, 
		device_handler_command
	} = require("./config/domoticzCommands")
const {promiseHttpRequest} = require('./config/httpUtils');

class domoticz {

	constructor(token){
		this.token =  token ? token : null;
	}

	// get Domoticz credentials corresponding to the token
	async  getBase(){
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

	async getDevices (domoticzDeviceId) {
		if(! this.token)
			return;

		console.log("get devices original");
		const deviceFilter = domoticzDeviceId ? "&rid="+domoticzDeviceId:"";
		const base = await this.getBase();
		const request = base+"?"+LIST_DEVICE_REQUEST + deviceFilter;
		console.log("getDevices " + request);
		const devicesJsonList = await promiseHttpRequest(request);
		console.log(devicesJsonList)
		const devicesObjList = JSON.parse(devicesJsonList);
		return devicesObjList.result;
	}

	async sendCommand(deviceSubtype,deviceId,directive,directiveValue){
		const base = await this.getBase();
		let deviceRequest = base + "?" + SET_COMMAND;
		//const params = overrideParams && typeof overrideParams === "function" ? overrideParams(requestMethod) : DEVICE_HANDLER_COMMANDS_PARAMS[requestMethod];
		const paramsMapper =device_handler_command(deviceSubtype)[directive];
		deviceRequest += `&idx=${deviceId}&${paramsMapper["command"]}`;

		if(directiveValue && paramsMapper["value"])
			deviceRequest += `&${paramsMapper["value"]}=${directiveValue}`

		console.log(deviceRequest);
		try {
			PROD_MODE ? await promiseHttpRequest(deviceRequest) : null ;
			console.log("REQUEST SENT");
			sendStatsd("calls.command."+deviceSubtype+":1|c");
			return "ok";
		}catch(e){
			throw e;
		}

	}

}

module.exports=domoticz;
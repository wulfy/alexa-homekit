const {decrypt} = require("./config/security");
const {getUserData} = require("./config/database");
const { LIST_DEVICE_REQUEST,
		LIST_SCENE_REQUEST, 
		STATE_REQUEST, 
		SET_COMMAND, 
		generate_command
	} = require("./config/domoticzCommands");
const {debugLogger, prodLogger} = require('./config/logger.js');
const {promiseHttpRequest} = require('./config/httpUtils');
const PROD_MODE = process.env.PROD_MODE === "true";
const {sendStatsd} = require('./config/metrics');

class domoticz {

	constructor(token){
		this.token =  token ? token : null;
	}

	// get Domoticz credentials corresponding to the token
	async getConnectionConfig(){
		try {
			const user_data = await getUserData(this.token);
			if(!user_data)
				throw "Token Error";
			
			const password = decrypt(user_data.domoticzPassword).slice(1,-1);
			//console.log("after decrypt " + password)
			const { proto, domain } = this.extractDomoticzUrlData(user_data.domoticzHost);
			//return `${proto}://${user_data.domoticzLogin}:${password}@${domain}:${user_data.domoticzPort}/json.htm`
			const basicAuth = 'Basic ' + Buffer.from(`${user_data.domoticzLogin}:${password}`).toString('base64');
			const options = {
				proto: proto,
			    hostname: domain,
			    port: user_data.domoticzPort,
			    path: '/json.htm',
			    method: 'GET',
			    headers: {
			      'Authorization': basicAuth,
			    }
			};
			return options;
		}catch(e){
			throw e.message;
			prodLogger(e);
		}
	}

	//extract domoticz url data ex: http://my.domoti.cz 
	//to retrieve proto (HTTP/HTTPS) and use correct node http or https lib
	// and domain my.domoti.cz
	extractDomoticzUrlData (request) {
	  let domoticzUrlData = {domain:null,proto:"HTTP"};
	  const result = request.split("//").map((value)=>value.split(":")[0]);
	  debugLogger('%j',result)
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
	async requestDomoticzWithFilter (filter,isScene) {
		if(! this.token)
			return;

		prodLogger("get devices original");
		let conConfig = await this.getConnectionConfig();
		conConfig.path += "?" + (isScene ? LIST_SCENE_REQUEST : LIST_DEVICE_REQUEST) + filter;
		debugLogger("getDevices " + conConfig.path);
		const devicesJsonList = await promiseHttpRequest(conConfig);
		debugLogger('%j',devicesJsonList)
		const devicesObjList = JSON.parse(devicesJsonList);
		return devicesObjList.result;
	}

	async getDevice(domoticzDeviceId,isScene) {
		const filter = domoticzDeviceId ? "&rid="+domoticzDeviceId:"";
		const deviceList = await this.requestDomoticzWithFilter(filter,isScene);
		let returnDevice = null;

		deviceList.some(function(device)
		{
			returnDevice = device;

			if(device["idx"]===domoticzDeviceId)
			{
				return null;
			}
		});

		return returnDevice;
	}

	async getAllDevices() {
		const filter ="&filter=all";
		const deviceList = await this.requestDomoticzWithFilter(filter);
		return deviceList;
	}

	//send http or https command to a domoticz device
	async sendCommand(deviceSubtype,deviceId,directive,directiveValue,inverted){
		let conConfig = await this.getConnectionConfig();
		conConfig.path += "?" + SET_COMMAND + "&";
		//const params = overrideParams && typeof overrideParams === "function" ? overrideParams(requestMethod) : DEVICE_HANDLER_COMMANDS_PARAMS[requestMethod];
		conConfig.path += generate_command(deviceSubtype,deviceId,directive,directiveValue,inverted);

		debugLogger('%j',conConfig.path);
		try {
			PROD_MODE ? await promiseHttpRequest(conConfig) : null ;
			prodLogger("REQUEST SENT");
			sendStatsd("calls.command."+deviceSubtype+":1|c");

			return conConfig.path;
		}catch(e){
			throw e;
		}

	}

}

module.exports=domoticz;
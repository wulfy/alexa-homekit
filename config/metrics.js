require('dotenv').config();
const { METRICS_BASE } = require('./constants');

const net = require('net');
const udp = require('dgram');

exports.sendStatsd = (data) => {
	const client = udp.createSocket('udp4');
	const metricData = METRICS_BASE + "." + data;
	client.send(metricData, process.env.METRICS_UDP_PORT, process.env.METRICS_HOST, function(error){
	  if(error){
	    client.close();
	  }else{
	    console.log('Data sent !!!');
	    client.close();
	  }
	});
}

class metricsSocket {
	constructor(port,host) {
		if(! metricsSocket.instance)
		{
			this.port = port;
			this.host = host;
			this._socket = null;
			metricsSocket.instance = this;
		}
	
		return 	metricsSocket.instance;
	}

	isOpened () {
		return this._socket && !this._socket.destroyed;
	}

	close () {
		if(!this.isOpened())
		{
			return;
		}

		this._socket.destroy();
	}

	connect () {
		if(this.isOpened())
		{
			this.close();
		}
		console.log("connecting");

		this._socket = net.createConnection({port:process.env.METRICS_PORT,host:process.env.METRICS_HOST},() => {
		  // 'connect' listener
		  console.log('connected to server!');
		  
		}).once('error', ()=> console.log("error"));
	}

	write(metrics,timestamp){

		if(!this.isOpened())
		{
			this.connect();
		}
		// default timestamp to now
  		timestamp = timestamp || Date.now();
  		timestamp = timestamp/1000;
  		let lines = '';
  		for (let key in metrics) {
		    const value = metrics[key];
		    lines += [key, value, timestamp].join(' ') + " \n";
		}
		console.log("writing " + lines);
		this._socket.write(lines, ()=>this.close());
	}
}

const metrics = new metricsSocket(process.env.METRICS_PORT,process.env.METRICS_HOST);
/*
const instance = new metricsSocket();
Object.freeze(instance);*/

exports.metrics = metrics;
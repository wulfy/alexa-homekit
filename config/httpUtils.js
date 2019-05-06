const http = require('http');
const https = require('https');

//promise to send an HTTP request
exports.promiseHttpRequest =  (options) => {
    const protoLower = options.proto.toLowerCase();
    const httpOrHttps = protoLower.includes("https") ? https : http;

    return new Promise ((resolve, reject) => {
        httpOrHttps.get(options, (resp) => {
          let data = '';
          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });
        
          // The whole response has been received. Print out the result.
          resp.on('end', () => {
            console.log("END PROMISE");
            resolve(data);
          });
        
        }).on('socket', (s) => { 
        	s.setTimeout(2000, () => { 
        		console.log("TIMEOUT")
        		s.destroy(); 
        	})
    	}).on("error", (err) => {
	          console.log("Error: " + err.message);
	          reject(err);
	        })
    })
}
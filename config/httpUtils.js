const http = require('http');
const https = require('https');

//promise to send an HTTP request
exports.promiseHttpRequest =  (request) => {
    const requestLower = request.toLowerCase();
    const httpOrHttps = requestLower.includes("https") ? https : http;
    const escapedRequest = encodeURIComponent(request);

    return new Promise ((resolve, reject) => {
        httpOrHttps.get(escapedRequest, (resp) => {
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
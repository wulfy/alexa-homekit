// This code sample shows how to call and receive external rest service data, within your skill Lambda code.

// var AWS = require('aws-sdk');
const {BASE_REQUEST} = require('./mockups/domoticzMockups');
var https = require('https');
var http = require('http');

function doHttpRequest (request,response) {
    return new Promise ((resolve, reject) => {
        http.get(request, (resp) => {
          let data = '';
        
          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });
        
          // The whole response has been received. Print out the result.
          resp.on('end', () => {
            console.log("END CUSTOM");
            resolve("ok");
          });
        
        }).on("error", (err) => {
          console.log("Error: " + err.message);
        })
    })
}

exports.handler = function( event, context ) {
    
    

    var say = "";
    var shouldEndSession = false;
    var sessionAttributes = {};
    var myState = "";
    var pop = 0;
    var rank = 0;
    var post_data = {"usstate": myState};
    const request = BASE_REQUEST + "?type=command&param=switchlight&idx=2&switchcmd=Set%20Level&level=100"
    
    async function test() {
        let result = await doHttpRequest(request);
        console.log("result " + result);
        
    }
    
    test();
    
};


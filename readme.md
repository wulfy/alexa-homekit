# ALHAU

## Code installation
In lambda : use serverless plugin to package and deploy to lambda 
`npm run package` will do the job. 

In a specific server : `yarn install` then `node index.js`

Don't forget to configure environment based on `.env.dist` file 

## How does it work
This skill is used only to translate Alexa home comands to Domoticz.
This project is not self sufficient to deploy an alexa home skill.
You also need a website (like https://www.alhau.com) and a oauth server to manage tokenized identification

### Process
1) Users create an account on the oauth server and save in their account their domoticz access url and credentials.
2) Users activate the skill in Alexa webapp or Alexa mobile app
3) The app will ask them to connect to the oauth server 
4) If they successfully connect to the oauth server, Alexa will get an access token.
5) Each time a user asks Alexa to do something (discover devices, open/close, etc.), Alexa will use the token to identify to oauth server. If ok, then Alexa will send the command to the skill with the Token.
6) The skill will use the token to retrieve user's domoticz's URL and credentials
7) Then the skill will use domoticz credentials to send an http/https command with http crendentials.

=> The token "handshake" is done only one time when the user connect to the oauth server.
After this action, Alexa will automatically ask for a fresh token when the previous one expires.

=> The way the skill send commands to domoticz is not 100% secure (http credentials)
BUT :
- risks are extremly low (someone has to hack connection between Amazon servers and the user's modem)
- if there is a breach in the user's network, any secured method is potentially vulnerable  

### Oauth server
Alhau is using a custom oauth server (based on oauth2 kit and a node website)
Token are generated using 128bits (extremly secured)
Passwords are saved encrypted and the skill can only decrypt domoticz's password (oauth access can't be retrieve/reverse compute). This decrypt occures only in amazon lambda which can't be accessed from outside (firewall) and it's memory is cleaned after each request.

## Common errors
### Fix decrypt pb
if get error "unsupported-state-or-unable-to-authenticate-data", it's because decrypt is not correctly initialize.
You should use crypto.createDecipher('aes192', CRYPTOPASS); in the function called to force recreate decrypt before each decrypt. 
(don't know why only decrypt is affected and not encrypt)

### Alexa interfaces
Be aware, Alexa documentation is not up to date and Alexa webapp is not working exactly like Alewa mobile app.
If you use an unsupported format of interface or if you send data with unsupported characters, Alexa will ignore the data and do "nothing".

#### Errors
- Using non alphanumeric in ID (only _ is supported)
- Using special chars in name (Alexa documentation says it is supported by the mobile app do not => the device will work but could not be deleted from the mobile app. In this cas you MUST use the webapp to delete the device)
- Using new line and line feed in description
- You MUST use a valide SSL certificate on oauth server so Alexa accept to connect to (let's encrypt is NOT supported)

## Supported devices
Supported interfaces : https://developer.amazon.com/fr/docs/device-apis/list-of-interfaces.html
Data format for each interface : https://developer.amazon.com/fr/docs/device-apis/alexa-property-schemas.html
Discovery format : https://developer.amazon.com/fr/docs/device-apis/alexa-discovery.html
(very usefull to undestand formats)

## Code architecture
- **Index.js** main file used by Alexa to find commands handlers. Handlers are Alexa specific, they get usefull data from Alexa inputs and call the commands by filling needed inputs.
- **domoticzApiHelper**  used to implement commands. This helper is (and should be) Alexa "agnostic". It does not know how Alexa is sending data to it, commands are just getting data needed to do the job.
- **domoticz.js**  Object managing domoticz command and credentials access. It only need a token to retrieve data
- **alexaMapper.js** Object used to map domoticzDevice to corresponding Alexa format. This object is almost the only one to know the alexa format.
- **/config** contains "common" tools like http connexion, metrics access, security tools, database access/requests, and domoticzCommands (should probably moved in domoticz object).
**mapping.js** is the most important file: It define the way domoticzDevice should be mapped to Alexa devices. It use '@' char to define variables (ex: @var@) that will be replaced by domoticz device value.
It also define functions when the device status/value should be compute before beeing sent to Alexa (example: depending on device type/subtype the status answer could be different)
- **/test** Contains tests, tools for testing, mocked requests/results and snapshots
- **package.json** libraries used to develop/deploy the skill
- **serverless.yml** Serverless configuration which define files that should be deploy (tests and dev files should not be deployed on production lambda) 


## Tests

### How data are mocked ?
All tests are using "base_config".
This file include the `index.js` file which export Alexa handlers (to test all the process), `domoticzApiHelper` to access commands implementation and all tools used to test the skill.
To override function which need to send http commands or use credentials (oauth/domoticz access), we use `globals` functions and `PROD_MODE` (which could be defined in env vars or forced in tests).
- to override domoticz connexion, `base_config.js` define a `mockedDomoticz` class which extends the domoticz one and override getDevice/getDevices function to return mocked data (setted when creating a new instance of the class)
- to use **mockedDomoticz** object in the code instead of `domoticz`, we use a global function called **getDomoticzFromToken**. This function return a `domoticz` object from a token. It is defined as globals in index.js AND in base_config.js. Because `base_config.js` declaration is done after including all files declaration, the `base_config` one override any other.


### Automated tests
Can be run with `yarn test` (for automated tests)
Each test based on real life data (client examples) should override `getDomoticzFromToken` global function to define mocked data corresponding to the tested client.
All functions and mocked data should be accessed using `base_config` (to be sure using tools configured by this file and have the same test context).

#### Tests
- **Discovery** (snapshot comparaison from real life examples)
- **SendCommand** (domoticz request comparaison)
- **GetDeviceState** (device context comparaison)

### Manual tests
You can run manual tests by using this command :
`node test/config_tests/manual.js`

this file contains commented examples to do some tests.
Tests using Alexa handlers could use the context object defined in the file to display the result instead of trying to send a success answer to Alexa (only possible on lambda or real server)

#### Mocked test
In `alexaMockups.js` you have request example you can use in alexa command handlers or apiHelper commands.
In `domoticzMockups.js` you have domoticz answers example to "simulate" a device or a group of devices with special characters or subtype (for example)
=> You can use this mode to test discovery response from a domoticz device list (in JSON format. See `domoticzMockups.js`).

#### Test in real condition
you can set `PROD_MOD` to "true" to enable http and database access (but you have to run a database in localhost to test oauth access and be aware commands will send data to devices)
=> This way is used to debug some clients having problems we can't reproduce by mocking data (so we ask them domoticz credentials and fill the oauth connexion with this)

#### Test with logs
` DEBUG=* node test/config_tests/manual.js ` 


## Packaging before sending to lambda
`yarn package` (will pack and zip the project to be deployable on amazon Lambda)

## Other

### Curl request to set % and get state from domoticz

#### set %
curl "http://<login>:<PWD>@<host>:<port>/json.htm?type=command&param=switchlight&idx=2&switchcmd=Set%20Level&level=80"

#### get state
curl "http://<login>:<PWD>@<host>:<port>/json.htm?type=devices&rid=2"

### Oauth documentation
https://developer.amazon.com/fr/docs/account-linking/add-account-linking-logic-smart-home.html
https://www.oauth.com/oauth2-servers/accessing-data/obtaining-an-access-token/
https://www.oauth.com/oauth2-servers/server-side-apps/authorization-code/
https://github.com/oauthjs/node-oauth2-server/blob/e1f741fdad191ee47e7764b80a8403c1ea2804d4/docs/model/spec.rst
https://oauth2.thephpleague.com/authorization-server/auth-code-grant/
https://developer.amazon.com/fr/docs/account-linking/configure-authorization-code-grant.html

#### oauth2 for node
https://www.npmjs.com/package/oauth2-server
The documentation is not enought to make it work. Be sure to use postman and oauth2 documentation to understand how it works.

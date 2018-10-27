# ALHAU

## Code installation
In lambda : do yarn install on your side then zip the project and uzip it in the lambda.
Index.js is ready to use
In a specific server : yarn install then node index.js

Don't forget to configure .env file

## Project overview
This project can handle Alexa request and map response from domoticz instance.
It need to connect to a BDD which contains user informations (such as domoticz domain, port and credentials) and current valide Token for Alexa oauth.
For security reasons user credential are decrypted using a secret key you have to define in .env file

## Common errors
### Fix decrypt pb
if get error "unsupported-state-or-unable-to-authenticate-data", it's because decrypt is not correctly initialize.
You should use crypto.createDecipher('aes192', CRYPTOPASS); in the function called to force recreate decrypt before each decrypt. 
(don't know why only decrypt is affected and not encrypt)

## Tests
run node test/test.js (dans uncomment on of the handle request) for manual tests
yarn test for automated tests

## Package
yarn package (will pack and zip the project to be deployable on amazon Lambda)

### Curl request to set % and get state
#### set %
curl "http://<login>:<PWD>@<host>:<port>/json.htm?type=command&param=switchlight&idx=2&switchcmd=Set%20Level&level=80"

#### get state
curl "http://<login>:<PWD>@<host>:<port>/json.htm?type=devices&rid=2"


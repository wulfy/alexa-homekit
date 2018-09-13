#ALHAU

##Fix decrypt pb
if get error "unsupported-state-or-unable-to-authenticate-data", it's because decrypt is not correctly initialize.
You should use crypto.createDecipher('aes192', CRYPTOPASS); in the function called to force recreate decrypt before each decrypt. 
(don't know why only decrypt is affected and not encrypt)

##Curl request to set % and get state

###set %
curl "http://<login>:<PWD>@<host>:<port>/json.htm?type=command&param=switchlight&idx=2&switchcmd=Set%20Level&level=80"

###get state
curl "http://<login>:<PWD>@<host>:<port>/json.htm?type=devices&rid=2"


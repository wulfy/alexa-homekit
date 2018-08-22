#Curl request to set % and get state

##set %
curl "http://<login>:<PWD>@<host>:<port>/json.htm?type=command&param=switchlight&idx=2&switchcmd=Set%20Level&level=80"

##get state
curl "http://<login>:<PWD>@<host>:<port>/json.htm?type=devices&rid=2"
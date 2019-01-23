const env = require('dotenv').config();

const DOMOTICZ_HOST = process.env.DOMOTICZ_API_HOST;
const DOMOTICZ_PORT = process.env.DOMOTICZ_API_PORT
const DOMOTICZ_LOGIN = process.env.DOMOTICZ_API_LOGIN;
const DOMOTICZ_PASSWORD = process.env.DOMOTICZ_API_PASSWORD;
const BASE_REQUEST = `http://${DOMOTICZ_LOGIN}:${DOMOTICZ_PASSWORD}@${DOMOTICZ_HOST}:${DOMOTICZ_PORT}/json.htm`

exports.BASE_REQUEST = BASE_REQUEST;


exports.DOMOTICZ_STATE_ANSWER = {
   "ActTime" : 1534365591,
   "ServerTime" : "2018-08-15 22:39:51",
   "Sunrise" : "06:41",
   "Sunset" : "20:48",
   "result" : [
      {
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 255,
         "CustomImage" : 0,
         "Data": "Set Level: 84 %",
         "Description" : "Alexa_Name:Volet Salon",
         "Favorite" : 1,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveDimmer" : true,
         "HaveGroupCmd" : true,
         "HaveTimeout" : false,
         "ID" : "00000701",
         "Image" : "Light",
         "IsSubDevice" : false,
         "LastUpdate" : "2018-08-15 21:51:54",
         "Level" : 100,
         "LevelInt" : 100,
         "MaxDimLevel" : 100,
         "Name" : "Volet",
         "Notifications" : "false",
         "PlanID" : "2",
         "PlanIDs" : [ 2 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "Status" : "Set Level: 84 %",
         "StrParam1" : "",
         "StrParam2" : "",
         "SubType" : "Switch",
         "SwitchType" : "Blinds Percentage",
         "SwitchTypeVal" : 13,
         "Timers" : "false",
         "Type" : "Light/Switch",
         "TypeImg" : "blinds",
         "Unit" : 1,
         "Used" : 1,
         "UsedByCamera" : false,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "2"
      }
   ],
   "status" : "OK",
   "title" : "Devices"
};

exports.DOMOTICZ_OBJ_EXAMPLE = [{
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 255,
         "CustomImage" : 0,
         "Data" : "Set Level: 15 %",
         "Description" : "",
         "Favorite" : 1,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveDimmer" : true,
         "HaveGroupCmd" : true,
         "HaveTimeout" : false,
         "ID" : "00000701",
         "Image" : "Light",
         "IsSubDevice" : false,
         "LastUpdate" : "2018-08-14 07:10:27",
         "Level" : 15,
         "LevelInt" : 15,
         "MaxDimLevel" : 100,
         "Name" : "Volet",
         "Notifications" : "false",
         "PlanID" : "2",
         "PlanIDs" : [ 2 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "Status" : "Set Level: 15 %",
         "StrParam1" : "",
         "StrParam2" : "",
         "SubType" : "Switch",
         "SwitchType" : "Blinds Percentage",
         "SwitchTypeVal" : 13,
         "Timers" : "false",
         "Type" : "Light/Switch",
         "TypeImg" : "blinds",
         "Unit" : 1,
         "Used" : 1,
         "UsedByCamera" : false,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "2"
      },{
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 255,
         "CustomImage" : 1,
         "Data" : "On",
         "Description" : "",
         "Favorite" : 1,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveDimmer" : true,
         "HaveGroupCmd" : true,
         "HaveTimeout" : false,
         "ID" : "00000601",
         "Image" : "WallSocket",
         "IsSubDevice" : false,
         "LastUpdate" : "2018-08-11 14:21:38",
         "Level" : 255,
         "LevelInt" : 255,
         "MaxDimLevel" : 100,
         "Name" : "Prise",
         "Notifications" : "false",
         "PlanID" : "2",
         "PlanIDs" : [ 2 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "Status" : "On",
         "StrParam1" : "",
         "StrParam2" : "",
         "SubType" : "Switch",
         "SwitchType" : "On/Off",
         "SwitchTypeVal" : 0,
         "Timers" : "false",
         "Type" : "Light/Switch",
         "TypeImg" : "lightbulb",
         "Unit" : 1,
         "Used" : 1,
         "UsedByCamera" : false,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "1"
}];


exports.DOMOTICZ_GET_DEVICES = JSON.stringify(
{
   "ActTime" : 1539770536,
   "AstrTwilightEnd" : "20:31",
   "AstrTwilightStart" : "06:21",
   "CivTwilightEnd" : "19:22",
   "CivTwilightStart" : "07:30",
   "DayLength" : "10:52",
   "NautTwilightEnd" : "19:57",
   "NautTwilightStart" : "06:55",
   "ServerTime" : "2018-10-17 12:02:16",
   "SunAtSouth" : "13:05",
   "Sunrise" : "08:00",
   "Sunset" : "18:52",
   "app_version" : "4.9700",
   "result" : [
      {
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 255,
         "CustomImage" : 1,
         "Data" : "On",
         "Description" : "",
         "DimmerType" : "none",
         "Favorite" : 1,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveDimmer" : true,
         "HaveGroupCmd" : true,
         "HaveTimeout" : false,
         "ID" : "00000601",
         "Image" : "WallSocket",
         "IsSubDevice" : false,
         "LastUpdate" : "2018-10-09 21:50:09",
         "Level" : 0,
         "LevelInt" : 0,
         "MaxDimLevel" : 100,
         "Name" : "Prise",
         "Notifications" : "false",
         "PlanID" : "2",
         "PlanIDs" : [ 2 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "Status" : "On",
         "StrParam1" : "",
         "StrParam2" : "",
         "SubType" : "Switch",
         "SwitchType" : "On/Off",
         "SwitchTypeVal" : 0,
         "Timers" : "false",
         "Type" : "Light/Switch",
         "TypeImg" : "lightbulb",
         "Unit" : 1,
         "Used" : 1,
         "UsedByCamera" : false,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "1"
      },
      {
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 255,
         "CustomImage" : 0,
         "Data" : "Set Level: 84 %",
         "Description" : "Alexa_Name:Volet Salon",
         "DimmerType" : "none",
         "Favorite" : 1,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveDimmer" : true,
         "HaveGroupCmd" : true,
         "HaveTimeout" : false,
         "ID" : "00000701",
         "Image" : "Light",
         "IsSubDevice" : false,
         "LastUpdate" : "2018-10-17 07:34:46",
         "Level" : 0,
         "LevelInt" : 0,
         "MaxDimLevel" : 100,
         "Name" : "Volet",
         "Notifications" : "false",
         "PlanID" : "2",
         "PlanIDs" : [ 2 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "Status" : "Set Level: 84 %",
         "StrParam1" : "",
         "StrParam2" : "",
         "SubType" : "Switch",
         "SwitchType" : "Blinds Percentage",
         "SwitchTypeVal" : 13,
         "Timers" : "false",
         "Type" : "Light/Switch",
         "TypeImg" : "blinds",
         "Unit" : 1,
         "Used" : 1,
         "UsedByCamera" : false,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "2"
      },
      {
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 255,
         "CustomImage" : 0,
         "Data" : "0.9 Watt",
         "Description" : "",
         "Favorite" : 0,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveTimeout" : false,
         "ID" : "0000604",
         "LastUpdate" : "2018-10-17 11:33:13",
         "Name" : "Prise consommation",
         "Notifications" : "false",
         "PlanID" : "0",
         "PlanIDs" : [ 0 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "SubType" : "Electric",
         "Timers" : "false",
         "Type" : "Usage",
         "TypeImg" : "current",
         "Unit" : 2,
         "Used" : 1,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "5"
      },
      {
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 255,
         "CounterToday" : "0.07 kWh",
         "CustomImage" : 0,
         "Data" : "390.24 kWh",
         "Description" : "",
         "Favorite" : 0,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveTimeout" : false,
         "ID" : "00000601",
         "LastUpdate" : "2018-10-17 11:33:15",
         "Name" : "prise kWh Meter",
         "Notifications" : "false",
         "Options" : "",
         "PlanID" : "0",
         "PlanIDs" : [ 0 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "SubType" : "kWh",
         "SwitchTypeVal" : 0,
         "Timers" : "false",
         "Type" : "General",
         "TypeImg" : "current",
         "Unit" : 1,
         "Usage" : "0.9 Watt",
         "Used" : 1,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "7"
      },
      {
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 255,
         "CustomImage" : 0,
         "Data" : "Set Level: 84 %",
         "Description" : "",
         "DimmerType" : "none",
         "Favorite" : 1,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveDimmer" : true,
         "HaveGroupCmd" : true,
         "HaveTimeout" : false,
         "ID" : "00000800",
         "Image" : "Light",
         "InternalState" : "Closed",
         "IsSubDevice" : false,
         "LastUpdate" : "2018-10-17 07:36:14",
         "Level" : 0,
         "LevelInt" : 0,
         "MaxDimLevel" : 100,
         "Name" : "Porte entrée",
         "Notifications" : "false",
         "PlanID" : "0",
         "PlanIDs" : [ 0 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "Status" : "Set Level: 84 %",
         "StrParam1" : "",
         "StrParam2" : "",
         "SubType" : "Switch",
         "SwitchType" : "Door Contact",
         "SwitchTypeVal" : 11,
         "Timers" : "false",
         "Type" : "Light/Switch",
         "TypeImg" : "door",
         "Unit" : 1,
         "Used" : 1,
         "UsedByCamera" : false,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "15"
      },
      {
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 255,
         "CustomImage" : 0,
         "Data" : "Event: 0x17 (23)",
         "Description" : "",
         "Favorite" : 0,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveTimeout" : false,
         "ID" : "00000834",
         "LastUpdate" : "2018-10-17 07:36:10",
         "Level" : 23,
         "Name" : "Alarm porte",
         "Notifications" : "false",
         "PlanID" : "0",
         "PlanIDs" : [ 0 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "SubType" : "Alarm",
         "Timers" : "false",
         "Type" : "General",
         "TypeImg" : "Alert",
         "Unit" : 6,
         "Used" : 1,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "17"
      },
      {
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 100,
         "CustomImage" : 0,
         "Data" : "Off",
         "Description" : "",
         "DimmerType" : "none",
         "Favorite" : 1,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveDimmer" : true,
         "HaveGroupCmd" : true,
         "HaveTimeout" : false,
         "ID" : "00000900",
         "Image" : "Light",
         "IsSubDevice" : false,
         "LastUpdate" : "2018-10-15 18:39:54",
         "Level" : 0,
         "LevelInt" : 0,
         "MaxDimLevel" : 100,
         "Name" : "Detection mouvement",
         "Notifications" : "false",
         "PlanID" : "0",
         "PlanIDs" : [ 0 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "Status" : "Off",
         "StrParam1" : "",
         "StrParam2" : "",
         "SubType" : "Switch",
         "SwitchType" : "Motion Sensor",
         "SwitchTypeVal" : 8,
         "Timers" : "false",
         "Type" : "Light/Switch",
         "TypeImg" : "motion",
         "Unit" : 1,
         "Used" : 1,
         "UsedByCamera" : false,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "20"
      },
      {
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 100,
         "CustomImage" : 13,
         "Data" : "Off",
         "Description" : "",
         "DimmerType" : "none",
         "Favorite" : 1,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveDimmer" : true,
         "HaveGroupCmd" : true,
         "HaveTimeout" : false,
         "ID" : "00000928",
         "Image" : "Alarm",
         "IsSubDevice" : false,
         "LastUpdate" : "2018-10-14 08:49:01",
         "Level" : 0,
         "LevelInt" : 0,
         "MaxDimLevel" : 100,
         "Name" : "Detection sismique",
         "Notifications" : "false",
         "PlanID" : "0",
         "PlanIDs" : [ 0 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "Status" : "Off",
         "StrParam1" : "",
         "StrParam2" : "",
         "SubType" : "Switch",
         "SwitchType" : "On/Off",
         "SwitchTypeVal" : 0,
         "Timers" : "false",
         "Type" : "Light/Switch",
         "TypeImg" : "lightbulb",
         "Unit" : 1,
         "Used" : 1,
         "UsedByCamera" : false,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "22"
      },
      {
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 100,
         "CustomImage" : 0,
         "Data" : "36 Lux",
         "Description" : "",
         "Favorite" : 1,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveTimeout" : false,
         "ID" : "0000903",
         "LastUpdate" : "2018-10-17 11:49:14",
         "Name" : "Luminosité",
         "Notifications" : "false",
         "PlanID" : "2",
         "PlanIDs" : [ 2 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "SubType" : "Lux",
         "Timers" : "false",
         "Type" : "Lux",
         "TypeImg" : "lux",
         "Unit" : 255,
         "Used" : 1,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "23"
      },
      {
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 100,
         "CustomImage" : 0,
         "Data" : "Event: 0x00 (0)",
         "Description" : "",
         "Favorite" : 0,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveTimeout" : false,
         "ID" : "00000935",
         "LastUpdate" : "2018-10-15 18:39:54",
         "Level" : 0,
         "Name" : "Alarm mouvement",
         "Notifications" : "false",
         "PlanID" : "0",
         "PlanIDs" : [ 0 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "SubType" : "Alarm",
         "Timers" : "false",
         "Type" : "General",
         "TypeImg" : "Alert",
         "Unit" : 7,
         "Used" : 1,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "24"
      },
      {
         "AddjMulti" : 1.0,
         "AddjMulti2" : 1.0,
         "AddjValue" : 0.0,
         "AddjValue2" : 0.0,
         "BatteryLevel" : 100,
         "CustomImage" : 0,
         "Data" : "22.8 C",
         "Description" : "",
         "Favorite" : 1,
         "HardwareID" : 2,
         "HardwareName" : "aeon",
         "HardwareType" : "OpenZWave USB",
         "HardwareTypeVal" : 21,
         "HaveTimeout" : true,
         "ID" : "0901",
         "LastUpdate" : "2018-10-14 19:30:40",
         "Name" : "Temperature",
         "Notifications" : "false",
         "PlanID" : "2",
         "PlanIDs" : [ 2 ],
         "Protected" : false,
         "ShowNotifications" : true,
         "SignalLevel" : "-",
         "SubType" : "LaCrosse TX3",
         "Temp" : 22.800000000000001,
         "Timers" : "false",
         "Type" : "Temp",
         "TypeImg" : "temperature",
         "Unit" : 1,
         "Used" : 1,
         "XOffset" : "0",
         "YOffset" : "0",
         "idx" : "25"
      },
      {
         "AddjMulti": 1,
         "AddjMulti2": 1,
         "AddjValue": 0,
         "AddjValue2": 0,
         "BatteryLevel": 255,
         "Color": '{"b":173,"cw":0,"g":234,"m":3,"r":255,"t":0,"ww":0}',
         "CustomImage": 0,
         "Data": "Set Level",
         "Description": "",
         "DimmerType": "abs",
         "Favorite": 0,
         "HardwareID": 3,
         "HardwareName": "tests",
         "HardwareType": "Dummy (Does nothing, use for virtual switches only)",
         "HardwareTypeVal": 15,
         "HaveDimmer": true,
         "HaveGroupCmd": false,
         "HaveTimeout": false,
         "ID": "00082035",
         "Image": "Light",
         "IsSubDevice": false,
         "LastUpdate": "2019-01-08 10:15:56",
         "Level": 30,
         "LevelInt": 30,
         "MaxDimLevel": 100,
         "Name": "color",
         "Notifications": "false",
         "PlanID": "0",
         "PlanIDs": [
         0
         ],
         "Protected": false,
         "ShowNotifications": true,
         "SignalLevel": "-",
         "Status": "Set Level: 30 %",
         "StrParam1": "",
         "StrParam2": "",
         "SubType": "RGBW",
         "SwitchType": "Dimmer",
         "SwitchTypeVal": 7,
         "Timers": "false",
         "Type": "Color Switch",
         "TypeImg": "dimmer",
         "Unit": 1,
         "Used": 1,
         "UsedByCamera": false,
         "XOffset": "0",
         "YOffset": "0",
         "idx": "35"
         },
         {
         "AddjMulti": 1,
         "AddjMulti2": 1,
         "AddjValue": 0,
         "AddjValue2": 0,
         "BatteryLevel": 255,
         "Color": '{"b":119,"cw":0,"g":152,"m":3,"r":255,"t":0,"ww":0}',
         "CustomImage": 0,
         "Data": "Set Level",
         "Description": "",
         "DimmerType": "abs",
         "Favorite": 0,
         "HardwareID": 3,
         "HardwareName": "tests",
         "HardwareType": "Dummy (Does nothing, use for virtual switches only)",
         "HardwareTypeVal": 15,
         "HaveDimmer": true,
         "HaveGroupCmd": false,
         "HaveTimeout": false,
         "ID": "00082036",
         "Image": "Light",
         "IsSubDevice": false,
         "LastUpdate": "2019-01-08 10:15:03",
         "Level": 10,
         "LevelInt": 10,
         "MaxDimLevel": 100,
         "Name": "color2",
         "Notifications": "false",
         "PlanID": "0",
         "PlanIDs": [
         0
         ],
         "Protected": false,
         "ShowNotifications": true,
         "SignalLevel": "-",
         "Status": "Set Level: 10 %",
         "StrParam1": "",
         "StrParam2": "",
         "SubType": "RGBWZ",
         "SwitchType": "Dimmer",
         "SwitchTypeVal": 7,
         "Timers": "false",
         "Type": "Color Switch",
         "TypeImg": "dimmer",
         "Unit": 1,
         "Used": 1,
         "UsedByCamera": false,
         "XOffset": "0",
         "YOffset": "0",
         "idx": "36"
         },
         {
         "AddjMulti": 1,
         "AddjMulti2": 1,
         "AddjValue": 0,
         "AddjValue2": 0,
         "BatteryLevel": 255,
         "Color": '{"b":255,"cw":0,"g":0,"m":3,"r":144,"t":0,"ww":0}',
         "CustomImage": 0,
         "Data": "Set Level",
         "Description": "",
         "DimmerType": "abs",
         "Favorite": 0,
         "HardwareID": 3,
         "HardwareName": "tests",
         "HardwareType": "Dummy (Does nothing, use for virtual switches only)",
         "HardwareTypeVal": 15,
         "HaveDimmer": true,
         "HaveGroupCmd": false,
         "HaveTimeout": false,
         "ID": "00082037",
         "Image": "Light",
         "IsSubDevice": false,
         "LastUpdate": "2019-01-08 22:01:32",
         "Level": 41,
         "LevelInt": 41,
         "MaxDimLevel": 100,
         "Name": "color 3",
         "Notifications": "false",
         "PlanID": "0",
         "PlanIDs": [
         0
         ],
         "Protected": false,
         "ShowNotifications": true,
         "SignalLevel": "-",
         "Status": "Set Level: 61 %",
         "StrParam1": "",
         "StrParam2": "",
         "SubType": "RGBWW",
         "SwitchType": "Dimmer",
         "SwitchTypeVal": 7,
         "Timers": "false",
         "Type": "Color Switch",
         "TypeImg": "dimmer",
         "Unit": 1,
         "Used": 1,
         "UsedByCamera": false,
         "XOffset": "0",
         "YOffset": "0",
         "idx": "37"
         },
         {
            Data: "Off",
            Description: "",
            Favorite: 0,
            LastUpdate: "2018-04-29 22:29:59",
            Name: "porte",
            PlanID: "",
            PlanIDs: [
            0
            ],
            Protected: false,
            Status: "Off",
            Type: "Scene",
            TypeImg: "scene",
            UsedByCamera: false,
            XOffset: 0,
            YOffset: 0,
            idx: "1"
         },
         {
            Data: "On",
            Description: "",
            Favorite: 1,
            LastUpdate: "2019-01-21 22:50:09",
            Name: "test",
            PlanID: "",
            PlanIDs: [
            0
            ],
            Protected: false,
            Status: "On",
            Type: "Scene",
            TypeImg: "scene",
            UsedByCamera: false,
            XOffset: 0,
            YOffset: 0,
            idx: "2"
         },
   ],
   "status" : "OK",
   "title" : "Devices"
});
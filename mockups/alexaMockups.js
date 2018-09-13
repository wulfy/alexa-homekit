exports.ALEXA_REPORTSTATE_REQUEST_EXAMPLE = (endPointID)=> {
    return {
    "directive": {
      "header": {
        "messageId": "abc-123-def-456",
        "correlationToken": "abcdef-123456",
        "namespace": "Alexa",
        "name": "ReportState",
        "payloadVersion": "3"
      },
      "endpoint": {
        "endpointId": endPointID || "2_aeon",
        "cookie": {},
        "scope":{
              "type":"BearerToken",
              "token":"56bd316702aa979b916b1ad7bba595b50af94f69"
        }
      },
      "payload": {
      }
    }
  }
}


exports.ALEXA_SETPERCENT_REQUEST_EXAMPLE = {
  "directive": {
    "header": {
      "namespace": "Alexa.PercentageController",
      "name": "SetPercentage",
      "payloadVersion": "3",
      "messageId": "1bd5d003-31b9-476f-ad03-71d471922820",
      "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
    },
    "endpoint": {
      "scope": {
        "type": "BearerToken",
        "token": "access-token-from-skill"
      },
      "endpointId": "2_aeon",
      "cookie": {
      overrideParams: (requestMethod)=> requestMethod === "TurnOn" ||  requestMethod === "TurnOff"? SET_DEVICE_LVL : "",
      overrideValue : (requestMethod)=> requestMethod === "TurnOn" ? "100" : "0",
      }
    },
    "payload": {
      "percentage": 92
    }
  }
}

exports.ALEXA_DISCOVERY_REQUEST_EXAMPLE = {
  "directive": {
    "header": {
      "namespace": "Alexa.Discovery",
      "name": "Discover",
      "payloadVersion": "3",
      "messageId": "abc-123-def-456"
    },
    "payload": {
      "scope": {
        "type": "BearerToken",
        "token": "04c6fa43a8c6f62d2df0641c97a0598b938a3470"
      }
    }
  }
}

exports.ALEXA_TURNON_REQUEST = {
  "directive": {
    "header": {
      "namespace": "Alexa.PowerController",
      "name": "TurnOn",
      "payloadVersion": "3",
      "messageId": "a3f0e5e2-d669-4679-9280-60952cf16abd",
      "correlationToken": "AAAAAAAAAQA3kb06Zs4ht1pxHUvBUvoyDAIAAAAAAAC4pVmQxwDoRO8b2q8Fd3mEZUYIn//0qKXQkcU4zcwouVwtccm5Ys+nT20ACvTiW1ShZq49/1HX+jkJxCl/hLLNUitTk4eYZJdFgupCI6tD8DK8VRzMnX7hVWMI2ZOdqpitmdDPGgZweTriroJqYZUdO5nycxuZctGT7XXhEqnn1Zjcvh4w7sCM6XyRjQkBAlNO72n1VwJIPGGaJ1X6XYpRjxS9SS7w7Vk3rbnzM21Z5Wm0CgT72PHfsmtdIceeVRQ+U5ry3cOKjHqkiG2rlerI4mkgZroOX25ggpBtxA5t7OYX4L26088+TjppoxV/bUCv5OncIzH9X67xMrLBxfMtUCbwyF9piujE9TMHmk87tv0GWWm/ho7yVcaxVQvGq1NQbOeUoub2YtfOaSiDVRUA0iSRXMpulcWkN9Uhdt1pGKUG0C7iM48ls7WNJ6CkQJmsJ1GDHP6igfwF/0jE1d3Ny4fREll+3xQDyG7KK518P6Oszv8d+W8hV5zurjPyWsj2HnCWxdJ3ZNWbpX/6M1A9rPLXuzdvy6nHoMLr63UHla+cCUABrtHz63O6dfUBiO86jd+smbgsupiQdEM3xVCdLp3F4p3fMixK0twgz+cuxNq8Yl2A80KciCiwhNl03vOIjkEl7TNdPFx+wkFx8FfeY1jLQfg/MVWO70yVoUF9L7y2g+mbn9YS2FgAQw=="
    },
    "endpoint": {
      "scope": {
        "type": "BearerToken",
        "token": "access-token-from-skill"
      },
      "endpointId": "ludo_volet_demo_id",
      "cookie": {}
    },
    "payload": {}
  }
}

exports.ALEXA_TURNOFF_REQUEST = {
  "directive": {
    "header": {
      "namespace": "Alexa.PowerController",
      "name": "TurnOff",
      "payloadVersion": "3",
      "messageId": "a3f0e5e2-d669-4679-9280-60952cf16abd",
      "correlationToken": "AAAAAAAAAQA3kb06Zs4ht1pxHUvBUvoyDAIAAAAAAAC4pVmQxwDoRO8b2q8Fd3mEZUYIn//0qKXQkcU4zcwouVwtccm5Ys+nT20ACvTiW1ShZq49/1HX+jkJxCl/hLLNUitTk4eYZJdFgupCI6tD8DK8VRzMnX7hVWMI2ZOdqpitmdDPGgZweTriroJqYZUdO5nycxuZctGT7XXhEqnn1Zjcvh4w7sCM6XyRjQkBAlNO72n1VwJIPGGaJ1X6XYpRjxS9SS7w7Vk3rbnzM21Z5Wm0CgT72PHfsmtdIceeVRQ+U5ry3cOKjHqkiG2rlerI4mkgZroOX25ggpBtxA5t7OYX4L26088+TjppoxV/bUCv5OncIzH9X67xMrLBxfMtUCbwyF9piujE9TMHmk87tv0GWWm/ho7yVcaxVQvGq1NQbOeUoub2YtfOaSiDVRUA0iSRXMpulcWkN9Uhdt1pGKUG0C7iM48ls7WNJ6CkQJmsJ1GDHP6igfwF/0jE1d3Ny4fREll+3xQDyG7KK518P6Oszv8d+W8hV5zurjPyWsj2HnCWxdJ3ZNWbpX/6M1A9rPLXuzdvy6nHoMLr63UHla+cCUABrtHz63O6dfUBiO86jd+smbgsupiQdEM3xVCdLp3F4p3fMixK0twgz+cuxNq8Yl2A80KciCiwhNl03vOIjkEl7TNdPFx+wkFx8FfeY1jLQfg/MVWO70yVoUF9L7y2g+mbn9YS2FgAQw=="
    },
    "endpoint": {
      "scope": {
        "type": "BearerToken",
        "token": "access-token-from-skill"
      },
      "endpointId": "ludo_volet_demo_id",
      "cookie": {}
    },
    "payload": {}
  }
}
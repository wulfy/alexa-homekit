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

exports.ALEXA_SETPERCENT_REQUEST_BLINDS_INVERTED = {
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
      "endpointId": "2_aeon_BlindsPercentageInverted",
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

exports.ALEXA_SETPERCENT_REQUEST_BLINDS = {
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
      "endpointId": "2_aeon_BlindsPercentage",
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

exports.ALEXA_SETPERCENT_REQUEST_VENITIAN = {
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
        "token": "5a1e219dd51b607ff9b6434a3df829e3def65080"
      },
      "endpointId": "73_RFXtrx_VenetianBlindsUS",
      "cookie": {
      overrideParams: (requestMethod)=> requestMethod === "TurnOn" ||  requestMethod === "TurnOff"? SET_DEVICE_LVL : "",
      overrideValue : (requestMethod)=> requestMethod === "TurnOn" ? "100" : "0",
      }
    },
    "payload": {
      "percentage": 50
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
        "token": "5a1e219dd51b607ff9b6434a3df829e3def65080"
      }
    }
  }
}

const ALEXA_TURNON_REQUEST = {
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
        "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
      },
      "endpointId": "2_aeon_Switch",
      "cookie": {}
    },
    "payload": {}
  }
}

const ALEXA_TURNOFF_REQUEST = {
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

exports.ALEXA_TURNON_REQUEST = ALEXA_TURNON_REQUEST;
exports.ALEXA_TURNOFF_REQUEST = ALEXA_TURNOFF_REQUEST;

exports.ALEXA_TURNON_REQUEST_BLINDS = {
  "directive": {
      "header":ALEXA_TURNON_REQUEST.directive.header,
      "name":ALEXA_TURNON_REQUEST.directive.payload,
      "endpoint": {
        "scope": {
          "type": "BearerToken",
          "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
        },
        "endpointId": "3_aeon_BlindsPercentage",
        "cookie": {}
      }
  }
}

exports.ALEXA_TURNON_REQUEST_BLINDS_INVERTED = {
    "directive": {
      "header":ALEXA_TURNON_REQUEST.directive.header,
      "name":ALEXA_TURNON_REQUEST.directive.payload,
      "endpoint": {
        "scope": {
          "type": "BearerToken",
          "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
        },
        "endpointId": "4_aeon_BlindsInverted",
        "cookie": {}
      }
    }
}

exports.ALEXA_TURNON_REQUEST_VENITIAN = {
    "directive": {
      "header":ALEXA_TURNON_REQUEST.directive.header,
      "name":ALEXA_TURNON_REQUEST.directive.payload,
      "endpoint": {
        "scope": {
          "type": "BearerToken",
          "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
        },
        "endpointId": "5_RFY_VenetianBlindsUS",
        "cookie": {}
      }
    }
}

exports.ALEXA_TURNON_REQUEST_VENITIAN_EU = {
    "directive": {
      "header":ALEXA_TURNON_REQUEST.directive.header,
      "name":ALEXA_TURNON_REQUEST.directive.payload,
      "endpoint": {
        "scope": {
          "type": "BearerToken",
          "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
        },
        "endpointId": "77_RFY_VenetianBlindsEU",
        "cookie": {}
      }
    }
}

exports.ALEXA_TURNOFF_REQUEST_VENITIAN_EU = {
    "directive": {
      "header":ALEXA_TURNOFF_REQUEST.directive.header,
      "name":ALEXA_TURNOFF_REQUEST.directive.payload,
      "endpoint": {
        "scope": {
          "type": "BearerToken",
          "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
        },
        "endpointId": "77_RFY_VenetianBlindsEU",
        "cookie": {}
      }
    }
}

exports.ALEXA_TURNON_REQUEST_PUSH = {
    "directive": {
      "header":ALEXA_TURNON_REQUEST.directive.header,
      "name":ALEXA_TURNON_REQUEST.directive.payload,
      "endpoint": {
        "scope": {
          "type": "BearerToken",
          "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
        },
        "endpointId": "18_AC_PushOnButton",
        "cookie": {}
      }
    }
}

exports.ALEXA_TURNOFF_REQUEST_PUSH = {
    "directive": {
      "header":ALEXA_TURNOFF_REQUEST.directive.header,
      "name":ALEXA_TURNOFF_REQUEST.directive.payload,
      "endpoint": {
        "scope": {
          "type": "BearerToken",
          "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
        },
        "endpointId": "639_Switch_PushOnButton",
        "cookie": {}
      }
    }
}

exports.ALEXA_SET_TARGET_TEMPERATURE_THERMOSTAT = {
    "directive": {
        "header": {
        "namespace": "Alexa.ThermostatController",
        "name": "SetTargetTemperature",
        "payloadVersion": "3",
        "messageId": "1bd5d003-31b9-476f-ad03-71d471922820",
        "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
      },
      "endpoint": {
        "scope": {
          "type": "BearerToken",
          "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
        },
        "endpointId": "104_rflink_Thermostat",
        "cookie": {}
      },
      "payload": {
        "targetSetpoint": {
          "value": 21.0,
          "scale": "CELSIUS"
        }
      }
    }
}

exports.ALEXA_SET_BRIGHTNESS = {
  "directive": {
    "header": {
      "namespace": "Alexa.BrightnessController",
      "name": "SetBrightness",
      "payloadVersion": "3",
      "messageId": "abc-123-def-456",
      "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
    },
    "endpoint": {
      "scope": {
        "type": "BearerToken",
        "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
      },
      "endpointId": "37_dimmer_light",
      "cookie": {}
    },
    "payload": {
      "brightness": 42
    }
  }
}

exports.ALEXA_SETPERCENT_MAXDIM = {
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
      "endpointId": "1503_AC_DIO",
      "cookie": {
        MaxDimLevel:15
      }
    },
    "payload": {
      "percentage": 73
    }
  }
}

exports.ALEXA_SET_COLOR = {
    "directive": {
        "header": {
            "namespace": "Alexa.ColorController",
            "name": "SetColor",
            "payloadVersion": "3",
            "messageId": "abc-123-def-456",
            "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
        },
        "endpoint": {
            "scope": {
                "type": "BearerToken",
                "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
            },
            "endpointId": "37_dimmer_light",
            "cookie": {}
        },
        "payload": {
            "color": {
                "hue": 350.5,
                "saturation": 0.7138,
                "brightness": 0.6524
            }
        }
    }
}

exports.ALEXA_ACTIVATE_SCENE = {
  "directive": {
    "header": {
      "namespace": "Alexa.SceneController",
      "name": "Activate",
      "messageId": "abc-123-def-456",
      "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg==",
      "payloadVersion": "3"
    },
     "endpoint": {
      "scope": {
        "type": "BearerToken",
        "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
      },
      "endpointId": "1_undefined_undefined"
    },
    "payload": {
    }
  }
}

exports.ALEXA_DEACTIVATE_SCENE = {
  "directive": {
    "header": {
      "namespace": "Alexa.SceneController",
      "name": "Deactivate",
      "messageId": "abc-123-def-456",
      "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg==",
      "payloadVersion": "3"
    },
     "endpoint": {
      "scope": {
        "type": "BearerToken",
        "token": "a4bf269d3fdd181aee9d73a6dfaaaee058471d54"
      },
      "endpointId": "1_undefined_undefined"
    },
    "payload": {
    }
  }
}
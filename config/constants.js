require('dotenv').config()

const PROD_MODE = process.env.PROD_MODE === "true";
const CURRENT_INSTANCE = process.env.INSTANCE_NAME ;//PROD_MODE ? "prod" : "preprod";

exports.DBCONFIG = {
  host     : process.env.MYSQL_ADDON_HOST,
  user     : process.env.MYSQL_ADDON_USER,
  password : process.env.MYSQL_ADDON_PASSWORD,
  port     : process.env.MYSQL_ADDON_PORT,
  database : process.env.MYSQL_ADDON_DB
};

exports.CRYPTOPASS = process.env.CRYPTOPASS;

exports.METRICS_BASE = "lambda.alhau";
exports.METRICS_COMMAND = "command";
exports.METRICS_DISCOVERY = "discovery";
exports.PROD_MODE = PROD_MODE;
exports.CURRENT_INSTANCE = CURRENT_INSTANCE;
exports.METRICS_BASE = "lambda.alhau." + CURRENT_INSTANCE ;
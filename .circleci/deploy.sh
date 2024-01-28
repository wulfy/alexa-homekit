#!/usr/bin/env bash

set -o nounset
set -o errexit


current_build="${DEPLOY_FUNCTION}"

if [ -f package-lock.json ]; then
    npm ci
else
    npm i
fi
zip -r "${current_build}.zip" *.js config node_modules
echo "Checking if function $current_build already exists"
aws lambda list-functions | jq -r --arg CURRENTFUNCTION "$current_build" '.Functions[] | select(.FunctionName==$CURRENTFUNCTION) | .FunctionArn'
echo "Updating function: $current_build"
aws lambda update-function-code --function-name "$current_build" --zip-file fileb://./"${current_build}.zip" --no-publish

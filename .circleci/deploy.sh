#!/usr/bin/env bash

set -o nounset
set -o errexit


current_build="${DEPLOY_FUNCTION}"

if [ -f package-lock.json ]; then
    npm ci
else
    npm i
fi
zip -r "${current_build}.zip '*.js' 'config' 'node_modules'" .
echo "Checking if function $current_build already exists"
functionArn=$(aws lambda list-functions | jq -r --arg CURRENTFUNCTION "$current_build" '.Functions[] | select(.FunctionName==$CURRENTFUNCTION) | .FunctionArn')
if [ -z "$functionArn" ]
then
    echo "Creating function: $current_build"
    functionArn=$(aws lambda create-function --function-name "$current_build" --runtime nodejs14 --role arn:aws:iam::242542229507:user/deploy_access --handler lambdaCtx.handler --zip-file fileb://./"${current_build}.zip" | jq -r '.FunctionArn')
    if [ -z "$functionArn" ]
    then
        echo "Failed to get functionArn"
        exit 1
    fi
fi
echo "Updating function: $current_build"
aws lambda update-function-code --function-name "$current_build" --zip-file fileb://./"${current_build}.zip" --no-publish

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
echo "Sending zip to S3"
aws s3api put-object --bucket alhau --key "deploy/${current_build}.zip" --body "${current_build}.zip"
echo "Updating function: $current_build"
aws lambda update-function-code --function-name "$current_build" --s3-bucket alhau --s3-key "deploy/${current_build}.zip" --region eu-west-1 --no-publish
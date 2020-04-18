#!/bin/sh

set -u

SCRIPT_DIR=$(cd $(dirname $0); pwd)
cd ${SCRIPT_DIR}

ruby ./bin/init.rb --token=${SLACK_ACCESS_TOKEN}
sed -i "s#mongo:27017#${MONGODB_URI}#" ./config.yml
sed -i "s#slack_logger#${MONGODB_DATABASE}#" ./config.yml

set +u

if [ ! -z "${DEFAULT_CHANNEL}" ]; then
    sed -i "s#default_channel: general#default_channel: ${DEFAULT_CHANNEL}#" ./config.yml
fi

if [ ! -z "${ENABLE_PRIVATE_CHANNEL}" ]; then
    sed -i "s#enable_private_channel: true#enable_private_channel: ${ENABLE_PRIVATE_CHANNEL}#" ./config.yml
fi

if [ ! -z "${ENABLE_DIRECT_MESSAGE}" ]; then
    sed -i "s#enable_direct_message: true#enable_direct_message: ${ENABLE_DIRECT_MESSAGE}#" ./config.yml
fi

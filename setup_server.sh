#/bin/env sh

LAUNCH_DIR=${PWD}

cd plugins/api
rm -rf node_modules
npm i
npm link
cd $LAUNCH_DIR

cd plugins/client
rm -rf node_modules
npm i
npm link
cd $LAUNCH_DIR

cd plugins/cors
rm -rf node_modules
npm i
npm link
cd $LAUNCH_DIR

cd plugins/logging
rm -rf node_modules
npm i
npm link
cd $LAUNCH_DIR

cd plugins/security
rm -rf node_modules
npm i
npm link
cd $LAUNCH_DIR

cd plugins/socketio
rm -rf node_modules
npm i
npm link
cd $LAUNCH_DIR

cd server-hapi
rm -rf node_modules
npm i
npm link server-hapi-api
npm link server-hapi-client
npm link server-hapi-cors
npm link server-hapi-logging
npm link server-hapi-socketio
cd $LAUNCH_DIR

cd plugins/api/node_modules
npm link server-hapi-security

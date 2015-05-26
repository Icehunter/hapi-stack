#/bin/env sh

LAUNCH_DIR=${PWD}

cd plugins/api
gulp
cd $LAUNCH_DIR

cd plugins/client
gulp
cd $LAUNCH_DIR

cd plugins/cors
gulp
cd $LAUNCH_DIR

cd plugins/logging
gulp
cd $LAUNCH_DIR

cd plugins/security
gulp
cd $LAUNCH_DIR

cd plugins/socketio
gulp
cd $LAUNCH_DIR

cd server-hapi
gulp

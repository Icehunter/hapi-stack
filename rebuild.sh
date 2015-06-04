#/bin/env sh

LAUNCH_DIR=${PWD}

cd plugins/api
npm rb
cd $LAUNCH_DIR

cd plugins/client
npm rb
cd $LAUNCH_DIR

cd plugins/cors
npm rb
cd $LAUNCH_DIR

cd plugins/logging
npm rb
cd $LAUNCH_DIR

cd plugins/security
npm rb
cd $LAUNCH_DIR

cd plugins/socketio
npm rb
cd $LAUNCH_DIR

cd server-hapi
npm rb

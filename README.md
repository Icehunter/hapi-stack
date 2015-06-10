# hapi-stack
## basic setup:

```
./generate_ssl_cert.sh
cd server-hapi
npm i
gulp
node server.js
```

The above steps setup the following servers:<br>API, Client, SocketIO

If you wish just to run an "X" server per this deployment ensure you have a folder with the desired config and run:

```
gulp replace --env X
```

When you run "node server" it will dynamically pull down the modules/plugins if not already installed and start the service(s).

## out of the box items:
- securable API with public/private keys
- https
- social sign in
- asynchronous logging
- dynamic environment values that can be reloaded
- all things awesome from hapi (web console, dynamic route docs, etc...)

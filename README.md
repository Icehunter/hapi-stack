# hapi-stack
## basic setup:

```
./generate_ssl_cert.sh
./setup_server.sh
./gulpify.sh
cd server-hapi
node server.js
```

## out of the box items:
- securable API with public/private keys
- https
- social sign in
- asynchronous logging
- dynamic environment values that can be reloaded
- all things awesome from hapi (web console, dynamic route docs, etc...)

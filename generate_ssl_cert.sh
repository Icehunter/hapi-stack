#/bin/env sh

rm -rf certificates
mkdir -p certificates
cd certificates

# Create a Certificate Authority
openssl genrsa -des3 -out ca.key -passout pass:password 2048
openssl req -new -subj '/C=US/ST=State/L=City/CN=*.hapi-domain.com' -passin pass:password -key ca.key -out ca.csr
openssl x509 -req -days 365 -passin pass:password -in ca.csr -out ca.crt -signkey ca.key

# Create a API Certificate
openssl genrsa -des3 -out api.key -passout pass:password 2048
openssl req -new -subj '/C=US/ST=State/L=City/CN=hapi-domain.com' -passin pass:password -key api.key -out api.csr

# Remove Passphrases
cp api.key api.key.org
openssl rsa -passin pass:password -in api.key.org -out api.key

# Generate Self-signed Certificate
openssl x509 -req -days 365 -in api.csr -signkey api.key -out api.crt

# Generate Public Key
openssl rsa -in api.key -pubout > api.pub

# Create a Client Certificate
openssl genrsa -des3 -out client.key -passout pass:password 2048
openssl req -new -subj '/C=US/ST=State/L=City/CN=hapi-domain.com' -passin pass:password -key client.key -out client.csr

# Remove Passphrases
cp client.key client.key.org
openssl rsa -passin pass:password -in client.key.org -out client.key

# Generate Self-signed Certificate
openssl x509 -req -days 365 -in client.csr -signkey client.key -out client.crt

# Generate Public Key
openssl rsa -in client.key -pubout > client.pub

# Create a SocketIO Certificate
openssl genrsa -des3 -out socketio.key -passout pass:password 2048
openssl req -new -subj '/C=US/ST=State/L=City/CN=hapi-domain.com' -passin pass:password -key socketio.key -out socketio.csr

# Remove Passphrases
cp socketio.key socketio.key.org
openssl rsa -passin pass:password -in socketio.key.org -out socketio.key

# Generate Self-signed Certificate
openssl x509 -req -days 365 -in socketio.csr -signkey socketio.key -out socketio.crt

# Generate Public Key
openssl rsa -in socketio.key -pubout > socketio.pub

cd ..

#/bin/env sh

mkdir -p certificates
cd certificates

# Create a Certificate Authority
openssl genrsa -des3 -out ca.key -passout pass:password 2048
openssl req -new -subj '/C=US/ST=State/L=City/CN=hapi-domain.com' -passin pass:password -key ca.key -out ca.csr
openssl x509 -req -days 365 -passin pass:password -in ca.csr -out ca.crt -signkey ca.key

# Create a Server Certificate
openssl genrsa -des3 -out server.key -passout pass:password 2048
openssl req -new -subj '/C=US/ST=State/L=City/CN=hapi-domain.com' -passin pass:password -key server.key -out server.csr

# Remove Passphrases
cp server.key server.key.org
openssl rsa -passin pass:password -in server.key.org -out server.key

# Generate Self-signed Certificate
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# Generate Public Key
openssl rsa -in server.key -pubout > server.pub

cd ..

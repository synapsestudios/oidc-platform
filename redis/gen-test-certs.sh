#!/bin/bash

# Copy of the Redis utils gen-test-certs.sh
# Intended for development only
# Source: https://github.com/redis/redis/blob/6.2/utils/gen-test-certs.sh

# Generate some test certificates which are used by the regression test suite:
#
#   redis/tls/ca.{crt,key}          Self signed CA certificate.
#   redis/tls/redis.{crt,key}       A certificate with no key usage/policy restrictions.
#   redis/tls/client.{crt,key}      A certificate restricted for SSL client usage.
#   redis/tls/server.{crt,key}      A certificate restricted fro SSL server usage.
#   redis/tls/redis.dh              DH Params file.

generate_cert() {
    local name=$1
    local cn="$2"
    local opts="$3"

    local keyfile=redis/tls/${name}.key
    local certfile=redis/tls/${name}.crt

    [ -f $keyfile ] || openssl genrsa -out $keyfile 2048
    openssl req \
        -new -sha256 \
        -subj "/O=Redis Test/CN=$cn" \
        -key $keyfile | \
        openssl x509 \
            -req -sha256 \
            -CA redis/tls/ca.crt \
            -CAkey redis/tls/ca.key \
            -CAserial redis/tls/ca.txt \
            -CAcreateserial \
            -days 365 \
            $opts \
            -out $certfile
}

mkdir -p redis/tls
[ -f redis/tls/ca.key ] || openssl genrsa -out redis/tls/ca.key 4096
openssl req \
    -x509 -new -nodes -sha256 \
    -key redis/tls/ca.key \
    -days 3650 \
    -subj '/O=Redis Test/CN=Certificate Authority' \
    -out redis/tls/ca.crt

cat > redis/tls/openssl.cnf <<_END_
[ server_cert ]
keyUsage = digitalSignature, keyEncipherment
nsCertType = server
[ client_cert ]
keyUsage = digitalSignature, keyEncipherment
nsCertType = client
_END_

generate_cert server "Server-only" "-extfile redis/tls/openssl.cnf -extensions server_cert"
generate_cert client "Client-only" "-extfile redis/tls/openssl.cnf -extensions client_cert"
generate_cert redis "redis"

[ -f redis/tls/redis.dh ] || openssl dhparam -out redis/tls/redis.dh 2048
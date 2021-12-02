#!/bin/sh
set -e

redis-server /usr/local/etc/redis/redis.conf --tls-port 6380 --port 6379 \
    --tls-cert-file /usr/local/etc/redis/tls/redis.crt \
    --tls-key-file /usr/local/etc/redis/tls/redis.key \
    --tls-ca-cert-file /usr/local/etc/redis/tls/ca.crt
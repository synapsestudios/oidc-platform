docker run \
  -d \
  --env-file acceptance.env \
  --name api \
  --network host \
  --publish 9000:9000 \
  --publish 9001:9001 \
  $1 $2

# If you curl into nest too soon after starting it will close the connection without sending any packets
# so we have to wait a bit to get past that nest bug
sleep 5
curl --connect-timeout 600 --retry 10 --retry-delay 3 --retry-connrefused --insecure https://sso-client.test:9000/health-check
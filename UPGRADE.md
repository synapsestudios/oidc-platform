# UPGRADE GUIDE

## v1.4.0 -> v2.0.0

- Update your keystore file to contain only the certificates keystore. JSON goes from `{certificates: /*certificates keystore json object*/, integrity: /*integrity keystore json object*/}` to just this `/*certificates keystore json object*/`.

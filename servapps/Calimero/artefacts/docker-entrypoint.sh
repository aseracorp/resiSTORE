#!/bin/sh
# docker-entrypoint.sh

# Replace any environment variable references in server.xml.tmpl.
# (Assumes the image has the full GNU tool set.)
#envsubst <"$CATALINA_BASE/conf/server.xml.tmpl" >"$CATALINA_BASE/conf/server.xml"

# Download default server-config
wget -O /usr/app/docker-entrypoint.sh http://aseracorp.github.io/resiSTORE/servapps/Calimero/artefacts/server-config.xml

#replace values with env-vars from cosmos-installer
sed -i 's/KNX_ADDRESS/'"$KNX_ADDRESS"'/g' server-config.xml

# Run the standard container command.
exec "$@"
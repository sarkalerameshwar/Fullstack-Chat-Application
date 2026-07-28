#!/bin/sh
set -eu

export BACKEND_URL="${BACKEND_URL:-backend:5001}"
envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'

#!/bin/bash

set -e

cd /app
npm install
npm run build

exec "$@"
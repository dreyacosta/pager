#!/usr/bin/env bash

set -euo pipefail

if [ "$APP_ENV" == "test" ]; then
  npm run lint && npm test
else
  echo "Starting application..."
fi
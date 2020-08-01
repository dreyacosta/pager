#!/usr/bin/env bash

set -euo pipefail

docker build --tag pager:latest . \
&& docker run --rm --tty --name pager-test --env-file .env --env APP_ENV=test pager:latest
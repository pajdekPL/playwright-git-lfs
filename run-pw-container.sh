#!/bin/bash

PW_VERSION=$(npm list @playwright/test -A --json | jq -r '.dependencies["@playwright/test"].version')
DOCKER_PW_IMAGE="mcr.microsoft.com/playwright:v${PW_VERSION}-noble"

echo "Starting container..."
docker run --rm \
  --network host \
  --ipc=host \
  -v "$(pwd)":/work/ \
  -w /work/ \
  -it $DOCKER_PW_IMAGE \
  /bin/bash -c "npm install && bash"

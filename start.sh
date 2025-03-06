#!/bin/bash
echo "Running migrations."
node migrations.js
echo "Starting $NODE_ENV server."
if [ "$NODE_ENV" = "development" ]; then
    npm run dev
else
    node server.js
fi
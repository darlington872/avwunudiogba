#!/bin/bash

# Run database migration
echo "Running database migrations..."
npm run db:push

# Start the application
echo "Starting application..."
npm run start
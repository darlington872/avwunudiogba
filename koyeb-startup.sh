#!/bin/bash

# Wait for database to be available (useful when database is starting)
echo "Waiting for database connection..."
for i in {1..30}; do
  if nc -z -w 2 $(echo $DATABASE_URL | sed -E 's/.*@([^:]+):([0-9]+).*/\1 \2/'); then
    echo "Database connection established"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "Database connection timed out"
    exit 1
  fi
  echo "Waiting for database connection... attempt $i/30"
  sleep 2
done

# Run database migration
echo "Running database migrations..."
DATABASE_URL=$DATABASE_URL npm run db:push

# Start the application
echo "Starting application..."
npm run start
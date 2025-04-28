#!/bin/bash

# Create data directory if it doesn't exist
mkdir -p data

# Run test scraping for each letter of the alphabet
for letter in {a..z}; do
  echo "Scraping data for letter: $letter"
  cd server/scripts
  npx tsx scrape-1mg-data.ts --test --letter=$letter
  echo "-------------------------"
done

# Import test data
cd server/scripts
echo "Importing test data..."
npx tsx import-1mg-data.ts --test

echo "Setup complete!"
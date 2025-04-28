#!/bin/bash

# This script updates the medicine database with data from external sources

# Common first letters of medications to import
letters=("a" "b" "c" "d" "e" "f" "g" "h" "i" "j" "k" "l" "m" "n" "o" "p" "q" "r" "s" "t" "u" "v" "w" "x" "y" "z")

# Common medications to ensure we have in the database
common_meds=(
  "paracetamol"
  "amoxicillin"
  "metformin"
  "atorvastatin"
  "omeprazole"
  "ibuprofen"
  "amlodipine"
  "pantoprazole"
  "cefixime"
  "diclofenac"
)

echo "Updating database with common medications..."

# Add each common medication
for med in "${common_meds[@]}"; do
  echo "Updating database with: $med"
  curl -s -X POST "http://localhost:5000/api/external-data/update-database" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$med\", \"limit\": 5}"
done

echo "Database update complete!"
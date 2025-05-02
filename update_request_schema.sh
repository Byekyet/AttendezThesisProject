#!/bin/bash

# Navigate to the project root directory
cd "$(dirname "$0")"

# Create migration directory
mkdir -p prisma/migrations/add_course_to_request

# Apply migration
echo "Applying migrations to database..."
npx prisma migrate resolve --applied add_course_to_request
npx prisma db push

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "Migration completed successfully!" 
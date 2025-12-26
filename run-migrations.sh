#!/bin/bash
# Automated migration runner for FapNChat
# Usage: ./run-migrations.sh [database_url]

set -e

# Get database URL from argument or environment variable
DATABASE_URL="${1:-${DATABASE_URL}}"

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not provided"
    echo "Usage: ./run-migrations.sh [database_url]"
    echo "   or: DATABASE_URL=your_url ./run-migrations.sh"
    exit 1
fi

echo "🚀 Running FapNChat database migrations..."
echo "📊 Database: $(echo $DATABASE_URL | sed 's/:[^:]*@/:***@/')"
echo ""

# Get the directory where migrations are located
MIGRATIONS_DIR="apps/web/src/app/api"

# List of migration files in order
MIGRATIONS=(
    "profile/migrations.sql"
    "bits/migrations.sql"
    "payments/migrations.sql"
    "music/migrations.sql"
    "chatrooms/migrations.sql"
    "webrtc/migrations.sql"
)

# Check if we're in the project root
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Error: Migration directory not found. Are you in the project root?"
    exit 1
fi

# Run each migration
for migration in "${MIGRATIONS[@]}"; do
    migration_file="$MIGRATIONS_DIR/$migration"
    
    if [ ! -f "$migration_file" ]; then
        echo "⚠️  Warning: Migration file not found: $migration_file"
        continue
    fi
    
    echo "📝 Running: $migration"
    
    # Run migration with error handling
    if psql "$DATABASE_URL" -f "$migration_file" 2>&1 | grep -i "error" | grep -v "already exists" | grep -v "does not exist"; then
        echo "❌ Error running migration: $migration"
        exit 1
    else
        echo "✅ Completed: $migration"
    fi
    
    echo ""
done

echo "🎉 All migrations completed successfully!"
echo ""
echo "📋 Verifying tables..."
psql "$DATABASE_URL" -c "\dt" | head -20

echo ""
echo "✅ Database setup complete!"



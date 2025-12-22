#!/bin/bash
# Script to apply Supabase migrations
# This script applies all pending migrations to the Supabase database

set -e

echo "🔄 Applying Supabase migrations..."

# Check if NEXT_PUBLIC_SUPABASE_URL is set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set"
  echo "Please set your Supabase URL in .env.local"
  exit 1
fi

# Apply migrations using psql or Supabase CLI
# Note: This requires Supabase CLI to be installed
# Install with: npm install -g supabase

if command -v supabase &> /dev/null; then
  echo "✅ Supabase CLI found"
  supabase db push
else
  echo "⚠️  Supabase CLI not found"
  echo "Please apply migrations manually through Supabase Dashboard:"
  echo "1. Go to your Supabase project dashboard"
  echo "2. Navigate to SQL Editor"
  echo "3. Copy and paste the contents of supabase/migrations/*.sql"
  echo ""
  echo "Or install Supabase CLI with: npm install -g supabase"
fi

#!/bin/sh
set -e

if [ -n "$DB_URL" ] && echo "$DB_URL" | grep -q '^file:'; then
    DB_FILE=$(echo "$DB_URL" | sed 's/^file://')
    mkdir -p "$(dirname "$DB_FILE")"
    chown 1000:1000 "$(dirname "$DB_FILE")" 2>/dev/null || true
fi

if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running database migrations..."
    bun drizzle-kit push
fi

exec "$@"
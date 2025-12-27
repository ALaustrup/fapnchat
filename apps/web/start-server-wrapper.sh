#!/bin/bash
# WYA!? — Server Start Wrapper
# 
# Purpose: Ensure port is free before starting react-router-serve
# 
# This wrapper script:
# 1. Kills any process using the target port
# 2. Waits for port to be fully released
# 3. Starts react-router-serve
# 4. Ensures clean shutdown

set -e

PORT=${PORT:-4000}
HOST=${HOST:-0.0.0.0}
MAX_WAIT=10

# Function to check if port is in use
check_port() {
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti:${PORT} >/dev/null 2>&1
    elif command -v ss >/dev/null 2>&1; then
        ss -tlnp | grep -q ":${PORT} " 2>/dev/null
    else
        # Fallback: try to bind to port (will fail if in use)
        timeout 1 bash -c "echo > /dev/tcp/${HOST}/${PORT}" 2>/dev/null || return 1
        return 0
    fi
}

# Function to kill process on port
kill_port_process() {
    if command -v lsof >/dev/null 2>&1; then
        local pid=$(lsof -ti:${PORT} 2>/dev/null)
        if [ -n "$pid" ]; then
            echo "Killing process $pid on port ${PORT}..."
            kill -9 $pid 2>/dev/null || true
            return 0
        fi
    elif command -v fuser >/dev/null 2>&1; then
        fuser -k ${PORT}/tcp 2>/dev/null || true
    fi
    return 0
}

# Wait for port to be free
wait_for_port() {
    local count=0
    while check_port && [ $count -lt $MAX_WAIT ]; do
        echo "Port ${PORT} still in use, waiting... ($count/$MAX_WAIT)"
        sleep 1
        count=$((count + 1))
    done
    
    if check_port; then
        echo "Warning: Port ${PORT} may still be in use after ${MAX_WAIT}s wait"
        return 1
    fi
    
    echo "Port ${PORT} is free"
    return 0
}

# Cleanup function
cleanup() {
    echo "Shutting down server..."
    if [ -n "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Main execution
echo "Starting server on ${HOST}:${PORT}..."

# Kill any existing process on the port
kill_port_process

# Wait for port to be free
if ! wait_for_port; then
    echo "Error: Could not free port ${PORT}"
    exit 1
fi

# Additional small delay to ensure port is fully released
sleep 1

# Start react-router-serve
cd "$(dirname "$0")"
exec node node_modules/.bin/react-router-serve build/server/index.js


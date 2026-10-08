#!/usr/bin/env bash

# =====================================================================
# EXPENSIFY — All-In-One Unified Runner
# Starts both the Spring Boot Backend (port 8080) and Next.js Frontend (port 3000)
# =====================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "          🚀 STARTING EXPENSIFY ALL-IN-ONE               "
echo "=========================================================="

# Cleanup handler for when user hits Ctrl+C
cleanup() {
    echo ""
    echo "Shutting down servers..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend
echo "📦 Starting Spring Boot Backend (http://localhost:8080)..."
cd "$DIR/backend"
mvn spring-boot:run -Dspring-boot.run.profiles=dev &
BACKEND_PID=$!

# Wait for backend health check
echo "⏳ Waiting for backend to be ready..."
until curl -s http://localhost:8080/api/health >/dev/null 2>&1; do
    sleep 1
done
echo "✅ Backend is healthy at http://localhost:8080/api/health"

# 2. Start Frontend
echo "💻 Starting Next.js Frontend (http://localhost:3000)..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "  🎉 EXPENSIFY IS FULLY RUNNING!"
echo ""
echo "  🌐 Frontend:  http://localhost:3000"
echo "  🌐 Dashboard: http://localhost:3000/dashboard"
echo "  ⚙️ Backend:   http://localhost:8080"
echo "  🗄️ Database:  http://localhost:8080/h2-console"
echo ""
echo "  Default Demo Credentials:"
echo "  Email:    lakshya@expensify.app"
echo "  Password: password123"
echo "=========================================================="
echo "Press Ctrl+C to stop both servers."

wait

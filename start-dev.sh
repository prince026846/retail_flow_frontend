#!/bin/bash

# Development Startup Script for Retail Flow
# This script starts both frontend and backend servers

echo "🚀 Starting Retail Flow Development Environment..."

# Check if virtual environment exists
if [ ! -d "retailflow-backend/.venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    cd retailflow-backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Start backend server
echo "🔧 Starting backend server..."
cd retailflow-backend
source .venv/bin/activate
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Servers started!"
echo "📊 Backend: http://127.0.0.1:8000"
echo "🌐 Frontend: http://localhost:5173"
echo "📚 API Docs: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Set up trap for Ctrl+C
trap cleanup SIGINT

# Wait for both processes
wait

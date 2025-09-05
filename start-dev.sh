#!/bin/bash
# Local Development Startup Script

echo "🚀 Starting MovieServer Local Development Environment"
echo ""

# Start backend
echo "📡 Starting ASP.NET Core Backend on port 5000..."
cd backend
dotnet run &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start transcoding service
echo "🎬 Starting Transcoding Service on port 5001..."
cd backend
node transcoding-service.js &
TRANSCODING_PID=$!
cd ..

# Wait a moment for transcoding service to start
sleep 3

# Start frontend
echo "⚛️ Starting React Frontend on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo "   Backend: http://localhost:5000"
echo "   Transcoding: http://localhost:5001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to cleanup processes
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID 2>/dev/null
    kill $TRANSCODING_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup INT

# Wait for any process to exit
wait

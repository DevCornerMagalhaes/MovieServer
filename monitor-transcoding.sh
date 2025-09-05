#!/bin/bash
# Transcoding Process Monitor and Cleanup Script
# Usage: ./monitor-transcoding.sh [command]

BASE_URL="http://localhost:5001"

show_help() {
    echo "🎬 Transcoding Process Monitor & Cleanup Tool"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status    - Show service health and active process count"
    echo "  list      - List all active transcoding processes"
    echo "  kill-all  - Kill all active transcoding processes (emergency)"
    echo "  monitor   - Continuously monitor processes (Ctrl+C to stop)"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 list"
    echo "  $0 kill-all"
}

get_health() {
    echo "🏥 Health Check:"
    curl -s "$BASE_URL/health" | python3 -m json.tool 2>/dev/null || curl -s "$BASE_URL/health"
    echo ""
}

list_processes() {
    echo "📋 Active Processes:"
    response=$(curl -s "$BASE_URL/processes")
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    echo ""
    
    count=$(echo "$response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    if [ "$count" = "0" ]; then
        echo "✅ No active transcoding processes"
    else
        echo "⚠️  Found $count active process(es)"
    fi
}

kill_all() {
    echo "🚨 Emergency: Killing all transcoding processes..."
    response=$(curl -s -X POST "$BASE_URL/kill-all")
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    echo ""
}

monitor_processes() {
    echo "👁️  Starting continuous monitoring (Press Ctrl+C to stop)..."
    echo ""
    while true; do
        clear
        echo "🎬 Transcoding Service Monitor - $(date)"
        echo "=================================="
        get_health
        list_processes
        echo "Refreshing in 10 seconds..."
        sleep 10
    done
}

case "$1" in
    "status"|"health")
        get_health
        ;;
    "list"|"processes")
        list_processes
        ;;
    "kill-all"|"emergency")
        kill_all
        ;;
    "monitor"|"watch")
        monitor_processes
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        echo "🎬 Quick Status:"
        get_health
        list_processes
        echo ""
        echo "Use '$0 help' for more commands"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac

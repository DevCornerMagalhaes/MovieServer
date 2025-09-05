# Transcoding Process Monitor and Cleanup Script (PowerShell)
# Usage: .\monitor-transcoding.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = ""
)

$BaseUrl = "http://localhost:5001"

function Show-Help {
    Write-Host "🎬 Transcoding Process Monitor & Cleanup Tool" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\monitor-transcoding.ps1 [command]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor White
    Write-Host "  status    - Show service health and active process count" -ForegroundColor Cyan
    Write-Host "  list      - List all active transcoding processes" -ForegroundColor Cyan
    Write-Host "  kill-all  - Kill all active transcoding processes (emergency)" -ForegroundColor Red
    Write-Host "  monitor   - Continuously monitor processes (Ctrl+C to stop)" -ForegroundColor Cyan
    Write-Host "  help      - Show this help message" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\monitor-transcoding.ps1 status" -ForegroundColor Gray
    Write-Host "  .\monitor-transcoding.ps1 list" -ForegroundColor Gray
    Write-Host "  .\monitor-transcoding.ps1 kill-all" -ForegroundColor Gray
}

function Get-Health {
    Write-Host "🏥 Health Check:" -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get
        $response | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "❌ Failed to connect to transcoding service: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Get-Processes {
    Write-Host "📋 Active Processes:" -ForegroundColor Blue
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/processes" -Method Get
        $response | ConvertTo-Json -Depth 3
        
        if ($response.count -eq 0) {
            Write-Host "✅ No active transcoding processes" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Found $($response.count) active process(es)" -ForegroundColor Yellow
            foreach ($process in $response.processes) {
                Write-Host "   📽️  $($process.fileName) (ID: $($process.id)) - Running for $($process.duration)" -ForegroundColor White
            }
        }
    } catch {
        Write-Host "❌ Failed to get process list: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Kill-AllProcesses {
    Write-Host "🚨 Emergency: Killing all transcoding processes..." -ForegroundColor Red
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/kill-all" -Method Post
        $response | ConvertTo-Json -Depth 3
        Write-Host "✅ Kill command completed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to kill processes: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Start-Monitoring {
    Write-Host "👁️  Starting continuous monitoring (Press Ctrl+C to stop)..." -ForegroundColor Magenta
    Write-Host ""
    
    try {
        while ($true) {
            Clear-Host
            Write-Host "🎬 Transcoding Service Monitor - $(Get-Date)" -ForegroundColor Green
            Write-Host "==================================" -ForegroundColor Green
            Get-Health
            Get-Processes
            Write-Host "Refreshing in 10 seconds..." -ForegroundColor Gray
            Start-Sleep -Seconds 10
        }
    } catch [System.Management.Automation.PipelineStoppedException] {
        Write-Host "`n🛑 Monitoring stopped by user" -ForegroundColor Yellow
    }
}

# Main script logic
switch ($Command.ToLower()) {
    { $_ -in @("status", "health") } {
        Get-Health
        break
    }
    { $_ -in @("list", "processes") } {
        Get-Processes
        break
    }
    { $_ -in @("kill-all", "emergency") } {
        Kill-AllProcesses
        break
    }
    { $_ -in @("monitor", "watch") } {
        Start-Monitoring
        break
    }
    { $_ -in @("help", "--help", "-h") } {
        Show-Help
        break
    }
    "" {
        Write-Host "🎬 Quick Status:" -ForegroundColor Green
        Get-Health
        Get-Processes
        Write-Host "Use '.\monitor-transcoding.ps1 help' for more commands" -ForegroundColor Gray
        break
    }
    default {
        Write-Host "❌ Unknown command: $Command" -ForegroundColor Red
        Write-Host "Use '.\monitor-transcoding.ps1 help' for available commands" -ForegroundColor Yellow
        exit 1
    }
}

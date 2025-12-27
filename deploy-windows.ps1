# WYA!? - Windows Deployment Helper Script
# Purpose: Help deploy to server via SSH from Windows
# Usage: .\deploy-windows.ps1

Write-Host ""
Write-Host "WYA!? - Windows Deployment Helper" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "ubuntu@51.210.209.112"
$SSH_KEY = "$env:USERPROFILE\.ssh\Astra1"
$PROJECT_DIR = "/var/www/fapnchat"

# Check if SSH is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: SSH not found. Please install OpenSSH client." -ForegroundColor Red
    Write-Host "Install via: Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -ForegroundColor Yellow
    exit 1
}

# Check for SSH key
if (-not (Test-Path $SSH_KEY)) {
    Write-Host "ERROR: SSH key not found at: $SSH_KEY" -ForegroundColor Red
    exit 1
}

# Test SSH connection
Write-Host "Testing SSH connection..." -ForegroundColor Blue
$testConnection = ssh -i $SSH_KEY -o ConnectTimeout=5 -o BatchMode=yes $SERVER "echo 'SSH connection successful'" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: SSH connection failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "SSH Error:" -ForegroundColor Yellow
    Write-Host $testConnection -ForegroundColor Red
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "1. Set up SSH key authentication (recommended)" -ForegroundColor Cyan
    Write-Host "2. Use password authentication manually:" -ForegroundColor Cyan
    Write-Host "   ssh $SERVER" -ForegroundColor White
    Write-Host "   cd $PROJECT_DIR" -ForegroundColor White
    Write-Host "   ./deploy-alpha.sh" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "SUCCESS: SSH connection successful!" -ForegroundColor Green
Write-Host ""

# Deploy to server
Write-Host "Deploying to server..." -ForegroundColor Blue
Write-Host ""

$deployCommand = "cd $PROJECT_DIR; ./deploy-alpha.sh"

ssh -i $SSH_KEY $SERVER $deployCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: Deployment completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    Write-Host "Check the output above for details." -ForegroundColor Yellow
    exit 1
}

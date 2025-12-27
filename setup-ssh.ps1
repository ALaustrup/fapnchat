# WYA!? - SSH Setup Helper Script
# Purpose: Help set up SSH key authentication for deployment
# Usage: .\setup-ssh.ps1

Write-Host ""
Write-Host "WYA!? - SSH Setup Helper" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "root@51.210.209.112"
$sshKeyPath = "$env:USERPROFILE\.ssh\id_ed25519"
$sshPubKeyPath = "$env:USERPROFILE\.ssh\id_ed25519.pub"

# Check if SSH key already exists
if (Test-Path $sshKeyPath) {
    Write-Host "SSH key already exists at: $sshKeyPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "To copy your public key to the server, run:" -ForegroundColor Yellow
    Write-Host "  type $sshPubKeyPath | ssh $SERVER `"mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys`"" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or manually:" -ForegroundColor Yellow
    Write-Host "1. Display your public key:" -ForegroundColor Cyan
    Write-Host "   type $sshPubKeyPath" -ForegroundColor White
    Write-Host "2. SSH to server and add it:" -ForegroundColor Cyan
    Write-Host "   ssh $SERVER" -ForegroundColor White
    Write-Host "   mkdir -p ~/.ssh" -ForegroundColor White
    Write-Host "   nano ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host "   (paste your public key, save and exit)" -ForegroundColor White
    Write-Host "   chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host "   chmod 700 ~/.ssh" -ForegroundColor White
    exit 0
}

# Generate SSH key
Write-Host "No SSH key found. Generating new SSH key..." -ForegroundColor Yellow
Write-Host ""

$email = Read-Host "Enter your email (for key identification)"

if ([string]::IsNullOrWhiteSpace($email)) {
    $email = "deploy@fapnchat"
}

Write-Host ""
Write-Host "Generating SSH key (press Enter to accept default location, or enter passphrase if desired)..." -ForegroundColor Cyan

ssh-keygen -t ed25519 -C $email -f $sshKeyPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: SSH key generated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Copy your public key to the server:" -ForegroundColor Cyan
    Write-Host "   type $sshPubKeyPath | ssh $SERVER `"mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys`"" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Or manually copy the public key:" -ForegroundColor Cyan
    Write-Host "   Display key: type $sshPubKeyPath" -ForegroundColor White
    Write-Host "   Then SSH to server and add it to ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Test connection:" -ForegroundColor Cyan
    Write-Host "   ssh $SERVER" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Once SSH works, run deployment:" -ForegroundColor Cyan
    Write-Host "   .\deploy-windows.ps1" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to generate SSH key" -ForegroundColor Red
    exit 1
}


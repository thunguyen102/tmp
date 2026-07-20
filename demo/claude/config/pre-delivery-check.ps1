# Pre-Delivery Validation for Test Plan Documents (PowerShell)
# Auto-runs before finalizing any markdown output for end users
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .claude/config/pre-delivery-check.ps1 -PlanFile "docs/planning/recruitment-test-plan.md"
#
# Exits 0 (ready) or 1 (blocked) for CI/CD

param(
  [Parameter(Mandatory=$true)]
  [string]$PlanFile
)

if (-not (Test-Path $PlanFile)) {
  Write-Host "❌ File not found: $PlanFile" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 PRE-DELIVERY VALIDATION CHECKPOINT" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 File: $PlanFile"
Write-Host ""

# Run validation script (relative path: .claude/config -> .claude/tools)
$claudeDir = Split-Path (Split-Path $MyInvocation.MyCommand.Path)
$scriptPath = Join-Path $claudeDir "tools\validate-test-plan.cjs"
node $scriptPath $PlanFile
$validationResult = $LASTEXITCODE

if ($validationResult -eq 0) {
  Write-Host ""
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
  Write-Host "✅ READY FOR DELIVERY" -ForegroundColor Green
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
  Write-Host ""
  Write-Host "File is validated and ready to deliver to end users." -ForegroundColor Green
  Write-Host "✓ All structural checks passed" -ForegroundColor Green
  Write-Host "✓ All numerical reconciliations correct" -ForegroundColor Green
  Write-Host "✓ Complete and consistent test plan" -ForegroundColor Green
  Write-Host ""
  exit 0
} else {
  Write-Host ""
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
  Write-Host "⛔ DELIVERY BLOCKED" -ForegroundColor Red
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
  Write-Host ""
  Write-Host "Fix validation errors and rerun:" -ForegroundColor Red
  Write-Host "  powershell -ExecutionPolicy Bypass -File .claude/config/pre-delivery-check.ps1 -PlanFile `"$PlanFile`"" -ForegroundColor Red
  Write-Host ""
  exit 1
}

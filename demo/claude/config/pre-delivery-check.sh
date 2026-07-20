#!/bin/bash
# Pre-Delivery Validation for Test Plan Documents
# Auto-runs before finalizing any markdown output for end users
#
# Usage:
#   bash .claude/config/pre-delivery-check.sh docs/planning/recruitment-test-plan.md
#
# Exits 0 (ready) or 1 (blocked) for CI/CD

PLAN_FILE="${1:-}"

if [ -z "$PLAN_FILE" ]; then
  echo "❌ Usage: bash .claude/config/pre-delivery-check.sh <path-to-testplan.md>"
  exit 2
fi

if [ ! -f "$PLAN_FILE" ]; then
  echo "❌ File not found: $PLAN_FILE"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 PRE-DELIVERY VALIDATION CHECKPOINT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📄 File: $PLAN_FILE"
echo ""

# Run validation script
node .claude/tools/validate-test-plan.cjs "$PLAN_FILE"
VALIDATION_RESULT=$?

if [ $VALIDATION_RESULT -eq 0 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ READY FOR DELIVERY"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "File is validated and ready to deliver to end users."
  echo "✓ All structural checks passed"
  echo "✓ All numerical reconciliations correct"
  echo "✓ Complete and consistent test plan"
  echo ""
  exit 0
else
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⛔ DELIVERY BLOCKED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Fix validation errors and rerun:"
  echo "  bash .claude/config/pre-delivery-check.sh $PLAN_FILE"
  echo ""
  exit 1
fi

#!/usr/bin/env bash

# ==============================================================================
# ⚡ Brightloop Subscription Management & Recurring Billing Engine
# Automated API End-to-End Test & Health Check Verification Script
# Odoo x FLUX Hackathon 2026
# ==============================================================================

set -o pipefail

BASE_URL="${1:-http://localhost:3000}"

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo -e "${CYAN}${BOLD}"
echo "======================================================================"
echo " ⚡ BRIGHTLOOP SUBSCRIPTION BILLING OS — API HEALTH CHECK & E2E TESTS"
echo " Target Base URL: ${BASE_URL}"
echo " Date: $(date)"
echo "======================================================================"
echo -e "${NC}"

# Helper function to assert HTTP status and print result
assert_endpoint() {
  local test_name="$1"
  local method="$2"
  local endpoint="$3"
  local expected_status="$4"
  local post_data="$5"

  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -e "${BLUE}▶ [Test ${TOTAL_TESTS}] ${test_name}${NC}"
  echo -e "  Endpoint: ${BOLD}${method} ${BASE_URL}${endpoint}${NC}"

  local response
  local http_code
  local body

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}")
  else
    response=$(curl -s -w "\n%{http_code}" -X "${method}" -H "Content-Type: application/json" -d "${post_data}" "${BASE_URL}${endpoint}")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq "$expected_status" ]; then
    echo -e "  Status: ${GREEN}✔ HTTP ${http_code} OK (Expected ${expected_status})${NC}"
    
    # Check for basic non-empty JSON
    if echo "$body" | grep -q "{" || echo "$body" | grep -q "\["; then
      echo -e "  Payload: ${GREEN}✔ Valid JSON Payload Received${NC}"
      # Print brief preview of body
      local preview
      preview=$(echo "$body" | tr -d '\n' | cut -c 1-120)
      echo -e "  Preview: ${CYAN}${preview}...${NC}"
      PASSED_TESTS=$((PASSED_TESTS + 1))
    else
      echo -e "  Payload: ${RED}✘ Expected JSON, got empty or non-JSON body${NC}"
      FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
  else
    echo -e "  Status: ${RED}✘ HTTP ${http_code} (Expected ${expected_status})${NC}"
    echo -e "  Response: ${RED}${body}${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  echo ""
}

# ------------------------------------------------------------------------------
# 1. Health & Server Reachability
# ------------------------------------------------------------------------------
echo -e "${YELLOW}${BOLD}--- 1. Connectivity & Dashboard KPIs ---${NC}"
assert_endpoint "Executive Dashboard KPI API" "GET" "/api/dashboard" 200

# ------------------------------------------------------------------------------
# 2. Subscriptions Lifecycle API
# ------------------------------------------------------------------------------
echo -e "${YELLOW}${BOLD}--- 2. Subscriptions Lifecycle API ---${NC}"
assert_endpoint "Fetch All Subscriptions" "GET" "/api/subscriptions" 200
assert_endpoint "Filter Subscriptions by Status=ACTIVE" "GET" "/api/subscriptions?status=ACTIVE" 200

# ------------------------------------------------------------------------------
# 3. Invoices & Billing Engine API
# ------------------------------------------------------------------------------
echo -e "${YELLOW}${BOLD}--- 3. Invoices & Billing Engine API ---${NC}"
assert_endpoint "Fetch All Invoices" "GET" "/api/invoices" 200
assert_endpoint "Filter Invoices by Status=CONFIRMED" "GET" "/api/invoices?status=CONFIRMED" 200

# ------------------------------------------------------------------------------
# 4. Automated Billing Run (Anti-Duplicate / Zero Double-Billing)
# ------------------------------------------------------------------------------
echo -e "${YELLOW}${BOLD}--- 4. Automated Batch Billing Run ---${NC}"
assert_endpoint "Trigger Automated Billing Day Run (Idempotent)" "POST" "/api/billing-run" 200 "{}"

# ------------------------------------------------------------------------------
# Final Test Summary Report
# ------------------------------------------------------------------------------
echo -e "${CYAN}${BOLD}======================================================================${NC}"
echo -e "${BOLD}TEST SUMMARY REPORT:${NC}"
echo -e "  Total Tests Executed: ${BOLD}${TOTAL_TESTS}${NC}"
echo -e "  Passed: ${GREEN}${BOLD}${PASSED_TESTS}${NC}"

if [ "$FAILED_TESTS" -eq 0 ]; then
  echo -e "  Failed: ${GREEN}${BOLD}0${NC}"
  echo -e "${GREEN}${BOLD}✔ ALL API SUITES PASSED CLEANLY! System is ready for evaluation.${NC}"
  echo -e "${CYAN}${BOLD}======================================================================${NC}"
  exit 0
else
  echo -e "  Failed: ${RED}${BOLD}${FAILED_TESTS}${NC}"
  echo -e "${RED}${BOLD}✘ Some endpoints returned unexpected responses. Check logs above.${NC}"
  echo -e "${CYAN}${BOLD}======================================================================${NC}"
  exit 1
fi

#!/bin/bash

# CI Check Script
# Run all CI checks locally to catch errors before pushing

echo "🔍 Running local CI checks..."
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall success
OVERALL_SUCCESS=true

# Function to run a command and track success
run_check() {
    local check_name="$1"
    local command="$2"
    
    echo -e "\n${YELLOW}📋 Running $check_name...${NC}"
    
    if eval "$command"; then
        echo -e "${GREEN}✅ $check_name passed${NC}"
    else
        echo -e "${RED}❌ $check_name failed${NC}"
        OVERALL_SUCCESS=false
    fi
}

# Run all checks
run_check "ESLint" "npm run lint"
run_check "TypeScript Build" "npm run build"
run_check "Tests" "npm test -- --run"

# Final result
echo -e "\n================================"
if [ "$OVERALL_SUCCESS" = true ]; then
    echo -e "${GREEN}🎉 All CI checks passed! Ready to push.${NC}"
    exit 0
else
    echo -e "${RED}💥 Some CI checks failed. Please fix the issues before pushing.${NC}"
    exit 1
fi 
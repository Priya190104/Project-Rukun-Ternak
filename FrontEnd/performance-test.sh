#!/bin/bash

###############################################################################
# Performance Testing Suite for Rukun Ternak Project
# 
# Usage: bash performance-test.sh
# 
# This script performs comprehensive performance testing including:
# - Bundle size analysis
# - Code split verification
# - Cache configuration check
# - Image optimization verification
###############################################################################

set -e

echo "=========================================="
echo "Rukun Ternak Performance Testing Suite"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper function to print test result
test_result() {
    local test_name=$1
    local result=$2
    local expected=$3
    local actual=$4
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        if [ ! -z "$expected" ]; then
            echo "  Expected: $expected"
            echo "  Actual: $actual"
        fi
    else
        echo -e "${RED}✗${NC} $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        if [ ! -z "$expected" ]; then
            echo "  Expected: $expected"
            echo "  Actual: $actual"
        fi
    fi
    echo ""
}

###############################################################################
# Test 1: Check if build directory exists
###############################################################################
echo -e "${BLUE}Test 1: Build Directory Check${NC}"

if [ -d "build" ]; then
    test_result "Build directory exists" "PASS"
else
    echo "Build directory not found. Building now..."
    npm run build > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        test_result "Build process successful" "PASS"
    else
        test_result "Build process successful" "FAIL"
    fi
fi

###############################################################################
# Test 2: Bundle Size Analysis
###############################################################################
echo -e "${BLUE}Test 2: Bundle Size Analysis${NC}"

MAIN_JS=$(find build/static/js -name "main.*.js" -exec ls -lh {} \; | awk '{print $5}' 2>/dev/null | head -1)
if [ ! -z "$MAIN_JS" ]; then
    echo "Main bundle size: $MAIN_JS"
    
    # Check if main.js is less than 300KB (compressed is usually 1/3 of uncompressed)
    SIZE_NUM=$(echo $MAIN_JS | sed 's/[^0-9]//g')
    if [ "$SIZE_NUM" -lt 300 ]; then
        test_result "Main bundle size optimized" "PASS" "< 300KB" "$MAIN_JS"
    else
        test_result "Main bundle size optimized" "FAIL" "< 300KB" "$MAIN_JS"
    fi
fi

# Count total JS chunks
JS_FILES=$(find build/static/js -name "*.js" 2>/dev/null | wc -l)
if [ "$JS_FILES" -gt 1 ]; then
    test_result "Code splitting implemented (multiple chunks)" "PASS" "> 1 chunk" "$JS_FILES files"
else
    test_result "Code splitting implemented (multiple chunks)" "FAIL" "> 1 chunk" "$JS_FILES files"
fi

# Total build size
BUILD_SIZE=$(du -sh build 2>/dev/null | awk '{print $1}')
echo "Total build size: $BUILD_SIZE"

###############################################################################
# Test 3: Caching Implementation Check
###############################################################################
echo -e "${BLUE}Test 3: Caching Implementation Check${NC}"

# Check if useApiCache hook exists
if grep -r "useApiCache" src/ > /dev/null 2>&1; then
    test_result "useApiCache hook implemented" "PASS"
else
    test_result "useApiCache hook implemented" "FAIL"
fi

# Check if useCachedData hook exists
if grep -r "useCachedData" src/ > /dev/null 2>&1; then
    test_result "useCachedData hook implemented" "PASS"
else
    test_result "useCachedData hook implemented" "FAIL"
fi

# Count pages using caching
CACHED_PAGES=$(grep -r "useCachedData\|useApiCache" src/pages --include="*.jsx" 2>/dev/null | cut -d: -f1 | sort -u | wc -l)
echo "Pages using caching: $CACHED_PAGES"
if [ "$CACHED_PAGES" -ge 10 ]; then
    test_result "Caching applied to multiple pages" "PASS" ">= 10" "$CACHED_PAGES"
else
    test_result "Caching applied to multiple pages" "FAIL" ">= 10" "$CACHED_PAGES"
fi

###############################################################################
# Test 4: Image Optimization Check
###############################################################################
echo -e "${BLUE}Test 4: Image Optimization Check${NC}"

# Check if OptimizedImage component exists
if [ -f "src/components/OptimizedImage.jsx" ]; then
    test_result "OptimizedImage component exists" "PASS"
else
    test_result "OptimizedImage component exists" "FAIL"
fi

# Check if imageOptimization utilities exist
if [ -f "src/utils/imageOptimization.js" ]; then
    test_result "imageOptimization utilities exist" "PASS"
else
    test_result "imageOptimization utilities exist" "FAIL"
fi

# Check if useImageOptimization hooks exist
if [ -f "src/hooks/useImageOptimization.js" ]; then
    test_result "useImageOptimization hooks exist" "PASS"
else
    test_result "useImageOptimization hooks exist" "FAIL"
fi

# Check if logos are using OptimizedImage
OPTIMIZED_LOGOS=$(grep -r "OptimizedImage" src/components/branding --include="*.jsx" 2>/dev/null | wc -l)
if [ "$OPTIMIZED_LOGOS" -gt 0 ]; then
    test_result "Logos using OptimizedImage" "PASS" "> 0" "$OPTIMIZED_LOGOS instances"
else
    test_result "Logos using OptimizedImage" "FAIL" "> 0" "0 instances"
fi

###############################################################################
# Test 5: Code Quality Check
###############################################################################
echo -e "${BLUE}Test 5: Code Quality Check${NC}"

# Check for console.logs in production build
CONSOLE_LOGS=$(grep -r "console\.log" build/static/js --include="*.js" 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -eq 0 ]; then
    test_result "No console.log in production build" "PASS"
else
    test_result "No console.log in production build" "FAIL" "0" "$CONSOLE_LOGS found"
fi

# Check if source maps exist (for debugging)
MAPS=$(find build -name "*.map" 2>/dev/null | wc -l)
if [ "$MAPS" -gt 0 ]; then
    test_result "Source maps included for debugging" "PASS"
else
    test_result "Source maps included for debugging" "FAIL"
fi

###############################################################################
# Test 6: Assets Check
###############################################################################
echo -e "${BLUE}Test 6: Static Assets Check${NC}"

# Check if logos exist in public
if [ -f "public/logo.png" ]; then
    LOGO_SIZE=$(ls -lh public/logo.png | awk '{print $5}')
    test_result "App logo exists" "PASS" "logo.png" "$LOGO_SIZE"
else
    test_result "App logo exists" "FAIL"
fi

if [ -f "public/partner-logo.png" ]; then
    PARTNER_SIZE=$(ls -lh public/partner-logo.png | awk '{print $5}')
    test_result "Partner logo exists" "PASS" "partner-logo.png" "$PARTNER_SIZE"
else
    test_result "Partner logo exists" "FAIL"
fi

###############################################################################
# Test 7: Documentation Check
###############################################################################
echo -e "${BLUE}Test 7: Documentation Check${NC}"

# Check if documentation exists
if [ -f "IMAGE_OPTIMIZATION_GUIDE.md" ]; then
    test_result "IMAGE_OPTIMIZATION_GUIDE.md exists" "PASS"
else
    test_result "IMAGE_OPTIMIZATION_GUIDE.md exists" "FAIL"
fi

if [ -f "CACHING_GUIDE.md" ]; then
    test_result "CACHING_GUIDE.md exists" "PASS"
else
    test_result "CACHING_GUIDE.md exists" "FAIL"
fi

if [ -f "PERFORMANCE_TESTING_GUIDE.md" ]; then
    test_result "PERFORMANCE_TESTING_GUIDE.md exists" "PASS"
else
    test_result "PERFORMANCE_TESTING_GUIDE.md exists" "FAIL"
fi

###############################################################################
# Summary Report
###############################################################################
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
if [ "$FAILED_TESTS" -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
else
    echo -e "${GREEN}Failed: $FAILED_TESTS${NC}"
fi
echo ""

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Performance optimizations status:"
    echo "  ✓ Priority 1 (Code Splitting) - Complete"
    echo "  ✓ Priority 2 (Client-side Caching) - Complete"
    echo "  ✓ Priority 3 (Image Optimization) - Complete"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm start (or serve -s build)"
    echo "  2. Open DevTools (F12) → Lighthouse tab"
    echo "  3. Run Lighthouse audit (mobile & desktop)"
    echo "  4. Document baseline scores"
    echo "  5. Compare with expected results"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review the output above.${NC}"
    exit 1
fi

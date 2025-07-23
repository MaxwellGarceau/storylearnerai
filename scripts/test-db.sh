#!/bin/bash

# Test Database Management Script
# This script helps manage the Supabase test instance for E2E integration tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Supabase CLI is installed
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed. Please install it first:"
        echo "  npm install -g supabase"
        echo "  or visit: https://supabase.com/docs/guides/cli"
        exit 1
    fi
}

# Function to start the test database
start_test_db() {
    print_status "Starting Supabase test instance..."
    
    # Stop any existing test instance first
    supabase stop 2>/dev/null || true
    
    # Start the test instance
    if supabase start; then
        print_success "Supabase test instance started successfully"
        print_status "API URL: http://127.0.0.1:54321"
        print_status "Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
        print_status "Studio URL: http://127.0.0.1:54323"
    else
        print_error "Failed to start Supabase test instance"
        exit 1
    fi
}

# Function to stop the test database
stop_test_db() {
    print_status "Stopping Supabase test instance..."
    
    if supabase stop; then
        print_success "Supabase test instance stopped successfully"
    else
        print_warning "Failed to stop Supabase test instance (it might not have been running)"
    fi
}

# Function to reset the test database
reset_test_db() {
    print_status "Resetting Supabase test instance..."
    
    if supabase db reset; then
        print_success "Test database reset successfully"
    else
        print_error "Failed to reset test database"
        exit 1
    fi
}

# Function to show test database status
status_test_db() {
    print_status "Checking Supabase test instance status..."
    
    if supabase status; then
        print_success "Test instance is running"
    else
        print_warning "Test instance is not running"
    fi
}

# Function to run tests with test database
run_tests() {
    print_status "Running E2E integration tests..."
    
    # Ensure test database is running
    if ! supabase status &>/dev/null; then
        print_warning "Test database not running. Starting it first..."
        start_test_db
    fi
    
    # Run the tests
    npm run test:once -- --run src/__tests__/e2e/
}

# Function to show help
show_help() {
    echo "Test Database Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start the Supabase test instance"
    echo "  stop      Stop the Supabase test instance"
    echo "  reset     Reset the test database (clear all data)"
    echo "  status    Show the status of the test instance"
    echo "  test      Run E2E integration tests"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start    # Start test database"
    echo "  $0 test     # Run E2E tests"
    echo "  $0 stop     # Stop test database"
}

# Main script logic
main() {
    # Check if Supabase CLI is installed
    check_supabase_cli
    
    # Parse command line arguments
    case "${1:-help}" in
        start)
            start_test_db
            ;;
        stop)
            stop_test_db
            ;;
        reset)
            reset_test_db
            ;;
        status)
            status_test_db
            ;;
        test)
            run_tests
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 
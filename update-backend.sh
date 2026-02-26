#!/bin/bash

# Firebook Backend Update Script
# This script helps update the deployed backend on AWS EC2

set -e  # Exit on error

# Configuration
BACKEND_DIR="/path/to/your/backend"  # UPDATE THIS PATH
SERVER_NAME="firebook-backend"
REPO_URL="your-git-repo-url"  # UPDATE THIS
BRANCH="master"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Firebook Backend Update Script${NC}"
echo ""

# Function to print colored messages
print_message() {
    echo -e "${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root or with sudo"
    exit 1
fi

# Parse command line arguments
case "$1" in
    update)
        print_message "Updating backend code..."
        ;;
    restart)
        print_message "Restarting backend server..."
        ;;
    status)
        print_message "Checking backend status..."
        ;;
    logs)
        print_message "Showing backend logs..."
        ;;
    update-env)
        print_message "Updating environment variables..."
        ;;
    update-deps)
        print_message "Updating dependencies..."
        ;;
    health-check)
        print_message "Performing health check..."
        ;;
    *)
        echo "Usage: $0 {update|restart|status|logs|update-env|update-deps|health-check}"
        echo ""
        echo "Commands:"
        echo "  update    - Update backend code from repository"
        echo "  restart    - Restart backend server"
        echo "  status    - Check backend status"
        echo "  logs      - Show backend logs"
        echo "  update-env - Update environment variables"
        echo "  update-deps - Update dependencies"
        echo "  health-check - Perform health check"
        exit 1
        ;;
esac

# Navigate to backend directory
print_message "Navigating to backend directory: $BACKEND_DIR"
cd "$BACKEND_DIR" || {
    print_error "Failed to navigate to backend directory: $BACKEND_DIR"
    exit 1
}

case "$1" in
    update)
        print_message "Pulling latest changes from repository..."

        # Check if git repo exists
        if [ -d ".git" ]; then
            print_message "Git repository found. Pulling latest changes..."

            # Pull latest changes
            git pull origin "$BRANCH" || {
                print_error "Failed to pull from repository"
                exit 1
            }

            # Install/update dependencies if needed
            print_message "Checking for new dependencies..."
            if [ -f "package.json" ]; then
                npm install || {
                    print_error "Failed to install dependencies"
                    exit 1
                }
            fi

            print_message "Backend updated successfully!"

            # Restart server
            print_message "Restarting backend server..."
            pm2 restart "$SERVER_NAME" || {
                print_warning "PM2 not found, trying systemd..."
                systemctl restart "$SERVER_NAME" || {
                    print_error "Failed to restart server"
                    exit 1
                }
            }

        else
            print_warning "Git repository not found. Please initialize git first."
            print_message "To set up git:"
            print_message "  cd $BACKEND_DIR"
            print_message "  git init"
            print_message "  git remote add origin $REPO_URL"
            print_message "  git add ."
            print_message "  git commit -m 'Initial commit'"
            print_message "  git push -u origin master"
            ;;

        ;;

    restart)
        print_message "Restarting backend server..."

        # Check if PM2 is available
        if command -v pm2 &> /dev/null; then
            pm2 restart "$SERVER_NAME" || {
                print_error "Failed to restart server with PM2"
                exit 1
            }

            # Show status
            print_message "Server status:"
            pm2 status "$SERVER_NAME"

            print_message "Server restarted successfully!"
        else
            print_warning "PM2 not found, trying systemd..."
            systemctl restart "$SERVER_NAME" || {
                print_error "Failed to restart server with systemd"
                exit 1
            }

            # Show status
            print_message "Server status:"
            systemctl status "$SERVER_NAME"

            print_message "Server restarted successfully!"
        ;;

    status)
        print_message "Checking backend status..."

        if command -v pm2 &> /dev/null; then
            print_message "PM2 Status:"
            pm2 status "$SERVER_NAME"

            print_message "Recent Logs:"
            pm2 logs "$SERVER_NAME" --lines 20 --nostream

            print_message "Uptime:"
            pm2 jlist "$SERVER_NAME"
        else
            print_warning "PM2 not found, checking systemd..."
            print_message "Systemd Status:"
            systemctl status "$SERVER_NAME"

            print_message "Recent Logs:"
            journalctl -u "$SERVER_NAME" -n 20

            print_message "Uptime:"
            systemctl show "$SERVER_NAME" --property=MainPID --value
        ;;

    logs)
        print_message "Showing backend logs (last 50 lines)..."

        if command -v pm2 &> /dev/null; then
            pm2 logs "$SERVER_NAME" --lines 50 --nostream
        else
            print_warning "PM2 not found, showing systemd logs..."
            journalctl -u "$SERVER_NAME" -n 50
        ;;

    update-env)
        print_message "Updating environment variables..."
        print_warning "Please edit the .env file manually with your production values"
        print_message "Required variables:"
        print_message "  DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
        print_message "  JWT_SECRET (use a strong, random string)"
        print_message "  OAuth credentials (Google, Facebook, Apple)"
        print_message "  OPENAI_API_KEY"
        print_message ""
        print_message "To update variables:"
        print_message "  1. Edit .env file: nano .env"
        print_message "  2. Restart server: ./update-backend.sh restart"
        ;;

    update-deps)
        print_message "Updating dependencies..."

        if [ -f "package.json" ]; then
            npm install || {
                print_error "Failed to install dependencies"
                exit 1
            }

            print_message "Dependencies updated successfully!"

        # Restart server to apply changes
        print_message "Restarting backend server..."
        pm2 restart "$SERVER_NAME" || {
            systemctl restart "$SERVER_NAME" || {
                print_error "Failed to restart server"
                exit 1
            }
        }
        ;;

    health-check)
        print_message "Performing health check..."

        # Check if server is responding
        print_message "Testing API endpoint..."

        if command -v curl &> /dev/null; then
            HTTP_CODE=$(curl -s -o "%{http_code}" https://firebook.app/api/health || curl -s -o "%{http_code}" http://localhost:3000/api/health)

            if [ "$HTTP_CODE" = "200" ]; then
                print_message "✅ Health check passed!"
            else
                print_error "❌ Health check failed! HTTP $HTTP_CODE"
            fi
        else
            print_warning "curl not available, skipping health check"
        fi

        # Test social API endpoints
        print_message "Testing social API endpoints..."

        print_message "  Testing /api/posts..."
        curl -s https://firebook.app/api/posts | head -20

        print_message "  Testing /api/me/social-stats..."
        curl -s https://firebook.app/api/me/social-stats | head -20

        print_message "  Testing /api/posts/trending..."
        curl -s https://firebook.app/api/posts/trending | head -20

        print_message "Health check completed!"
        ;;

esac

print_message ""
print_message "${GREEN}============================================${NC}"
print_message "${GREEN}Update Complete!${NC}"
print_message "${GREEN}============================================${NC}"
print_message ""
print_message "Next steps:"
print_message "1. Test the backend at https://firebook.app"
print_message "2. Monitor logs: ./update-backend.sh logs"
print_message "3. Check status: ./update-backend.sh status"
print_message ""
print_message "For full deployment guide, see DEPLOYMENT.md"

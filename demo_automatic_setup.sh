#!/bin/bash
# 🎲 Demo: Automatic Project Creation
# This script demonstrates the new automatic project creation feature

set -e

echo "🎲 Chaupar Game Setup - Automatic Project Creation Demo"
echo "========================================================"
echo ""

# Check if setup script exists
if [[ ! -f "setup.sh" ]]; then
    echo "❌ Error: setup.sh not found in current directory"
    exit 1
fi

# Make sure script is executable
chmod +x setup.sh

echo "🚀 Demo 1: Automatic Project Creation (No Project ID)"
echo "------------------------------------------------------"
echo "Command: ./setup.sh"
echo "Uses default name: 'Chaupar'"
echo ""

echo "This will:"
echo "✅ Generate a unique project ID automatically"
echo "✅ Create a new Firebase project"
echo "✅ Cache the project ID for future runs"
echo "✅ Set up all game dependencies"
echo ""

echo "🚀 Demo 2: Using Cached Project (Future Runs)"
echo "-----------------------------------------------"
echo "Command: ./setup.sh"
echo ""

echo "This will:"
echo "📋 Use the cached project ID automatically"
echo "🔄 Update existing configuration"
echo "💾 Preserve your Firebase API keys"
echo ""

echo "🚀 Demo 3: Switch to Different Project"
echo "---------------------------------------"
echo "Command: ./setup.sh -p different-project-id"
echo ""

echo "This will:"
echo "💾 Backup existing configuration"
echo "🔄 Switch to new project"
echo "📋 Update cache with new project"
echo ""

echo "📋 Cache File Information"
echo "-------------------------"
echo "Location: .chaupar_cache.json"
echo "Contents: Project ID, name, timestamps"
echo "Purpose: Enable automatic reruns"
echo ""

echo "💡 To run the actual setup:"
echo "   ./setup.sh                    # Uses default name 'Chaupar'"
echo "   ./setup.sh --project-name 'Custom Name'  # Or specify custom name"
echo ""
echo "💡 To see all options:"
echo "   ./setup.sh --help"
echo ""

echo "🎯 Key Benefits:"
echo "✅ Zero configuration needed for first run"
echo "✅ Automatic project ID generation"
echo "✅ Smart caching for reruns"
echo "✅ Safe project switching"
echo "✅ No manual Firebase setup required"

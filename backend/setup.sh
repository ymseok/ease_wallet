#!/bin/bash

# Backend setup script with package manager auto-detection

echo "🚀 Ease Wallet Backend Setup"
echo "=============================="
echo ""

# Check which package managers are available
HAS_PNPM=$(command -v pnpm &> /dev/null && echo "yes" || echo "no")
HAS_YARN=$(command -v yarn &> /dev/null && echo "yes" || echo "no")
HAS_NPM=$(command -v npm &> /dev/null && echo "yes" || echo "no")

echo "Available package managers:"
[ "$HAS_PNPM" = "yes" ] && echo "  ✅ pnpm (recommended)"
[ "$HAS_YARN" = "yes" ] && echo "  ✅ yarn"
[ "$HAS_NPM" = "yes" ] && echo "  ✅ npm"
echo ""

# Auto-select package manager (priority: pnpm > yarn > npm)
if [ "$HAS_PNPM" = "yes" ]; then
    PM="pnpm"
    INSTALL_CMD="pnpm install"
elif [ "$HAS_YARN" = "yes" ]; then
    PM="yarn"
    INSTALL_CMD="yarn install"
elif [ "$HAS_NPM" = "yes" ]; then
    PM="npm"
    INSTALL_CMD="npm install --legacy-peer-deps"
else
    echo "❌ Error: No package manager found!"
    echo "Please install pnpm, yarn, or npm first."
    exit 1
fi

echo "📦 Using: $PM"
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "⚠️  node_modules already exists"
    read -p "Do you want to clean install? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🧹 Cleaning..."
        rm -rf node_modules
        rm -f package-lock.json yarn.lock pnpm-lock.yaml
    fi
fi

# Install dependencies
echo "📥 Installing dependencies..."
echo "Command: $INSTALL_CMD"
echo ""

$INSTALL_CMD

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation successful!"
    echo ""
    echo "Next steps:"
    echo "1. Copy .env file: cp .env.example .env"
    echo "2. Configure .env with your credentials"
    echo "3. Start development server: $PM dev"
else
    echo ""
    echo "❌ Installation failed!"
    echo ""
    if [ "$PM" = "npm" ]; then
        echo "💡 Tip: Consider using pnpm or yarn for better dependency resolution:"
        echo "   npm install -g pnpm"
        echo "   pnpm install"
    fi
    exit 1
fi

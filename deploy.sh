#!/usr/bin/env sh

# Abort on errors
set -e

echo "🚀 Building Siddur+ PWA..."
pnpm build

echo "📦 Navigating to dist directory..."
cd dist

echo "🔧 Initializing git repository for deployment..."
git init
git checkout -b main
git add -A
git commit -m 'chore: manual deployment to gh-pages'

echo "☁️ Pushing to gh-pages branch..."
git push -f git@github.com:relbns/siddur-plus.git main:gh-pages

cd -
echo "✅ Deployment completed successfully!"

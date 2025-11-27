# Package Manager Guide

The backend supports multiple package managers. Choose based on your preference:

## 🚀 Recommended: pnpm (Fastest & Most Reliable)

**Why pnpm?**
- ✅ Fastest installation speed
- ✅ Strict dependency resolution (catches issues early)
- ✅ Disk space efficient (shared store)
- ✅ Best for monorepos

**Setup:**
```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Run dev server
pnpm dev
```

**Fix dependency conflicts:**
```bash
pnpm install --force
```

---

## 📦 Yarn Classic (v1.x) - Good Alternative

**Why Yarn?**
- ✅ Better dependency resolution than npm
- ✅ Lockfile more stable than npm
- ✅ Widely adopted

**Setup:**
```bash
# Install Yarn globally (if not already installed)
npm install -g yarn

# Install dependencies
yarn install
# or simply
yarn

# Run dev server
yarn dev
```

**Fix dependency conflicts:**
```bash
# Clear cache
yarn cache clean

# Reinstall
rm -rf node_modules yarn.lock
yarn install
```

---

## 📌 npm (Default, but not recommended for this project)

If you must use npm:

```bash
npm install --legacy-peer-deps

# Run dev server
npm run dev
```

**Note:** The `--legacy-peer-deps` flag bypasses peer dependency checks, which can hide compatibility issues.

---

## 🔧 Troubleshooting Dependency Conflicts

### Common Issues

#### 1. `@types/node` version conflicts
**Solution:** Already handled via `resolutions` in package.json

#### 2. `ethers` peer dependency issues
```bash
# For pnpm
pnpm install ethers@^6.11.1 --force

# For yarn
yarn add ethers@^6.11.1
```

#### 3. TypeScript compilation errors after install
```bash
# Clear build cache
rm -rf dist/

# Rebuild
pnpm build  # or yarn build
```

#### 4. `Cannot find module` errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm -f pnpm-lock.yaml  # or yarn.lock or package-lock.json

# Reinstall
pnpm install  # or yarn install
```

---

## 📊 Comparison

| Feature | pnpm | Yarn | npm |
|---------|------|------|-----|
| Speed | ⚡⚡⚡ | ⚡⚡ | ⚡ |
| Disk Usage | ✅ Efficient | 🟡 Moderate | ❌ Wasteful |
| Conflict Resolution | ✅ Strict | ✅ Good | 🟡 Permissive |
| Monorepo Support | ✅ Excellent | ✅ Good | 🟡 Basic |
| Lockfile Stability | ✅ Excellent | ✅ Good | 🟡 Fair |

---

## 🎯 Our Recommendation

**For this project:** Use **pnpm** for the best experience.

**Quick start:**
```bash
npm install -g pnpm
pnpm install
pnpm dev
```

That's it! 🎉

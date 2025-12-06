# Cleanup Script

## Execute These Commands to Clean Up the Codebase

### Phase 1: Delete Unused Files

```bash
# Navigate to project root
cd metalink

# Delete unused service layer
rm src/services/cad-generation.service.ts
rmdir src/services  # Only if directory is now empty

# Delete unused Redis module
rm lib/redis.ts
rmdir lib  # Only if directory is now empty

# Delete redundant API routes
rm -rf src/app/api/cad
rm src/lib/cad-api.ts

# Git status to see what was removed
git status
```

### Phase 2: Verify Nothing Breaks

```bash
# Check for any remaining imports (should find none)
grep -r "from.*cad-generation.service" src/ convex/
grep -r "from.*lib/redis" src/ convex/
grep -r "from.*cad-api" src/
grep -r "/api/cad" src/

# Expected: No matches found
```

### Phase 3: Run Linter

```bash
# Check for any errors
npm run lint

# Expected: No errors (files weren't used anyway)
```

### Phase 4: Test Build

```bash
# Test Convex build
npx convex dev

# Test Next.js build (in another terminal)
npm run dev

# Expected: Everything still works
```

## What Gets Deleted

### Files to Remove (984 lines total):

```
src/services/cad-generation.service.ts      (272 lines)
lib/redis.ts                                 (102 lines)
src/app/api/cad/generate/route.ts           (118 lines)
src/app/api/cad/history/route.ts            ( 60 lines)
src/app/api/cad/status/[id]/route.ts        ( 60 lines)
src/app/api/cad/download/[id]/route.ts      ( 80 lines)
src/lib/cad-api.ts                          (110 lines)
src/app/api/admin/cache-stats/route.ts      ( 82 lines)
```

**Note**: The CAD Generator currently doesn't work with Zoo Dev API anyway (404 error), so removing the redundant layers won't affect functionality.

## Safe to Delete Because

1. **src/services/cad-generation.service.ts**
   - ✅ Zero imports found
   - ✅ Never used in components
   - ✅ Dead code

2. **lib/redis.ts**
   - ✅ Zero imports in actual code
   - ✅ Only referenced in docs
   - ✅ Redis used inline in Convex instead

3. **src/app/api/cad/**
   - ✅ Just proxies to Convex
   - ✅ No business logic
   - ✅ Chatbot doesn't use them (direct Convex)

4. **src/lib/cad-api.ts**
   - ✅ Only used by hooks
   - ✅ Wraps redundant API routes
   - ✅ Will be replaced

## After Cleanup

Your architecture will be:

```
BEFORE (5 layers):
Component → Hook → CADAPI → API Route → Convex Action

AFTER (2 layers):
Component → Convex Action (via useAction)
```

This is the same pattern the Chatbot already uses successfully!



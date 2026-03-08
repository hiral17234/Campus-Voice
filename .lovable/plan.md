

## Plan: Replace Hardcoded Values with Environment Variables

Update three files to read from `import.meta.env` instead of hardcoded strings, with fallbacks for local development.

### Changes

**1. `src/lib/firebase.ts`**
Replace all hardcoded Firebase config values with `import.meta.env.VITE_FIREBASE_*` variables, keeping current values as fallbacks.

**2. `src/context/AuthContext.tsx`**
Replace the hardcoded `FACULTY_CREDENTIALS` object to read from `import.meta.env.VITE_FACULTY_EMAIL` and `import.meta.env.VITE_FACULTY_PASSWORD`.

**3. `src/types/index.ts`**
Replace hardcoded `CAMPUS_CODE` and `FACULTY_CODE` constants to read from `import.meta.env.VITE_CAMPUS_CODE` and `import.meta.env.VITE_FACULTY_CODE`.

All variables will have fallbacks to current hardcoded values so the app still works in local development without a `.env` file.


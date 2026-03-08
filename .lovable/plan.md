

## Plan: Replace Inline Nickname Text with Toast

### Changes in `src/pages/Login.tsx`

1. **Remove inline text** (lines 236-241): Delete both the "This name is already taken" and "Name is available!" paragraph elements

2. **Remove green check icon** (lines 218-219): Remove the `nicknameAvailable === true` check icon — keep only spinner and red X

3. **Add toast in the availability check effect** (around line 62): When `available === false`, fire `toast.error('This nickname is already taken. Please choose another.')`

4. **Remove `Check` from imports** (line 11) since it's no longer used


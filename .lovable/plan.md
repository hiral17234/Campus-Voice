

## Plan: Fix Nickname Input UI

The screenshot shows the nickname input field appears empty (no pre-generated name visible) and the styling looks off with the focus ring.

### Changes in `src/pages/Login.tsx`

1. **Initialize nickname with a generated value** instead of empty string — change `useState('')` to `useState(generateNickname())` on line 24, and remove the redundant `useEffect` on lines 47-49 that sets it after mount (this eliminates the brief empty flash)

2. **Clean up input styling** — remove `pr-10` from the input className since we rarely show right-side icons now (only spinner/X when checking), reducing the empty padding that looks off. Use `pr-8` only conditionally or keep a smaller padding.


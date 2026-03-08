

## Plan: Replace Fake Welcome Stats + Add Error/Empty States

### 1. Replace Fake Welcome Page Stats with Real Firestore Data

**Current problem**: Welcome page shows hardcoded `15000+`, `95%`, `100%` stats that are fake.

**Solution**: Create a lightweight Firestore query on the Welcome page to fetch real counts, and compute resolution rate dynamically.

**Changes to `src/pages/Welcome.tsx`**:
- Import `collection`, `getCountFromServer` (or `getDocs`) and `query`/`where` from Firestore
- Add a `useEffect` that fetches:
  - Total issues count (non-deleted)
  - Resolved issues count
  - Compute resolution rate as `resolved / total * 100`
- Replace the hardcoded `stats` array with dynamic values
- Keep "100% Anonymous" as a static stat (it's a feature, not data)
- Show loading skeletons while stats load
- If fetch fails, show "---" or fallback gracefully

**Stats will become**:
| Stat | Source |
|------|--------|
| Issues Raised | Real count from Firestore `issues` collection |
| Resolution Rate | `(resolved / total) * 100` |
| Anonymous | Keep as static "100%" (it's a feature claim) |

### 2. Add Error States & Empty States Across Pages

**Pages to update**:

**`StudentFeed.tsx`** (lines 372-391):
- Current empty state is bare: just "No issues found" text
- Enhance with an illustration icon, descriptive text, and a CTA button to create an issue
- Add a loading skeleton state using `isLoading` from IssuesContext (show 3 skeleton cards while loading)

**`Notifications.tsx`**:
- Add empty state with `BellOff` icon and "No notifications yet" message when list is empty
- Add loading state

**`PublicStats.tsx`**:
- Add a loading skeleton for stat cards
- Handle zero-data state gracefully with a message

**`IssueDetail.tsx`**:
- Already shows issue not found — enhance with a proper error card, icon, and back button instead of plain text

**`Profile.tsx`**:
- Add empty states for "no issues posted", "no upvoted issues" etc. in the activity tabs

### 3. Create a Reusable `EmptyState` Component

**New file: `src/components/EmptyState.tsx`**
- Props: `icon`, `title`, `description`, `action?` (button label + onClick)
- Centered layout with muted icon, title, subtitle, and optional CTA
- Reused across all pages

### 4. Create a Reusable `FeedSkeleton` Component

**New file: `src/components/FeedSkeleton.tsx`**
- Renders 3 skeleton cards mimicking IssueCard layout
- Used in StudentFeed and AdminDashboard during loading

### Summary of Files Changed
- `src/components/EmptyState.tsx` — new
- `src/components/FeedSkeleton.tsx` — new
- `src/pages/Welcome.tsx` — dynamic stats from Firestore
- `src/pages/StudentFeed.tsx` — loading skeletons + enhanced empty states
- `src/pages/Notifications.tsx` — empty state
- `src/pages/IssueDetail.tsx` — enhanced error state
- `src/pages/PublicStats.tsx` — loading state
- `src/pages/Profile.tsx` — empty states for activity tabs


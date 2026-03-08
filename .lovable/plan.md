

## Plan: Pagination + Falsely Accused Workflow Fix

### 1. Add Pagination to Student Feed (`src/pages/StudentFeed.tsx`)

- Add `currentPage` state (default 1), reset to 1 when filters/sort/tab change
- Set `ITEMS_PER_PAGE = 12`
- Slice `filteredAndSortedIssues` to show only the current page's items
- Add pagination controls at the bottom using the existing `Pagination` UI components (`src/components/ui/pagination.tsx`)
- Show page numbers with ellipsis for large page counts, plus Previous/Next buttons
- Apply same pagination to the Official and Reported tabs

### 2. Add Pagination to Admin Dashboard (`src/pages/AdminDashboard.tsx`)

- Add `currentPage` state, reset on tab/filter changes
- Set `ITEMS_PER_PAGE = 12`
- Slice `filteredIssues` for the current page in both mobile card view and desktop table view
- Add pagination controls below the issues list
- Also paginate the Appeals list

### 3. Fix Falsely Accused & Restore Workflow (`src/context/IssuesContext.tsx`)

Current `markAsFalselyAccused` only updates the issue document. It should also:
- Send notifications to all users who reported the issue (from `issue.reports`) warning them their report was found to be false
- Restore the issue's previous status (before deletion) instead of resetting to `pending` — or keep `pending` as a safe default but add a timeline event

Current `restoreIssue` similarly needs:
- A notification to the issue author that their issue was restored
- A timeline event recording the restoration

### Technical Details

**Pagination helper** (shared logic): Compute `totalPages`, `paginatedItems`, and generate page number array with ellipsis. This will be inline in each page component to keep it simple.

**Notification on falsely accused**: Loop through `issue.reports`, create a notification doc for each unique `reporterId` with message like "An issue you reported has been reviewed and verified as legitimate."

**Notification on restore**: Create notification for `issue.authorId` with message "Your issue has been restored by administration."

### Files Changed
- `src/pages/StudentFeed.tsx` — pagination state + controls
- `src/pages/AdminDashboard.tsx` — pagination state + controls  
- `src/context/IssuesContext.tsx` — enhance `markAsFalselyAccused` and `restoreIssue` with notifications and timeline events


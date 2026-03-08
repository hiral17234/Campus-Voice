
# Mobile-Friendly Admin Dashboard Issues View

## Problem
The Faculty Dashboard's issues table requires horizontal scrolling on mobile to see category, status, priority, votes, and action buttons. This creates a poor user experience on phones.

## Solution
Create a responsive layout that shows:
- **Desktop (md and above)**: Keep the current table layout
- **Mobile (below md)**: Show compact issue cards that expand on tap to reveal all details

## Implementation Details

### New Component: `AdminIssueCard.tsx`
A mobile-optimized card component specifically for the admin dashboard that:

**Collapsed State (default):**
- Issue title with status indicator icon
- Location and time (compact)
- Vote counts inline
- Visual indicators for reported/official/falsely accused

**Expanded State (on tap):**
- Full badges row: Category, Status, Priority
- Department assignment dropdown
- Report count (if applicable)
- Action buttons: View, Change Status, Restore/Verify

###Also fix the things of falsely accoused and appeals like how they should work in real 

### Visual Layout

**Collapsed Card:**
```text
+------------------------------------------+
| [Flag] Issue Title Here...        ↑5 ↓2  |
| 📍 Library · 2 hours ago                 |
+------------------------------------------+
```

**Expanded Card (after tap):**
```text
+------------------------------------------+
| [Flag] Issue Title Here...        ↑5 ↓2  |
| 📍 Library · 2 hours ago                 |
|------------------------------------------|
| [Infrastructure] [Pending] [High]        |
|                                          |
| Department: [Select dropdown      ▼]     |
| Reports: 5 reports                       |
|                                          |
| [👁 View]  [↻ Status]  [✓ Verify]       |
+------------------------------------------+
```

### Files to Modify

**1. Create `src/components/AdminIssueCard.tsx`**
- New component for mobile issue display
- Uses Framer Motion for smooth expand/collapse animation
- Includes all admin actions (status change, priority, department)
- Shows different action buttons based on tab (all/reported/deleted/falsely_accused)

**2. Update `src/pages/AdminDashboard.tsx`**
- Import `useIsMobile` hook
- Import new `AdminIssueCard` component
- Conditionally render:
  - Table layout when `!isMobile`
  - Card list when `isMobile`
- Keep all existing functionality and filters working

### Animation Behavior
- **Expand**: 300ms ease-out, height auto-animate
- **Chevron icon**: Rotates 180 degrees when expanded
- **Staggered entry**: Cards animate in sequence on initial load

### Mobile-Specific Features
- Larger touch targets for action buttons (min 44px)
- Full-width dropdowns for priority/department selection
- Swipe-friendly card spacing
- Sticky header remains for filters access

### Technical Notes
- Use `AnimatePresence` for smooth enter/exit of expanded content
- Use `motion.div` with `layout` prop for height animation
- Reuse existing badge components (StatusBadge, CategoryBadge, PriorityBadge)
- All existing handlers work unchanged (handlePriorityChange, handleDepartmentAssign, etc.)

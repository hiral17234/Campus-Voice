

## Plan: Mobile-Optimized Student Feed Layout

### Problem
On mobile, the sidebar (Quick Stats, Report Issue button, Campus Apps) renders above the main feed, pushing content far down. The header also has too many visible items, making it cluttered.

### Changes

**1. Collapse sidebar into a hamburger/drawer on mobile (`src/pages/StudentFeed.tsx`)**
- Add a hamburger menu button (visible only on `lg:hidden`) in the header, next to the logo
- Use a `Sheet` (side drawer) component to house the sidebar content (Quick Stats, Report Issue, Campus Apps) on mobile
- Hide the `<aside>` on mobile (`hidden lg:block`) since it will live in the drawer instead
- The Stats button already hidden on mobile (`hidden sm:flex`) — move it into the drawer too

**2. Header cleanup on mobile**
- Replace the separate Stats button with the hamburger menu button on mobile
- Keep: logo, notification bell, theme toggle, user chip, logout — these are compact enough
- The hamburger opens a left-side Sheet containing: Quick Stats, Report Issue button, Campus Apps

**3. Ensure "Report Issue" remains accessible**
- Add the Report Issue button inside the mobile drawer
- Optionally add a floating action button (FAB) on mobile for quick access

### Technical Details
- Import `Sheet, SheetContent, SheetTrigger` from `@/components/ui/sheet`
- Add `Menu` icon from lucide-react for the hamburger
- Add state `sidebarOpen` to control the sheet
- Extract sidebar content into a reusable fragment rendered both in the Sheet (mobile) and inline aside (desktop)


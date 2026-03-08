

## Plan: Add Threaded (Reply) Comments

### Overview
Add reply-to-comment threading so users can respond to specific comments. Replies will be displayed nested under their parent comment.

### Changes

**1. Update Comment type (`src/types/index.ts`)**
- Add `parentId?: string` and `replyToNickname?: string` fields to the `Comment` interface

**2. Update `addComment` in `src/context/IssuesContext.tsx`**
- Persist `parentId` and `replyToNickname` fields to Firestore when provided

**3. Update `IssueDetail.tsx` — threading UI**
- Add `replyingTo` state (`{ id, nickname } | null`)
- Add a "Reply" button on each comment
- When replying, show a small indicator above the textarea ("Replying to @Nickname ✕")
- Pass `parentId` and `replyToNickname` to `addComment` when submitting a reply
- Group comments: render top-level comments, then nest replies (1 level deep) indented underneath their parent with a visual connector line
- Sort replies chronologically under each parent

### UI Behavior
- Clicking "Reply" sets `replyingTo` state and focuses the textarea
- Clicking ✕ on the reply indicator cancels the reply (clears `replyingTo`)
- Replies show "@nickname" prefix in their content area and are indented with a left border
- Only 1 level of nesting (replies to replies still attach to the original parent)


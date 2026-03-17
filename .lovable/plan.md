

## Plan: Generate CampusVoice Project Thumbnail

### Approach: AI-Generated Image (Zero app changes)

Use the Lovable AI image generation API to create a professional project thumbnail. **No routes added, no code changed, no app flow affected.**

### What gets built

A single edge function or inline generation call that produces a 16:9 dark-themed thumbnail featuring:
- CampusVoice branding and logo
- Tagline: "Anonymous Campus Issue Reporting Platform"
- Visual elements: voting icons, shield (anonymity), megaphone, campus silhouette
- Gold/purple gradient accents matching the app's color scheme
- Clean, modern presentation-ready design

### Implementation

1. Create a simple `/thumbnail` route (isolated, not in nav) that calls the AI image generation API and displays the result
2. The route will have a "Download" button to save the image
3. Route is not linked anywhere in the app — only accessible by direct URL

### Why this is safe
- No existing routes or components are modified
- No navigation links point to `/thumbnail`
- The route is purely a utility page for you, the developer


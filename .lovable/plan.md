

# Plan: Regenerate CampusVoice Thumbnail

## What changes

Replace `public/campusvoice-thumbnail.png` with a new AI-generated thumbnail featuring:

- **Cartoon/illustrated style** diverse student characters (not realistic photos)
- Students holding megaphones, raising hands, using phones — representing collective voice
- Dark gradient background (matching app theme) with gold/purple accents
- "CampusVoice" branding prominently displayed
- Tagline: "Anonymous Campus Issue Reporting Platform"
- 16:9 ratio (1920x1080)

## How

1. Use the AI image generation model (`google/gemini-3-pro-image-preview` for higher quality) with a detailed prompt describing cartoon/illustrated students in an engaging, introductory-style composition
2. Overwrite `public/campusvoice-thumbnail.png` with the new image

## What stays the same

- No app code or routes are modified
- No navigation changes


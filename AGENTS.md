# X-Mtaani AGENTS.md

## Project Overview
X-Mtaani is a hyper-local civic-accountability platform inspired by X/Twitter.
Users anonymously report local community issues by ward and constituency.
The platform clusters reports into local priorities and creates accountability visibility for leaders.

The project is currently an MVP hackathon build focused on:
- usability
- civic engagement
- anonymity
- accountability
- low-bandwidth accessibility
- trust & safety

---

## Current Tech Stack
- React
- Vite
- Tailwind CSS
- localStorage-based mock backend
- No real backend yet
- No authentication provider yet
- No real X/Twitter API integration yet

---

## UI / UX Conventions

### Overall Layout
The app should feel similar to X/Twitter:
- left sidebar navigation
- center civic feed
- right insights panel

### Sidebar
Sidebar items:
- Home / Mtaani
- Explore
- Leaderboard
- What's New
- Dashboard (expandable)

### Feed
- Feed should feel compact and social-media-like
- Reports are shown as civic posts/cards
- Use subtle borders and rounded cards
- Minimal animations
- Green accent color
- Text-first and low-bandwidth friendly

### Post Actions
Post actions include:
- like
- comment
- repost
- share

Spacing should be compact but clear.
Hover colors:
- like: red/pink
- comment: blue
- repost: green
- share: purple/neutral

### Post Modal
Posting uses a modal popup triggered by the Post button.

---

## Privacy & Trust/Safety Rules

### Privacy
- Exact user location/street must NOT be shown publicly
- Public posts show only ward and constituency
- Exact location may remain internally for clustering logic only

### Trust & Safety
Posts should support:
- Unverified
- Community Confirmed
- Resolved

The platform must clearly discourage:
- harassment
- ethnic hate
- incitement
- political manipulation
- election misinformation

Future moderation roadmap should be acknowledged in README and UI.

### Anonymity
Users should remain anonymous by default.
Users may:
- enter an anonymous username
OR
- receive an auto-generated anonymous identity.

---

## Data Rules

### Persistence
Use localStorage only for MVP.

### Service Layer
All persistence logic should remain inside:
- src/services/issueService.js
- src/services/userService.js (if present)

Avoid scattering localStorage logic across components.

### Archived Posts
Archive posts instead of deleting permanently.
Archived posts should:
- remain in localStorage
- disappear from public feeds and analytics

---

## Social Features

### Likes
Users can:
- like/unlike posts
- see like counts

### Comments
Users can:
- open a post detail view
- comment on posts

### Reposts
Users can repost posts.
Avoid duplicate reposts by the same user.

### Follows
Follow/unfollow must apply ONLY to the selected anonymous author.

---

## Leader Scoreboard

Leaders should support:
- accountability score
- resolved issue count
- unresolved issue count
- detail view/modal

Leaderboard scores are community accountability estimates, not official government ratings.

Suggested score logic:
score = resolved / total resolved+unresolved

---

## MVP Constraints

DO NOT ADD YET:
- Supabase
- Firebase
- Express backend
- real authentication
- maps
- real geolocation
- real X API posting
- complex moderation systems
- heavy animations
- large UI frameworks

---

## Coding Conventions
- Use functional React components
- Keep components modular and reusable
- Avoid over-engineering
- Keep prompts scoped and incremental
- Prefer minimal changes over large rewrites
- Preserve existing functionality when editing

---

## Priority Order
1. Stability
2. Mobile responsiveness
3. Feed experience
4. Trust & safety clarity
5. Clean UI consistency
6. Demo readiness

---

## Feed Ranking Rules

X-Mtaani is location-first, not virality-first.

After sign-in, users should provide:
- county
- constituency
- ward
- optional estate/area

The feed should prioritize reports in this order:
1. same ward
2. same constituency
3. same county
4. nearby or related areas
5. national civic issues only if highly relevant

As the user scrolls, the feed scope may expand gradually from ward-level to constituency-level, county-level, then national-level.

Do not show random unrelated areas high in the feed.
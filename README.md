# X-Mtaani

X-Mtaani is a hyper-local civic reporting in Kenya. It gives residents an X/Twitter-style feed for anonymously raising local issues, seeing what is trending nearby, and tracking community accountability signals for leaders.

## Problem

Many local civic issues are reported informally in WhatsApp groups, social media threads, or isolated conversations. This makes it hard to see repeated problems, compare priorities across wards, and hold the right offices accountable.

X-Mtaani organizes anonymous community reports by ward, constituency, and county so residents can see nearby issues first and surface repeated civic priorities without exposing exact reporter locations.

## Key Features

- Anonymous civic report creation with optional media attachments.
- Location-first Home feed grouped by `Your Ward`, `Your Constituency`, `Your County`, and `Wider Civic Issues`.
- Likes, comments, reposts, sharing, follows, and post archive controls.
- Priority clusters for broader Explore/trend-style discovery.
- Leader scoreboard with community accountability estimates and related issues.
- Verification labels: `Unverified`, `Community Confirmed`, and `Resolved`.
- Trust & Safety card explaining privacy, verification, misuse rules, and moderation roadmap.
- Deterministic seeded demo data with 200+ users and 200+ reports across Kenyan locations.
- Demo sign in, sign up, sign out, demo account switching, and reset demo data.

## Tech Stack

- React
- Vite
- Tailwind CSS
- lucide-react icons
- localStorage mock backend

No real backend, database, map provider, or external authentication service is used yet.

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Demo Authentication

Authentication is localStorage-based demo authentication only. It exists so the MVP can test signed-in user profiles, location-first feeds, likes, follows, reposts, and account switching.

Important security note:

- Passwords are stored locally for demo purposes.
- Passwords are not hashed or production-secure.
- This should never be treated as real authentication.
- A production version should use Supabase Auth, Auth0, Firebase Auth, or another secure authentication provider.

The sign-in screen includes demo accounts for different regions so judges and testers can compare location-first feed behavior quickly.

## Trust & Safety

X-Mtaani is designed around civic safety and misuse reduction:

- Reports are anonymous by default.
- Exact estate, street, or private location details are hidden publicly for reporter safety.
- Public posts show ward and constituency only.
- Reports use verification labels to reduce misuse and make uncertainty visible.
- Users can archive their own posts without permanently deleting local audit history.
- Misuse, harassment, ethnic hate, incitement, and election-period manipulation are explicitly discouraged.
- Future moderation should include evidence review, rate limits, trusted community verifiers, abuse reporting, and election-period safeguards.

## Location-First Feed

X-Mtaani is location-first, not virality-first. After sign-in, the Home/Mtaani feed uses the signed-in user's location profile to prioritize reports:

1. Same ward
2. Same constituency
3. Same county
4. Wider civic issues

This helps residents start with what is closest to them while still allowing broader county and national civic issues to appear lower in the feed. Explore remains broader and trend-focused.

## Future Improvements

- Replace localStorage with a real backend and secure authentication.
- Add moderation queues, trusted verifier roles, and abuse reporting.
- Add evidence review and duplicate-report detection.
- Add notification preferences and leader response workflows.
- Add location-aware ranking refinements without exposing exact user location.
- Add analytics for ward, constituency, and county-level civic priorities.
- Add accessibility and low-bandwidth optimizations.

## Hackathon Context

This project is an MVP built for demo readiness. It intentionally uses localStorage to simulate users, sessions, reports, comments, likes, follows, reposts, and seeded data without requiring backend setup.

The goal is to demonstrate the core product idea: anonymous, location-first civic reporting with trust and accountability signals for Kenyan communities.

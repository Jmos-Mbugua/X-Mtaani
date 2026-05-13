# X-Mtaani

X-Mtaani is a hyper-local civic reporting platform for Kenya. It gives residents an X/Twitter-style social feed for anonymously raising local issues, seeing what is happening nearby, and tracking community accountability signals for leaders.

## Problem

Many local civic issues are reported informally in WhatsApp groups, social media threads, or isolated conversations. This makes it hard to see repeated problems, compare priorities across wards, and hold the right offices accountable.

X-Mtaani organizes anonymous community reports by ward, constituency, and county so residents can see nearby issues first and surface repeated civic priorities without exposing exact reporter locations.

## Key Features

- Anonymous civic report creation with optional media attachments.
- Anonymous usernames, demo sign in/sign up, sign out, and account switching.
- Location-first Home feed grouped by `Your Ward`, `Your Constituency`, `Your County`, and `Wider Civic Issues`.
- Social civic feed actions: likes, comments, reposts, shares, follows, and post archive controls.
- Priority clusters for broader Explore/trend-style discovery.
- Leader accountability dashboard with community response estimates and related issues.
- Verification labels: `Unverified`, `Community Confirmed`, and `Resolved`.
- Original-reporter issue resolution controls in the post detail view.
- Trust & Safety card explaining privacy, verification, misuse rules, and moderation roadmap.
- Deterministic seeded demo data with 200+ users and 200+ reports across Kenyan locations.
- Reset demo data flow for clean hackathon demos.

## Social Civic Feed

X-Mtaani keeps the familiar social-feed pattern but applies it to civic reporting:

- Residents post local reports using anonymous usernames.
- Other users can like, comment, repost, and share reports.
- Comments support local discussion, updates, and "still a problem" signals.
- Reposts help surface repeated civic concerns without creating a new report from scratch.
- Public feed cards show civic category, verification status, ward, constituency, and social activity.
- The Home/Mtaani feed is ranked by location so the closest issues appear first.
- Explore and Dashboard views show broader priority clusters and leader accountability signals.

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

## Resolution Logic

Issue resolution is intentionally reporter-controlled:

- Only the original reporter can mark their own issue as resolved.
- The `Mark as Resolved` control appears only in the post detail/comments view.
- Other users can still comment, add local context, or say the issue remains a problem, but they cannot directly resolve someone else's report.
- Resolved posts show a `Resolved` badge and a `Resolved by original reporter` note.
- Cluster resolution depends on multiple related reports in the same county, constituency, ward, and category being marked resolved by their original reporters.
- Clusters can be labeled `Needs Attention`, `Partially Resolved`, or `Mostly Resolved`.
- Priority ranking favors unresolved and high-volume clusters, while mostly resolved clusters are reduced in priority.
- Leader scores update from resolved vs unresolved related community reports.

This keeps resolution community-driven while reducing the risk that unrelated users or coordinated groups can falsely close an issue.

## Trust & Safety

X-Mtaani is designed around civic safety and misuse reduction:

- Reports are anonymous by default.
- Exact estate, street, or private location details are hidden publicly for reporter safety.
- Public posts show ward and constituency only.
- Reports use verification labels to reduce misuse and make uncertainty visible.
- Users can archive their own posts without permanently deleting local audit history.
- Misuse, harassment, ethnic hate, incitement, and election-period manipulation are explicitly discouraged.

## Privacy Protections

X-Mtaani protects reporters by separating internal location data from public display:

- Users remain anonymous by default through anonymous usernames.
- Exact estate, street, and private location details are not shown publicly.
- Public posts show ward and constituency only.
- Exact location can remain in local report data for clustering, moderation, and future verification workflows.
- The product is designed so local accountability does not require exposing a resident's precise home or street.

## Verification And Trust Model

The current MVP uses community confidence signals, not official fact verification:

- Reports begin as `Unverified`.
- Reports can become `Community Confirmed` after multiple local confirmations or discussion signals.
- Reports become `Resolved` only when the original reporter marks their own issue as fixed.
- Cluster status is based on multiple related reports, not a single user action.
- Leader ratings are community accountability estimates based on related resolved and unresolved reports.

These labels help communicate confidence and uncertainty while avoiding claims that the MVP has performed official verification.

## Trust & Safety Roadmap

Future versions should add stronger protections against misuse:

- Moderation tools and abuse reporting.
- Abuse detection for harassment, ethnic hate, incitement, spam, and coordinated manipulation.
- Election-period safeguards for political misinformation and voter manipulation attempts.
- Trusted community verifiers for evidence review and local confirmation.
- Spam and rate limiting to reduce mass posting and brigading.
- Media verification workflows for images and videos.
- Reputation systems that reward constructive, accurate civic participation.
- Duplicate-report detection and escalation workflows for urgent public safety issues.

### One Person-One Account Future Implementation

Future versions should include account authenticity checks to reduce fake accounts and coordinated misinformation while still protecting citizen anonymity publicly.

Possible methods include:

- Email verification.
- Phone verification.
- Government ID verification for trusted verifier or community moderator accounts only.
- Device fingerprinting or anti-spam systems.
- Reputation scoring based on constructive participation and verified community signals.

The goal is to prevent one individual from creating many fake accounts, reduce manipulation, and protect civic conversations without publicly exposing a resident's real identity.

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
- Improve long-term leader accountability scoring across elected terms.

## MVP Disclaimer

The current MVP uses localStorage-based demo authentication and a localStorage mock backend. It is not production-secure. Passwords are stored locally for demo purposes only, and no real backend, secure authentication provider, database, or cloud media storage is used yet.

## Hackathon Context

This project is an MVP built for demo readiness. It intentionally uses localStorage to simulate users, sessions, reports, comments, likes, follows, reposts, and seeded data without requiring backend setup.

The goal is to demonstrate the core product idea: anonymous, location-first civic reporting with trust and accountability signals for Kenyan communities.

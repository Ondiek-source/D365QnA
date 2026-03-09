# D365 Mastery Quiz

> **Build your Dynamics 365 edge.**  
> Exam-format practice sessions for Dynamics 365 and Power Platform professionals — MCQ, drag-and-drop, and case study questions drawn from deep, research-backed question banks.

**Live →** [ondiek-source.github.io/D365QnA](https://ondiek-source.github.io/D365QnA/)

---

## Overview

D365 Mastery is a static, single-file web application designed to mirror the pressure and format of real Dynamics 365 and Power Platform certification exams. Every session is dynamically assembled from a shuffled question pool, scored to 1000 points, and timed at 65 minutes. No backend, no accounts, no tracking — everything runs in the browser.

The platform is structured around **topic groups** (e.g. D365 Customer Service App) containing granular **sub-topics** (e.g. Business Process Flows, SLAs, Entitlements). Each sub-topic maps to a dedicated JSON question bank.

---

## Features

### Exam Engine

- **Dynamic 60-question sessions** drawn from shuffled pools: 40 MCQ + 12 drag-and-drop + 8 case study sub-questions
- **65-minute countdown timer** with visual urgency as time runs low
- **1000-point dynamic scoring** — always totals 1000 regardless of pool size (60% MCQ / 30% DD / 10% CS)
- **700/1000 passing threshold** matching real exam difficulty
- **Stage-gated case studies** — scenario pinned in right panel, sub-questions contiguous, never interrupted

### Question Types

- **MCQ** — single correct answer with per-wrong-option explanations
- **Drag & Drop** — classify, match, or sequence items across zones; partial credit proportional to correct placements
- **Case Study** — multi-question scenarios based on a realistic business brief

### Session Management

- **Crash recovery** — unfinished sessions auto-saved to IndexedDB, resume prompt on next visit
- **Session history** — all completed sessions stored locally with score, date, topic, and time taken
- **Session replay** — review any past session answer-by-answer with full explanations
- **Flag system** — flag questions mid-session for review before submission

### Analytics

- **Wilson Score confidence intervals** for accuracy ratings
- **Tag-level weak area analysis** — identifies specific concept gaps from wrong answers
- **Mastery badges** per topic (Not Started → Learning → Proficient → Expert) based on average score
- **Global stats** — total sessions, questions answered, average score, personal best

### Answer Integrity

- **Fisher-Yates shuffle** applied to MCQ options at session build time — answer positions randomise each session
- Shuffled state stored per-question so replay and scoring remain consistent
- **No letter references** in question options — all options are self-contained descriptions

### Licence & Access

- **Free topics**: Delegation in Power Apps (always free)
- **Paid topics**: All others unlocked via one-off licence key
- Key format: `PPMA-XXXX-XXXX-XXXX` (djb2 hash validation, client-side)
- Licence persists in `localStorage` as `pp_mastery_licence_v1`
- Admin key available for testing

### Report-a-Question

- Every question has a **⚐ Report** button
- Modal with 7 issue categories + free-text comment (10–200 chars)
- Submits directly to the GitHub Issues API with labels (`question-report` + category)
- Review reports at `github.com/ondiek-source/D365QnA/issues`

### Guided Learning *(Beta)*

- W3Schools-style structured reading mode per topic
- Chapters with concept explanations, key facts boxes, warning/trap boxes, and reference tables
- **Quick Check** inline question at the end of each chapter
- Chapter completion tracked with progress bar and ✓ tick in sidebar
- Currently populated for: Business Process Flows (5 chapters), Delegation (2 chapters)

---

## Repository Structure

```bash
D365QnA/
├── index.html                  # Entire app — single self-contained file
└── Questions/                  # Question bank JSON files (capital Q — case-sensitive on GitHub Pages)
    ├── delegation.json         ✅ Complete  (33 MCQ / 10 DD / 3 CS)
    ├── bpf.json                ✅ Complete  (60 MCQ / 12 DD / 3 CS)
    ├── mdaconfig.json          ✅ Complete  (44 MCQ / 10 DD / 3 CS)
    ├── cases.json              🔨 Seeded    ( 9 MCQ /  3 DD / 1 CS)
    ├── queues.json             🔨 Seeded    ( 4 MCQ /  1 DD / 0 CS)
    ├── sla.json                🔨 Seeded    ( 2 MCQ /  1 DD / 1 CS)
    ├── entitlements.json       🔨 Seeded    ( 1 MCQ /  0 DD / 0 CS)
    ├── knowledge.json          🔨 Seeded    ( 2 MCQ /  1 DD / 1 CS)
    ├── rcrules.json            🔨 Seeded    ( 7 MCQ /  1 DD / 1 CS)
    ├── timeline.json           🔨 Seeded    ( 8 MCQ /  1 DD / 1 CS)
    └── usermgmt.json           🔨 Seeded    (10 MCQ /  2 DD / 2 CS)
```

**Target per bank:** 60 MCQ / 12 DD / 3 CS (15 sub-questions) = ~75 questions

---

## Topic Groups & Sub-Topics

### D365 Customer Service App

| Sub-Topic | Status | File |
| --- | --- | --- |
| Business Process Flows | ✅ Complete | `bpf.json` |
| Cases & Case Management | 🔨 In Progress | `cases.json` |
| Queues & Routing | 🔨 In Progress | `queues.json` |
| Service Level Agreements | 🔨 In Progress | `sla.json` |
| Entitlements | 🔨 In Progress | `entitlements.json` |
| Knowledge Articles | 🔨 In Progress | `knowledge.json` |
| Record Creation & Update Rules | 🔨 In Progress | `rcrules.json` |
| Timeline & Agent Experience | 🔨 In Progress | `timeline.json` |
| User Management & Security | 🔨 In Progress | `usermgmt.json` |

### Standalone Topics

| Topic | Status | File |
| --- | --- | --- |
| Delegation in Power Apps | ✅ Complete | `delegation.json` |
| Configure Data Model & UI | ✅ Complete | `mdaconfig.json` |
| Power Fx Formulas | 🔒 Planned | `powerfx.json` |
| Canvas App UI | 🔒 Planned | `canvasui.json` |
| Power Automate | 🔒 Planned | `automate.json` |
| Dataverse | 🔒 Planned | `dataverse.json` |

---

## Session Scoring

| Type | Count | Pts Each | Subtotal |
| --- | --- | --- |
| MCQ | 40 | 15 | 600 |
| Drag & Drop | 12 | 25 | 300 |
| Case Study sub-Qs | 8 | 12.5 | 100 |
| **Total** | | | **1000** |

When a bank has fewer questions than the target count, points are scaled up proportionally so the session always totals 1000.

---

## Question Bank JSON Schema

Each `.json` file follows this structure:

```json
{
  "mcq": [
    {
      "q": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "category": "topic-area",
      "tags": ["tag1", "tag2"],
      "explanation": "Why the correct answer is correct.",
      "wrongExplanations": {
        "1": "Why option B is wrong.",
        "2": "Why option C is wrong.",
        "3": "Why option D is wrong."
      },
      "msRef": "https://learn.microsoft.com/..."
    }
  ],
  "dragdrop": [
    {
      "instruction": "Classify / Match / Arrange...",
      "type": "classify | match | sequence",
      "items": ["Item 1", "Item 2"],
      "zones": ["Zone A", "Zone B"],
      "correctMapping": { "Item 1": "Zone A", "Item 2": "Zone B" },
      "explanation": "Explanation of the correct mapping.",
      "tags": ["tag1"],
      "msRef": "https://learn.microsoft.com/..."
    }
  ],
  "casestudy": [
    {
      "title": "Scenario Title",
      "scenario": {
        "title": "Company Name — Context",
        "background": "Company background...",
        "requirements": ["Requirement 1", "Requirement 2"]
      },
      "tags": ["tag1"],
      "msRef": "https://learn.microsoft.com/...",
      "questions": [
        {
          "q": "Sub-question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": 0,
          "explanation": "Explanation.",
          "wrongExplanations": { "1": "...", "2": "...", "3": "..." },
          "msRef": "https://learn.microsoft.com/..."
        }
      ]
    }
  ]
}
```

**Rules for question authors:**

- Never reference option letters in answer text (e.g. "Both A and B") — options are shuffled each session
- Every wrong option must have a `wrongExplanations` entry
- Every question must have an `msRef` linking to the source documentation
- Tags should be granular (e.g. `bpf-privileges` not just `security`) — they drive weak area analysis

---

## Local Development

The app uses `fetch()` to load question JSON files — this requires a web server (browsers block `fetch()` over `file://`).

```bash
# Python (any directory)
python -m http.server 8080

# Node.js
npx serve .
```

Then open `http://localhost:8080`.

The app will display a setup guide modal automatically if it detects `file://` protocol.

---

## Configuration

All key constants are in the `CONFIG` object at the top of `index.html`:

```javascript
const CONFIG = {
  SESSION_QUESTIONS: 60,
  SESSION_MINUTES:   65,
  PASSING_SCORE:     700,
  MAX_SCORE:         1000,
  POINTS:  { mcq: 15, dragdrop: 25, casestudy: 12.5 },
  COUNTS:  { mcq: 40, dragdrop: 12, casestudy: 8 },
  TOPICS:  [ /* topic definitions */ ],
  GROUPS:  [ /* group / sub-topic structure */ ],
};
```

**To add a new topic:**

1. Add a JSON bank to `Questions/your-topic.json`
2. Add an entry to `CONFIG.TOPICS` in `index.html`
3. If it belongs to a group, add the `id` to the group's `subtopics` array in `CONFIG.GROUPS`

**To add a new group:**
Add an entry to `CONFIG.GROUPS` — the home screen renders group cards automatically. Any topic ID in `subtopics` is hidden from the main home grid and shown only inside the group's sub-topic picker.

---

## Deployment

The app is deployed via GitHub Pages from the `main` branch root.

**Before deploying any update:**

- Replace `REPLACE_WITH_GITHUB_PAT` in `REPORT_CFG` with a valid fine-grained GitHub PAT (Issues: Read + Write on this repo only)
- Verify all new JSON files are committed to `Questions/` (capital Q)
- Test locally with a web server first

---

## Pending Configuration (Pre-Launch)

- [ ] Replace `REPLACE_WITH_GITHUB_PAT` in `REPORT_CFG` with real GitHub fine-grained PAT
- [ ] Update Gumroad product URL in `GUMROAD_URL` constant and set final price
- [ ] Update price references in unlock banner copy (`index.html` line ~2031)

---

## Roadmap

### Phase 1 — Complete CS App Module *(target: March 31 2025)*

- [ ] Build out all 8 seeded CS App banks to target depth (60 MCQ / 12 DD / 3 CS each)
  - [ ] Cases & Case Management
  - [ ] Queues & Routing
  - [ ] Service Level Agreements
  - [ ] Entitlements
  - [ ] Knowledge Articles
  - [ ] Record Creation & Update Rules
  - [ ] Timeline & Agent Experience
  - [ ] User Management & Security
- [ ] Guided Learning chapters for all CS App sub-topics
- [ ] Hotspot lab renderer — click-on-screenshot practical labs embedded in Guided Learning
- [ ] First 2–3 labs per completed sub-topic
- [ ] Deploy and open for users

### Phase 2 — Power Platform Module

- [ ] Power Fx Formulas bank
- [ ] Canvas App UI bank
- [ ] Power Automate bank
- [ ] Dataverse bank
- [ ] Create `Power Platform` group in `CONFIG.GROUPS`
- [ ] Guided Learning chapters per topic
- [ ] Clone and adapt CS App banks where topics overlap (e.g. security roles, BPF)

### Phase 3 — Platform & Monetisation

- [ ] Mobile drag-and-drop support (touch events for DD questions)
- [ ] Gumroad integration — real product page, pricing, licence key fulfilment
- [ ] Pricing revision: lifetime access ~$9–12, monthly ~$6
- [ ] Marketing: D365 community forums, LinkedIn, direct partner outreach
- [ ] Certification pathway picker — user selects target cert (PL-200, MB-200, etc.), app filters relevant topics

### Phase 4 — Multi-Cert Support

- [ ] Per-certification topic bank variants (clone + trim/extend pattern)
- [ ] Certification selector on home screen
- [ ] Track sessions per certification separately
- [ ] Potential: AI-powered question generation for new topic coverage

---

## Known Limitations

- **Flow Step (Preview)** BPF questions reflect documented behaviour as of early 2025; this feature has been in preview since 2019 and may have changed
- **Steps per BPF stage** — no documented limit exists in Microsoft's official overview page; questions testing "10 steps max" have been removed
- Session history and licence key are stored in the user's browser only — clearing site data will reset both
- The report-a-question feature requires a valid GitHub PAT to be set in `REPORT_CFG` before going live

---

## Tech Stack

| Layer | Technology |
| --- | --- | --- |
| App | Single-file HTML/CSS/JS — no build step, no framework |
| Storage | IndexedDB (sessions + draft recovery), localStorage (licence key) |
| Fonts | Syne (display), DM Mono (code/UI), Space Grotesk (body) via Google Fonts |
| Deployment | GitHub Pages |
| Question reports | GitHub Issues API |
| Payments | Gumroad (planned) |

---

## Author

Built by **Ondiek** — D365 Technical Specialist, Microsoft Gold Partner, Nairobi.  
Questions, feedback, or partnership enquiries: raise a GitHub issue or reach out directly.

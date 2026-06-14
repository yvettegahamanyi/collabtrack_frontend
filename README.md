# CollabTrack Frontend

Next.js frontend for **CollabTrack** — CollabTrack is a collaboration analytics system that helps make individual contributions in online student group work more visible, trackable, and fairly evaluated.

**Colab notebook:** [Scoring Modal Notebook](https://colab.research.google.com/drive/1x8Tya-B6-TqggDVnVJf2u85wK_biDo7Z?usp=sharing)

**Backend repository:** [collabtrack_backend](https://github.com/yvettegahamanyi/collabtrack_backend)

**Designs:** [CollabTrack on Figma](https://www.figma.com/design/8ABtyvdgwjShvJcZnGHaVw/CollabTrack?node-id=0-1&t=FrTbk1dqAEqgkY1S-1)

**Demo video:** [Google Drive Video](https://drive.google.com/file/d/1WiNtncC6x5H_uxOI730WvOxP07xOC8eM/view?usp=sharing)

---

## Deployment

The frontend, backend, and database are deployed on **[Railway](https://railway.app)**.

| Service                   | Hosted URL                                                |
| ------------------------- | --------------------------------------------------------- |
| Frontend                  | https://collabtrackfrontend-production.up.railway.app     |
| Backend API documentation | https://collabtrackbackend-production.up.railway.app/docs |

---

## Tech stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Data fetching:** TanStack Query
- **State:** Zustand (auth)
- **HTTP client:** Axios
- **Forms & validation:** React Hook Form, Zod

---

## Project structure

```
collabtrack-frontend/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin dashboard
│   ├── instructor/               # Instructor routes (groups, settings)
│   ├── student/                  # Student routes (groups, settings)
│   ├── invite/[token]/           # Group invite acceptance
│   ├── login/                    # Login
│   ├── register/                 # Registration
│   ├── onboarding/               # Role selection after signup
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── auth/                     # Auth layout wrappers
│   ├── brand/                    # Logo and branding
│   ├── groups/                   # Group list, detail tabs, integrations UI
│   ├── layout/                   # Dashboard shell, headers, user menu
│   ├── providers/                # Theme, React Query providers
│   ├── settings/                 # Settings and integrations cards
│   └── ui/                       # shadcn/ui primitives
├── docs/
│   └── integrations-backend.md   # Backend API contract for GitHub/Google integrations
├── hooks/                        # Legacy/shared hooks
├── lib/
│   ├── api-client.ts             # Axios instance and API helpers
│   ├── auth.ts                   # Auth mapping utilities
│   ├── constants.ts              # Routes, roles, app constants
│   ├── navigation.ts             # Role-aware navigation helpers
│   └── query-keys.ts             # TanStack Query cache keys
├── service/                      # API services and React Query hooks
│   ├── auth.service.ts
│   ├── groups.service.ts
│   ├── integrations.service.ts
│   ├── participation.service.ts
│   ├── use-auth.ts
│   ├── use-groups.ts
│   ├── use-integrations.ts
│   └── use-participation.ts
├── stores/
│   ├── auth-store.ts             # Auth token and user session
│   └── ui-store.ts               # UI state
└── types/                        # Shared TypeScript types
```

### Key routes

| Route                      | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| `/login`, `/register`      | Authentication                                              |
| `/onboarding`              | Role selection (student / instructor)                       |
| `/student/group`           | Student group list                                          |
| `/student/group/[groupId]` | Group detail (overview, members, contribution, transcripts) |
| `/student/settings`        | Account settings and GitHub/Google integrations             |
| `/instructor/group`        | Instructor group list (read-only)                           |
| `/instructor/settings`     | Instructor account settings                                 |
| `/invite/[token]`          | Accept a group invitation                                   |

---

## Environment setup

### Prerequisites

- **Node.js** 20+
- **pnpm** (recommended) or npm
- Running [CollabTrack backend](https://github.com/yvettegahamanyi/collabtrack_backend/tree/main) (local or deployed)

### Environment variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_API_URL=https://collabtrackfrontend-production.up.railway.app
```

| Variable              | Description                      |
| --------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL for the CollabTrack API |

---

## Getting started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `pnpm dev`   | Start development server |
| `pnpm build` | Production build         |
| `pnpm start` | Start production server  |
| `pnpm lint`  | Run ESLint               |

---

## Related documentation

- [Backend repository](https://github.com/yvettegahamanyi/collabtrack_backend/tree/main)
- [Figma designs](https://www.figma.com/design/8ABtyvdgwjShvJcZnGHaVw/CollabTrack?node-id=0-1&t=FrTbk1dqAEqgkY1S-1)

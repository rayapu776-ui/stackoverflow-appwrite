# StackFlow — Developer Q&A Community

A full-stack Stack Overflow-inspired Developer Q&A platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Appwrite** (`appwrite` & `node-appwrite`).

Users can register and sign in, ask technical questions with tags and optional image attachments, post and delete answers, discuss via comments, upvote or downvote questions and answers, and build community reputation.

---

## Features

- **Authentication & Session Management**: User registration, login, logout, and persistent session hydration powered by Appwrite Account and Zustand (`persist` + `immer`).
- **Questions Feed, Search & Tag Filtering**: Browse paginated questions, search by keywords from the navbar, filter by tags, and view Top Contributors on the home page.
- **Ask Questions with Attachments**: Submit questions with title, detailed description, comma/tag inputs, and optional image uploads stored in Appwrite Storage.
- **Answers & Comments**: Post and delete answers on questions, plus add/delete comments on both questions and answers.
- **Voting & Reputation System**: Upvote/downvote questions and answers with server-side vote toggling and automatic author reputation updates stored in Appwrite user preferences.
- **User Profiles**: Dedicated user profile pages displaying reputation metrics and authored questions/answers (`/users/[userId]/[userSlug]`).
- **Auto-Provisioned Appwrite Schema**: Server startup hook (`src/instrumentation.ts`) automatically creates the Appwrite database, collections, attributes, indexes, and storage bucket if they do not exist yet.
- **Responsive UI & Custom 404s**: Mobile-friendly navbar drawer, inline success/error feedback states, and custom `not-found.tsx` pages globally and for `/questions` and `/users`.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js `16.4.4` (App Router, Turbopack, Cache Components, React Compiler) |
| Language | TypeScript `5`, React `19.3.0` |
| Backend / BaaS | Appwrite (`appwrite` client SDK + `node-appwrite` server SDK) |
| State Management | Zustand `5` + Immer |
| Styling & UI | Tailwind CSS v4, `@base-ui/react`, `shadcn`, `lucide-react`, `tabler-icons-react` |
| Typography | `Inter` & `JetBrains Mono` (`next/font/google`) |

---

## Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx              # Login page
│   │   └── register/page.tsx           # Registration page
│   ├── api/
│   │   ├── answer/route.ts             # POST / DELETE answer & update author reputation
│   │   ├── question/route.ts           # DELETE question & attachment
│   │   └── vote/route.ts               # POST vote toggle & reputation updates
│   ├── questions/
│   │   ├── [quesId]/[quesName]/page.tsx # Question detail, answers, comments & votes
│   │   ├── ask/page.tsx                # Create question form
│   │   ├── not-found.tsx               # Questions 404 page
│   │   └── page.tsx                    # Searchable, filterable, paginated questions feed
│   ├── users/
│   │   ├── [userId]/[userSlug]/page.tsx # User profile & activity
│   │   └── not-found.tsx               # Users 404 page
│   ├── globals.css                     # Tailwind CSS v4 theme & base typography
│   ├── layout.tsx                      # Root layout, fonts & global metadata
│   ├── not-found.tsx                   # Global 404 page
│   └── page.tsx                        # Home page with hero, latest questions & top contributors
├── components/                         # Navbar, QuestionCard, QuestionDetailView, Forms, Votes, Comments
├── lib/                                # Server queries (queries.ts) & helpers (utils.ts)
├── models/
│   ├── client/config.ts                # Browser Appwrite SDK client
│   ├── server/                         # Node Appwrite SDK client & auto-setup scripts
│   └── name.ts                         # Database, collection & storage bucket constants
├── store/Auth.ts                       # Zustand authentication & session store
├── env.ts                              # Typed environment variable accessors
└── instrumentation.ts                  # Runs Appwrite DB & storage setup on server boot
```

---

## Appwrite Schema Constants

Defined in `src/models/name.ts` and provisioned automatically via `src/instrumentation.ts`:

- **Database**: `main-stackoverflow`
- **Collections**: `question`, `answer`, `comment`, `vote`
- **Storage Bucket**: `question-attachment`

---

## Getting Started

### 1. Prerequisites

- Node.js 20+ and npm
- An [Appwrite](https://appwrite.io/) project (Cloud or self-hosted) with an API Key granted Database, Storage, and Users read/write scopes

### 2. Clone & Install

```bash
git clone https://github.com/rayapu776-ui/stackoverflow-appwrite.git
cd stackoverflow-appwrite
npm install
```

### 3. Configure Environment Variables

Copy `.env.sample` to `.env` and fill in your Appwrite credentials:

```bash
cp .env.sample .env
```

```env
NEXT_PUBLIC_APPWRITE_HOST_URL=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_appwrite_api_key_here
```

> Make sure to add your local domain (`localhost`) and production domain as Web Platforms in your Appwrite Project **Settings → Platforms** so browser requests succeed.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. On first server start, `src/instrumentation.ts` initializes the Appwrite database, collections, and storage bucket automatically.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production application |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint across the codebase |

---

## Deploying on Vercel

1. Push your repository to GitHub and import it into [Vercel](https://vercel.com/).
2. Keep the default **Build & Output Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (leave blank/default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. Under **Project Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_APPWRITE_HOST_URL`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
   - `APPWRITE_API_KEY`
4. Add your Vercel domain (`*.vercel.app` or custom domain) as a **Web Platform** in Appwrite Console, then deploy.

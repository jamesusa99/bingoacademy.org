# Bingo AI Academy

React + Vite web app for Bingo AI Academy — AI courses and authoritative competitions.

## Tech Stack

- React 19
- Vite 7
- React Router 7
- Tailwind CSS 4

## Environment variables

Required for live CMS/admin data (site still loads without them, using built-in fallbacks):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

Copy `.env.example` to `.env.local` for local development (or use the project’s `.env.local` if already provisioned).

### Railway

Production host: `https://bingoacademyorg-production.up.railway.app` (listens on `$PORT`, default **8080**).

In the Railway service → **Variables**, set:

| Variable | Value |
|----------|--------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon** (public) key |

Redeploy after changing variables so Vite bakes them into the build. The repo includes `railway.toml` (`npm run build` → `npm run start` serves `dist/` as an SPA).

### Vercel

Same `VITE_*` keys under Project → Settings → Environment Variables, then redeploy.

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint

## License

Private.

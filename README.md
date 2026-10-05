# Motion Library

Browser-based editor for 200+ interactive UI animations. Vite, React 19, TypeScript, Tailwind 4, motion, Zustand, Supabase.

## Develop

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Project Settings → API.
3. Apply the migration in `supabase/migrations/0001_init.sql`:
   - Via the Supabase CLI: `supabase link --project-ref <ref>` then `supabase db push`.
   - Or paste the file's contents into the SQL editor in the Supabase dashboard and run it.
4. In Authentication → Providers, enable Google (add your OAuth client ID/secret) and Email.
5. The first user who should be an admin needs their `profiles.role` set to `'admin'` manually in the table editor — new signups default to `'user'`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — typecheck and build for production
- `npm run lint` — lint
- `npm run check-sizes` — warn if any animation chunk exceeds 250 KB gzipped

## Adding an animation

Add a folder under `src/animations/<slug>/` with `manifest.ts`, `params.ts`, and `index.tsx`. It's picked up automatically — no registry to edit. See `src/animations/_core/` for the manifest and param-schema contracts.

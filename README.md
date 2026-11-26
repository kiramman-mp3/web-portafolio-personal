# madebyjohan.xyz

My personal portfolio, in Spanish and English: experience with real clients, projects with case studies, services, education and contact.

**Live:** https://madebyjohan.xyz · English version at https://madebyjohan.xyz/en

## Stack

- **Frontend:** Angular 22 with SSR and prerendering, standalone components and signals.
- **API:** Express 5 + Prisma 7 + PostgreSQL. It serves projects, services and certificates; admin routes require an API key.
- **Infra:** a homelab with Docker Compose and Cloudflare Tunnel. A cron job checks `main` every 5 minutes, rebuilds, runs a health check and rolls back if it fails.

## What's interesting about it

- **i18n without extra libraries:** the language comes from the URL (`/` Spanish, `/en` English). One service handles the text, links, `lang`, canonical and `hreflang` per page (`apps/frontend/src/app/shared/i18n`).
- **Editorial curation separate from the data:** the API returns every project, and `shared/content/curation.ts` decides which are featured. It also sets their order and the role, context and case study (problem, solution, technical decisions and result) in both languages.
- **CV in LaTeX:** `cv/cv-es.tex` and `cv/cv-en.tex` share the `cv/johancv.sty` style (sidebar with photo). `node cv/build.mjs` compiles them with [Tectonic](https://tectonic-typesetting.github.io) and copies the PDFs to `apps/frontend/public` (one page each). They also compile on Overleaf with XeLaTeX.

## Development

```bash
npm install
npm run dev:api        # API at http://localhost:4000 (needs DATABASE_URL)
npm run dev:frontend   # Angular at http://localhost:4200
```

To use the production API from local: `localStorage.setItem('use_remote_api', 'true')`.

```bash
cd apps/frontend
npx ng test --watch=false   # unit tests (Vitest)
npx ng build                # SSR build + prerendering of the ES and EN routes
node ../../cv/build.mjs     # compiles the LaTeX CVs into apps/frontend/public (needs Tectonic)
```

## License

MIT

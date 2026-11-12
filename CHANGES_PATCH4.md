# Patch 4 - loading indicators, success/failure messages, redirect after review

Copy `src/` over your project (Replace). No SQL, no new packages.

| File | What changed |
|---|---|
| `src/components/LoadingBar.tsx` (new) | One global loader: a thin bar across the top whenever a link is clicked or a form is submitted, and the clicked button shows a spinner and ignores extra clicks (no double submit). Stops when the new page arrives (or after 20 s). |
| `src/app/layout.tsx` | Adds `<LoadingBar />` once, so it works on every page (login, review, admin, product). |
| `src/app/loading.tsx` (new) | Spinner shown by Next.js while a page is being prepared (every page change and redirect). |
| `src/components/Flash.tsx` | Now a toast: green for success, red for failure, auto-hides (5 s success, 10 s failure), has a close button, and removes `?ok=` / `?error=` from the address so a refresh does not repeat it. Every existing page that already used `<Flash>` (admin, review, expert) gets it automatically. |
| `src/app/error.tsx` (new) | If something unexpected breaks, a failure message with a "Try again" button instead of a blank page. |
| `src/app/actions/review.ts` | After a normal (public) user submits a review they are sent to the list page of that category (`/review?category=<slug>`) with the toast "Your review was saved. Thank you!". |
| `src/app/globals.css` | Styles for the loading bar, button spinner, toast and loading page. |

Notes
- Field agents are NOT redirected to the list: after a field review they stay on the form because the confirmation link and WhatsApp button are shown there. Tell me if you want them redirected too.
- The `/expert` form lives in its own frame and keeps its own save messages (it already shows "saved" / error text); the toast does not appear inside it.

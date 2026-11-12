# Nexiz Review Portal

A login-protected portal where users review the software they use. Built in the **same stack as the Nexiz
website**: Next.js 15 (App Router) + TypeScript + Supabase + plain CSS, deployable on Cloudflare (OpenNext).

* **Login page**, no public sign-up. An **admin** is created first (by the seed script).
* **Admin** can create **roles** and **users** (every user has a `role_id`), and do full **CRUD** on
  **categories** and **software (projects)**, including **images**.
* A seeded **expert** role exists. An expert logs in, lands on the review screen, and can upload
  and replace images for categories and software.
* After login the review screen follows your design: **1 Choose Category -> 2 Select Software -> 3 Write Review**
  (stars, "how long have you used it", text or voice review, "Already reviewed / Not yet reviewed").
* Everything shown comes from the database. English and Arabic (RTL) toggle in the header.

---

## 1. How the pieces fit

| Who | Lands on after login | Can do |
|---|---|---|
| **admin** (system role) | `/admin` dashboard | everything: roles, users, categories, software, images, reviews |
| **expert** (system role) | `/review` | write reviews + upload/replace images (categories & software) |
| any role you create | `/review` | exactly the permissions you tick for that role |

Permissions (tick them per role in **Admin -> Roles**):
`categories.manage`, `software.manage`, `images.manage`, `users.manage`, `roles.manage`, `reviews.write`.

Assumptions I made (tell me if any is wrong):
* "projects" = the **software** items shown in step 2 of your design (table `rv_software`).
* "expert will have a look on that" = the expert role manages **images** (permission `images.manage`).
* Only the admin lands on the admin dashboard first. All other roles land on the review screen. They can reach
  the admin pages their permissions allow from the avatar menu.

## 2. Requirements

* Node.js 20 or newer (tested with Node 22) and npm
* A **new** Supabase project (free tier is fine). Do not reuse Nexiz's production project.

## 3. Step by step setup

### Step 1 - Create the Supabase project
1. https://supabase.com -> New project. Save the database password somewhere safe.
2. Open **Project Settings -> API**. Copy:
   * **Project URL** -> `SUPABASE_URL`
   * the **secret / service_role key** -> `SUPABASE_SECRET_KEY` (server only, never put it in browser code)

### Step 2 - Create the tables
1. Supabase -> **SQL Editor -> New query**.
2. Paste the whole file `supabase/schema.sql` and press **Run**.
3. Check **Table Editor**: `rv_roles`, `rv_users`, `rv_categories`, `rv_software`, `rv_reviews`.
4. Check **Storage**: a bucket named `nexiz-images` should exist and be **public**.
   If it is missing, create it by hand (name `nexiz-images`, tick *Public bucket*).

### Step 3 - Configure the environment
```bash
cp .env.example .env.local        # Windows PowerShell: copy .env.example .env.local
```
Fill `.env.local`:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SECRET_KEY=...
SUPABASE_STORAGE_BUCKET=nexiz-images
SESSION_SECRET=<48+ random chars>
ADMIN_EMAIL=you@company.com
ADMIN_PASSWORD=a-strong-password
ADMIN_NAME=Your Name
```
Make a `SESSION_SECRET`:  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### Step 4 - Install
```bash
npm install
```

### Step 5 - Create the roles and the first admin
```bash
npm run seed            # creates roles "admin" + "expert" and the first admin user
npm run seed:sample     # same, plus demo categories and software (optional)
```
It is safe to run again. It never overwrites or duplicates data.

### Step 6 - Start the app
```bash
npm run dev             # http://localhost:3000
```
Production style: `npm run build` then `npm start`.

## 4. First use - walkthrough

1. Open http://localhost:3000 -> log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. You land on **/admin**.
2. Avatar menu -> **Change password** (do this first).
3. **Admin -> Roles**: you will see `admin` and `expert`. Create more roles if needed (name + tick permissions).
4. **Admin -> Users -> Create a user**: name, email, password, choose **role = expert**. (The user stores the role id.)
5. **Admin -> Categories** and **Software**: add items and upload images (PNG/JPG/WEBP up to 2 MB).
   Without an image a coloured letter tile is shown.
6. Log out, log in as the expert: you see the review screen. Choose a category, a software, give stars,
   duration and text, **Submit**. Re-opening a software you reviewed shows your review and the button becomes **Update**.
7. As the expert open avatar menu -> **Admin panel**: only Categories and Software appear, each row has
   **Upload image**. Experts cannot add/delete categories or manage users and roles.

## 5. Project structure

```
supabase/schema.sql          tables, security (RLS on), storage bucket
scripts/seed.ts              roles + first admin (+ sample data)
scripts/auth.test.ts         unit tests for password + session code
src/middleware.ts            no valid session cookie -> /login
src/lib/auth/*               password hashing (bcryptjs), signed session cookie (jose), current user + permission checks
src/lib/permissions.ts       the list of permissions and the system roles
src/lib/data.ts              read queries for the review screen
src/lib/storage.ts           image upload/removal (Supabase Storage)
src/lib/i18n.ts              English / Arabic texts for the review screen
src/app/actions/*.ts         all writes (server actions): auth, review, admin CRUD
src/app/login, review, account, admin/*   pages
src/components/*             stepper, tiles with search, review form (stars, pills, voice), header
```

## 6. Database tables

| Table | Purpose |
|---|---|
| `rv_roles` | role name, description, `permissions text[]`, `is_system` |
| `rv_users` | email, name, `password_hash`, **`role_id`**, active flag, failed-login counter |
| `rv_categories` | slug, `name_en`, `name_ar`, `image_url`, sort order |
| `rv_software` | `category_id`, slug, name, website, description, `image_url` |
| `rv_reviews` | `software_id`, `user_id`, rating 1-5, duration, comment. One review per user per software |

The `rv_` prefix avoids clashing with tables in Nexiz's own database (`categories`, `reviews`, ...).

## 7. Security notes

* Passwords are hashed with bcrypt. Login is locked for 15 minutes after 5 wrong attempts (stored in the DB, so it works across servers).
* The session is a signed, `httpOnly` cookie valid for 8 hours. Role and active status are re-read from the DB on every request, so a changed role or a disabled user takes effect immediately.
* All permission checks run on the server inside every action and page (the middleware is only a first gate).
* Row Level Security is ON with no policies, so the public anon key can read nothing. Only the server (secret key) touches the data.
* Safeguards: you cannot delete or deactivate yourself, or remove/demote the last active admin. System roles cannot be deleted.
* Uploads are limited to PNG/JPG/WEBP, 2 MB. All text is rendered escaped.

## 8. Deploy

* **Cloudflare** (same as the Nexiz site): set secrets `SUPABASE_SECRET_KEY`, `SESSION_SECRET` and variables
  `SUPABASE_URL`, `SUPABASE_STORAGE_BUCKET`, then `npm run deploy`. Config is in `wrangler.jsonc` / `open-next.config.ts`.
* **Any Node host** (Vercel, VPS): set the same environment variables, `npm run build`, `npm start`.
* Run `npm run seed` once against the production Supabase project (with that project's values in `.env.local`).

## 9. Commands

| Command | What it does |
|---|---|
| `npm run dev` | development server |
| `npm run build` / `npm start` | production build / run |
| `npm run typecheck` | TypeScript check |
| `npm test` | unit tests (password, session) |
| `npm run seed`, `npm run seed:sample` | roles + first admin, optional demo data |

## 10. What was tested, and what was not

Tested: TypeScript check, production build, unit tests, `schema.sql` on a real PostgreSQL 16, and a full
browser run (Playwright) against a local PostgreSQL + PostgREST: bad login, admin login, create role, create user,
duplicate email error, create category with image, expert login, 3-step review flow, review update, expert permission limits,
image upload by expert, Arabic/RTL switch.

**Not tested:** real Supabase Storage (the browser run used a small stand-in for storage), the Cloudflare deploy,
and voice input (needs Chrome/Edge with microphone permission). Please run Steps 1-6 once on your Supabase project.

## 11. Known limits (easy follow-ups)

* The admin screens are English only. The login and review screens are English + Arabic.
* No "forgot password" email. An admin resets a password in Admin -> Users -> Edit.
* The review screen does not show average ratings or other users' reviews yet.
* No image cropping. Square logos work best.

## 12. Troubleshooting

| Problem | Fix |
|---|---|
| `SESSION_SECRET must be set...` | put a 32+ character value in `.env.local` and restart |
| `SUPABASE_URL is required` | `.env.local` missing or not in the project root |
| Login always says invalid | run `npm run seed`; check `ADMIN_EMAIL` spelling; wait 15 min if locked |
| "relation rv_users does not exist" | run `supabase/schema.sql` (Step 2) |
| Image upload fails | bucket `nexiz-images` must exist and be public; file must be PNG/JPG/WEBP under 2 MB |
| Category cannot be deleted | it still has software; delete or move the software first |

# Nexiz - phase 2 changes (client answers of 15 Oct 2026)

This zip contains **every file changed since your original upload** (phase 1 + phase 2). Copy `src/` over your project (same paths), plus `vercel.json` and the SQL.
Checked with a full TypeScript compile and a simulated-browser test of the expert page. **Not run against your real Supabase or an email provider** - please test the steps at the bottom.

## 1. Install (in this order)
1. Supabase SQL editor: run `sql/001_change_request.sql`, `002_fix_slugs.sql`, `003_unified_reviews_view.sql`, then `004_phase2.sql`. (Skip 001/002 if you already ran them.)
2. Copy `src/` and `vercel.json` into the project.
3. Set the env vars from `.env.example` (Vercel > Settings > Environment Variables). New ones: `NEXT_PUBLIC_SITE_URL`, `EMAIL_API_KEY`, `EMAIL_FROM`, `EMAIL_TEST_RECIPIENT`, `CRON_SECRET`.
4. Deploy. No new npm packages are needed (fonts use `next/font`).

## 2. What was built, by client item

### Product page - `/product/<slug>` (public, no login)
- `src/app/product/[slug]/page.tsx` (page), `src/lib/product.ts` (all the maths), `src/lib/i18n-product.ts` (EN/AR text), `src/components/PublicHeader.tsx`.
- Blocks, in the client's order: sticky header; rating summary; Saudi compliance chips; at a glance; reviews with filters; who should not buy; what reviewers moved to; footer.
- Rules implemented: expert and user scores never blended; under 5 reviews = "too few reviews to score" and no number; compliance chip shows a status only at 5+ answers, otherwise "No data yet" (chip is never hidden); "moved to" only at 5+ leavers; badges are outlines; **no names, emails, phones or employers are ever shown**; role, size and badge always are.
- `src/middleware.ts`: `product`, `verification`, `privacy`, `api/cron` are now reachable without login.
- `src/components/TrustBar.tsx` and `Footer.tsx` added to the product page, `/review`, `/verification`, `/privacy`. `/verification` explains the rules above; `/privacy` is a **placeholder** until Nexiz supplies the PDPL text.

### Approval screen - `/admin/moderation`
- `src/app/admin/moderation/page.tsx`, `src/app/actions/moderation.ts`, new permission `reviews.moderate` (`lib/permissions.ts`, `lib/auth/current-user.ts`, admin menu in `app/admin/layout.tsx`). Admin role has it automatically; for other roles tick it on the Roles page.
- Tabs Pending / Approved / Rejected. Escalated first, then oldest first, with hours-waiting and a "past 48h" warning.
- Actions: Approve, Reject (reason from a fixed list, emailed to the author), Flag vendor dispute. **No text editing exists.**
- Users: publish automatically (`actions/review.ts`) unless escalated: all ratings 1 or all 5 (needs 3+ ratings), or the 3rd review from one account within an hour. Duplicate account+product and text under 20 characters were already blocked.
- Experts: every review starts `pending` (`lib/expert.ts`). The expert form re-saves all rows on each autosave, so a content hash keeps an approval only while the text is unchanged; an edit sends it back to pending.
- Field reviews: stay pending and unverified until the respondent confirms; the moderation screen refuses to approve an unverified field review.
- Expert is emailed when approved ("your review is live"). Everyone is emailed the reason when rejected.
- All public numbers count only `verified = true` and `status = 'approved'` reviews.

### Email confirmation - to your test address
- `src/lib/notify/index.ts` (channel setting `NOTIFY_CHANNEL`, SMS/WhatsApp API can be added as adapters later), `email.ts` (Resend), `templates.ts` (EN+AR emails).
- With `EMAIL_TEST_RECIPIENT=dipanshuraj7217@gmail.com` **every** email goes to that address, marked [TEST], with the intended recipient in the body. Delete that variable for production.
- Field review with an email contact: email sent automatically. With a mobile number: the agent sees a **"Send on WhatsApp"** button (pre-filled wa.me link). The link also shows on screen.
- `src/app/confirm/page.tsx` + `actions/confirm.ts`: opening the link only shows a "Confirm my review" button; **verification happens on the tap** (so mail scanners cannot verify by accident).
- Without `EMAIL_API_KEY` nothing is sent; the link is printed in the server log and shown to the agent.

### Automatic go-live
- `src/app/api/cron/golive/route.ts` + `vercel.json` (runs 01:00 UTC nightly, needs `CRON_SECRET`). Opens a category at 5+ products and 3+ published reviews. **Never closes one.** Restaurant sub-tags count toward POS & Restaurants.
- Admin > Categories: "Force live" override checkbox. A live category that is still thin shows "Only N reviews so far" on its tile. Tiles show products and reviews counts.

### Form timing
- Public form: `components/ReviewForm.tsx` sends total time + time per question. Expert form: same, in `lib/expert-portfolio-html.ts`, stored on submit. Table `rv_form_timing`; the median/slowest-field queries are at the bottom of `sql/004_phase2.sql`.

### "Why three reviews" panel (the client's copy file)
- `lib/expert-portfolio-html.ts`: panel above Section 1 (collapsible, not dismissible), the four progress states (bar now out of 3), the "good start" line after the first submit, the thank-you state after three. EN + AR. Three is a goal, not a gate: one review can still be submitted.
- New reviews copy company, industry, size, country and city from the first review, so "the next one only needs the system details" is true.

### Design (client's design system)
- `src/styles/tokens.css` (their tokens, light + dark), imported by `globals.css`, whose old variable names now point at the tokens, so existing screens pick up the new colours without rewriting every rule. IBM Plex Sans Arabic/Mono via `next/font` in `app/layout.tsx`.
- All emoji removed (`components/Icons.tsx` line icons). Gold stars replaced by ink stars. **Default language is now Arabic** (`lib/i18n.ts`).
- The expert page keeps its own stylesheet; only the new panel uses the tokens. Dark mode tokens exist but there is no toggle yet.

## 3. Not built / for you to decide
- **Chatbot (item 6): not built.** The client said to hold it until product pages carry reviews, and a chatbot with no data to answer from does harm. Place it on the product and category pages only when you do.
- `/privacy` text and the contact address (`NEXT_PUBLIC_CONTACT_EMAIL`, default hello@nexiz.ai) need real values.
- No vendor column existed: added `rv_software.vendor_name` (empty until filled; add a field in Admin > Software if you want to edit it).
- Compliance chip rule when answers differ: most common answer, and the more cautious one on a tie. Confirm with the client.
- Product-page "Role" filter only matches user reviews (experts use professional roles, a different list). Company-size for experts is mapped to the public buckets by reading the number in the option label.
- Headline recommend % mixes user and expert reviews (it is a rate, not a score). Confirm.
- The panel copy promises "a real comparison under your name" - there is no expert public profile page yet.
- Digits: the expert page keeps its existing Arabic-Indic digits for the progress text (consistent with its section numbers).
- Resend's free test sender (`onboarding@resend.dev`) only delivers to the account owner's own email. Use the same address for the Resend account, or verify the nexiz.ai domain.

## 4. Test checklist
1. Run SQL, deploy. `/review` shows 6 categories with counts. Language starts in Arabic.
2. Admin > Users: tick Field agent. Collect a review with your email as the contact: email arrives at the test address; open it, tap Confirm. It must say Verified only after the tap.
3. Submit an expert review; it shows in `/admin/moderation`; approve it; it appears on `/product/<slug>` once the profile is submitted.
4. Submit a public review with all ratings 5 (and a sub-rating or two): it should land in Pending as escalated.
5. Visit `/api/cron/golive` with header `Authorization: Bearer <CRON_SECRET>`; it returns the list of categories it opened.
6. Time one public and one expert review, then run the timing queries.

# Everything changed since your original src.zip (cumulative)

Unzip over your project (keep the folder names). Then:
1. Run `db/expert_review_v2.sql` once in the Supabase SQL editor (before deploying).
2. Add the keys in `.env.oauth.example` to your environment (Google / LinkedIn). Without them the buttons simply do not show.
3. `npm run dev` / redeploy.

No new library was added (Google and LinkedIn use `jose`, already in the project).

## A. Public review screen and earlier requests
- `/review` opens without login; logged-out visitors can review (saved as "pending", owned by a disabled guest account that is created automatically).
- `/products`: "Give Feedback" button for logged-out visitors (go to `/review`).
- Admin Categories: "reviews needed" is 1 instead of 3 (`GO_LIVE_MIN_REVIEWS`).

## B. Expert change request (PDF), by section
| PDF | Done |
|---|---|
| 1 Order | `/expert` is now: Step 1 The system, (sign-in), Step 2 Your experience (12 items in the PDF order), Step 3 Ratings and submit, then "Complete your profile / later". Profile is a separate page (`/expert/frame?view=profile`). |
| 2.1 Software list | Searchable (Arabic and English names), filters All / POS / ERP / Accounting, "My software isn't listed". Typed names go to **Admin > Typed software**; the review links to a product only after Match / Create. |
| 2.2 Functions | Per category list, nothing selected, Select all, Other (specify), flagged to the moderator when every function is selected. Lists are editable in **Admin > Function lists**. |
| 2.3 Integrations | Several entries (name from list or typed, purpose, how it worked, experience) and "I have not used any integrations" (clears and disables; adding an entry unticks it). |
| 2.4 Buttons | Next, Save and continue later (every step), Submit review for moderation. The old "Review my profile" button is gone. |
| 2.5 Status | Draft / Submitted for moderation / Published / Rejected (with reason, editable and resubmittable) on every review. Review status, publication, profile completion and verified-expert status are separate (profile completion is computed, nothing writes verified-expert, a public review no longer needs a "submitted" profile). |
| 2.6 Save indicator | Device only / Saving / Saved HH:MM (only after the server answers) / Retry. |
| 2.7 Validation | Required fields only, message under the field, focus on the first, clears when fixed, meaningless short text blocked (client and server). |
| 2.8 Progress | Two separate indicators (review progress with 3 slots showing product + status, profile completion). Three clickable sticky step chips (done / in progress / not started). |
| 2.9 Preview | Review preview in the journey, profile preview on the profile page, "This appears on the [product] page once published." under text fields. |
| 2.10 Profile | No "Optional" labels, certifications note, separate certification name / issuer, URL never required, "LinkedIn profile URL", searchable role/qualification fields that accept your own value, styled photo uploader with preview. |
| 2.11 QR | Removed. |
| 2.12 / 4.3 | "Three reviews" panel and the four progress texts from the PDF. |
| 3 Sign-in | After step 1 for signed-out users; Google, LinkedIn, existing sign-in; answers kept on the device for 7 days, moved to the account as a Draft and the device copy deleted after the server confirms; failed/cancelled sign-in keeps answers and shows the message; "Clear my answers from this device". One account per verified email. Name/photo from the provider only prefill the profile; LinkedIn URL stays manual. |
| 4 Text | Words list, Western numerals, Arabic body one step larger (16/28 vs 15/23), Latin words isolated left-to-right in Arabic. |
| 5 Median time | Shown on the Admin dashboard (needs real submissions first). |

## C. Please read: decisions and limits
- **Arabic wording**: the Arabic in the PDF copies out garbled, so I wrote the Arabic myself from the English and the readable fragments. Please have the client check it.
- **Ratings**: Overall and Ease must be 1-5; "Unable to rate" is allowed for Support and Value (as before). The PDF line is ambiguous; say if all four must allow it.
- **Removed from the review** (not in the PDF list): industry, country, city, review title, "problem it solved". New reviews therefore have no "works well" text on the product page; it shows the difficulty / improvement text instead.
- **Not tested against live services**: I could not run Google/LinkedIn sign-in or your Supabase here. What I did run: a full strict TypeScript check of the whole project (clean), and browser-simulation tests of the screen (signed out, signed in, profile, Arabic and English) plus the server validation rules.
- The SQL was written without your table definitions. If a statement fails, send me the error.
- The old `/expert/api` endpoint (it rewrote every review on each save) now answers 410; the new ones are `/expert/api/review` and `/expert/api/profile`. `lib/expert-portfolio-html*.ts` is no longer used and can be deleted.

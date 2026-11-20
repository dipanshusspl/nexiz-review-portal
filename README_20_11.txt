NEXIZ - EXPERT PAGE FIXES (19 NOV)

STEP 1  Run sql/nexiz_19nov.sql once in Supabase (SQL editor). Do this BEFORE deploying the code.
STEP 2  Copy the folder "src" over your project's "src" (7 files, same paths):
          src/lib/expert-wizard-html.ts      the expert screen (most changes)
          src/lib/expert-v2.ts               saving, validation, catalogue, no duplicate reviews
          src/lib/data.ts                    Software type gets name_ar
          src/app/actions/admin.ts           admin can save the Arabic name
          src/app/admin/software/page.tsx    "Arabic name" box in Admin > Software
          src/components/ExpertBar.tsx       header Sign in follows the language
          src/components/ExpertSignInLink.tsx  NEW
STEP 3  Deploy, then open /expert on a phone and tick the checklist at the end of the client's file.

NOTES
- New answers (goals, accomplished, who it suits, stop reasons, last used, problem resolved) are saved in a new column
  rv_expert_software_reviews.extra. "Biggest problem" reuses biggest_difficulty. The old improvement answer (wishlist) is no longer written.
- Drafts saved before this change keep working; their old "step 3" opens as the new step 4.
- Products of HR / CRM / E-commerce / Logistics are hidden from experts by category slug or name (hr-payroll, crm, e-commerce, logistics).
- Search also uses the client CSV "search_aliases_ar" (stored in rv_software.search_aliases_ar).

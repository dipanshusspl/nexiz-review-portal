-- ============================================================================================
-- Expert review v2: run ONCE in the Supabase SQL editor, BEFORE deploying the new code.
-- Safe to run twice (every statement is idempotent). It only ADDS things, it never deletes data.
-- NOTE: written without access to the original table definitions; if a statement fails, send me the error.
-- ============================================================================================

-- 1) per-review fields ------------------------------------------------------------------------
alter table rv_expert_software_reviews add column if not exists role_when_used text;
alter table rv_expert_software_reviews add column if not exists features_other text;
alter table rv_expert_software_reviews add column if not exists integrations jsonb not null default '[]'::jsonb;
alter table rv_expert_software_reviews add column if not exists no_integrations boolean not null default false;
alter table rv_expert_software_reviews add column if not exists current_step smallint not null default 1;
alter table rv_expert_software_reviews add column if not exists declaration_confirmed boolean not null default false;
alter table rv_expert_software_reviews add column if not exists submitted_at timestamptz;
alter table rv_expert_software_reviews add column if not exists custom_function_group text;

-- review status now has FOUR values: draft | pending (= submitted for moderation) | approved (= published) | rejected.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'rv_expert_software_reviews'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table rv_expert_software_reviews drop constraint %I', c.conname);
  end loop;
end $$;
alter table rv_expert_software_reviews add constraint rv_expert_software_reviews_status_chk
  check (status in ('draft','pending','approved','rejected'));

-- one review per person per product (a person who signs in with Google, LinkedIn and email is ONE account)
create unique index if not exists ux_exp_review_profile_software
  on rv_expert_software_reviews (profile_id, software_id) where software_id is not null;

-- 2) software typed by experts that is not in the catalogue: waits here for an admin ---------------
create table if not exists rv_pending_software (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  function_group text,
  review_id uuid,
  user_id uuid,
  status text not null default 'pending' check (status in ('pending','matched','created','dismissed')),
  software_id uuid,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists ix_pending_software_status on rv_pending_software (status);
alter table rv_pending_software enable row level security;

-- 3) admin-editable function lists (Appendix A) ------------------------------------------------
create table if not exists rv_function_options (
  id uuid primary key default gen_random_uuid(),
  function_group text not null check (function_group in ('accounting','erp_extra','pos')),
  code text not null,
  name_en text not null,
  name_ar text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  unique (function_group, code)
);
alter table rv_function_options enable row level security;

insert into rv_function_options (function_group, code, name_en, name_ar, sort_order) values
 ('accounting','gl','General ledger','دفتر الأستاذ العام',1),
 ('accounting','ar','Accounts receivable','الذمم المدينة',2),
 ('accounting','ap','Accounts payable','الذمم الدائنة',3),
 ('accounting','einv','E-invoicing (ZATCA)','الفوترة الإلكترونية (فاتورة)',4),
 ('accounting','bank_rec','Bank reconciliation','التسويات البنكية',5),
 ('accounting','vat','VAT returns','إقرارات ضريبة القيمة المضافة',6),
 ('accounting','fixed_assets','Fixed assets','الأصول الثابتة',7),
 ('accounting','costing','Cost centres','مراكز التكلفة',8),
 ('accounting','budgeting','Budgeting','الموازنات',9),
 ('accounting','multi_currency','Multi-currency','تعدد العملات',10),
 ('accounting','reporting','Financial reports and dashboards','التقارير المالية ولوحات المتابعة',11),
 ('erp_extra','inventory','Inventory','المخزون',1),
 ('erp_extra','purchasing','Purchasing','المشتريات',2),
 ('erp_extra','sales_orders','Sales orders','أوامر البيع',3),
 ('erp_extra','payroll','Payroll','الرواتب',4),
 ('erp_extra','hr','HR','الموارد البشرية',5),
 ('erp_extra','manufacturing','Manufacturing','التصنيع',6),
 ('erp_extra','project','Project accounting','محاسبة المشاريع',7),
 ('erp_extra','multi_entity','Multi-entity consolidation','توحيد القوائم لعدة كيانات',8),
 ('erp_extra','crm','CRM','إدارة علاقات العملاء',9),
 ('pos','checkout','Checkout and sales','البيع والدفع عند نقطة البيع',1),
 ('pos','payment_methods','Payment methods (mada, cards, Apple Pay)','وسائل الدفع (مدى، البطاقات، Apple Pay)',2),
 ('pos','einv_pos','E-receipts and invoices (ZATCA)','الفواتير الإلكترونية والإيصالات (فاتورة)',3),
 ('pos','inventory_counts','Inventory and stock counts','المخزون والجرد',4),
 ('pos','menu','Product and menu management','إدارة المنتجات والقوائم',5),
 ('pos','multi_branch','Multi-branch management','إدارة الفروع',6),
 ('pos','staff','Staff shifts and permissions','ورديات الموظفين والصلاحيات',7),
 ('pos','returns','Returns and refunds','المرتجعات والاسترداد',8),
 ('pos','loyalty','Loyalty and discounts','الولاء والخصومات',9),
 ('pos','delivery','Delivery app orders','طلبات تطبيقات التوصيل',10),
 ('pos','kitchen','Kitchen display','شاشة المطبخ',11),
 ('pos','tables','Tables and reservations','الطاولات والحجوزات',12),
 ('pos','sales_reports','Sales reports','تقارير المبيعات',13)
on conflict (function_group, code) do nothing;

-- which function list a category uses (set on /admin/functions)
alter table rv_categories add column if not exists function_group text;
update rv_categories set function_group = case
    when slug ilike '%pos%' or name_en ilike '%point of sale%' or name_en ilike '%pos%' then 'pos'
    when slug ilike '%erp%' or name_en ilike '%erp%' or name_en ilike '%resource planning%' then 'erp'
    else 'accounting' end
  where function_group is null;

-- 4) new fixed answer lists (usage duration, company size) so old and new pages can show their labels ---
insert into rv_lk_options (code, group_code, name_en, name_ar, sort_order)
select v.code, v.grp, v.en, v.ar, v.ord from (values
 ('dur_lt6','usage_duration','< 6 months','أقل من 6 أشهر',101),
 ('dur_6_12','usage_duration','6 to 12 months','من 6 إلى 12 شهرًا',102),
 ('dur_1_2','usage_duration','1 to 2 years','من سنة إلى سنتين',103),
 ('dur_2_5','usage_duration','2 to 5 years','من 2 إلى 5 سنوات',104),
 ('dur_5p','usage_duration','5+ years','أكثر من 5 سنوات',105),
 ('size_1_10','company_size','1-10','1-10',111),
 ('size_11_50','company_size','11-50','11-50',112),
 ('size_51_200','company_size','51-200','51-200',113),
 ('size_201_500','company_size','201-500','201-500',114),
 ('size_500p','company_size','500+','500+',115)
) as v(code, grp, en, ar, ord)
where not exists (select 1 from rv_lk_options o where o.code = v.code);

-- 5) picture from Google / LinkedIn, used ONLY to prefill the profile photo -------------------------
alter table rv_users add column if not exists oauth_picture text;

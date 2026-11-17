export type PLang = 'en' | 'ar';
const en = {
  product: 'Product', by: 'by', userScore: 'User score', expertScore: 'Verified experts', users: 'Users', reviewsWord: 'reviews', review: 'review',
  tooFew: 'too few reviews to score', wouldRecommend: 'would recommend', outOf5: 'out of 5', basedOn: 'based on', noData: 'No data yet',
  compliance: 'Saudi compliance', complianceSub: 'What reviewers report about how this product handled Saudi obligations in practice. This is reviewer experience, not an official compliance statement.', // Changed by Prachi, 2026-11-03
  zatca: 'ZATCA', wps: 'WPS', gosi: 'GOSI', qiwa: 'Qiwa',
  s_ok: 'Out of the box', s_partial: 'Needed help', s_no: 'Not supported', s_none: 'No data yet', s_mixed: 'Reviewers disagree', answersWord: 'reviewer answers', // Added by Prachi, 2026-11-03
  glance: 'At a glance', sizes: 'Company sizes using it', golive: 'Typical go-live time', cost: 'Yearly cost band', features: 'Most used features',
  ofReviews: 'of', expertReviews: 'expert reviews', allReviews: 'reviews', notEnough: 'Not enough data yet',
  reviews: 'Reviews', filterType: 'Review type', filterSize: 'Company size', filterRole: 'Role', filterDuration: 'Time used', filterStill: 'Still using',
  all: 'All', expertBadge: 'Verified expert', userBadge: 'User', still: 'Still using', notStill: 'Stopped using', worksWell: 'What works well', doesnt: "What doesn't",
  nothing: 'Nothing reported', noReviews: 'No published reviews yet.', apply: 'Apply', whoNot: 'Who should not buy this',
  movedOff: 'have moved off this product', mostOftenTo: 'most often to', of: 'of', reviewers: 'reviewers', moved: 'What reviewers moved to',
  login: 'Log in', reviewIt: 'Review software', yes: 'Yes', no: 'No', features_lbl: 'features', home: 'Review portal',
  calcVersion: 'Calculation version', calcAt: 'stored', calcMatch: 'matches the current reviews', calcOlder: 'reviews changed since', // Added by Prachi, 2026-11-10 (gap 6.5)
  calcHow: 'How these numbers are calculated', calcRuleWho: 'Only approved reviews count. A user review also has to be verified, and an expert review has to be complete.', calcRuleScore: 'A score or a recommend share is shown only when at least {n} reviews of that type back it. Below that the page says there are too few reviews.', calcRuleChip: 'A compliance answer is shown only when at least {n} reviewers answered. If no single answer is given by at least {p}% of them, it reads “Reviewers disagree”.', calcRuleLeave: 'Where reviewers moved to is shown only once at least {n} of them have left the product.', calcRuleStore: 'Every calculation is stored with its version, time, thresholds and a fingerprint of the reviews it used, so the same reviews always give the same numbers.', // Added by Prachi, 2026-11-10 (gap 6.5)
  f_gl: 'General ledger', f_ar: 'Accounts receivable', f_ap: 'Accounts payable', f_einv: 'E-invoicing', f_inventory: 'Inventory', f_costing: 'Costing',
  f_fixed_assets: 'Fixed assets', f_purchasing: 'Purchasing', f_payroll: 'Payroll', f_multi_entity: 'Multi-entity', f_multi_currency: 'Multi-currency',
  f_reporting: 'Reporting & dashboards', f_budgeting: 'Budgeting', f_project: 'Project accounting', f_other: 'Other',
};
const ar: typeof en = {
  product: 'المنتج', by: 'من', userScore: 'تقييم المستخدمين', expertScore: 'الخبراء الموثّقون', users: 'المستخدمون', reviewsWord: 'تقييمًا', review: 'تقييم',
  tooFew: 'عدد التقييمات قليل لإظهار درجة', wouldRecommend: 'يوصون به', outOf5: 'من 5', basedOn: 'بناءً على', noData: 'لا بيانات بعد',
  compliance: 'الامتثال السعودي', complianceSub: 'ما يذكره المراجعون عن تعامل هذا المنتج مع الالتزامات السعودية عمليًا. هذه تجربة المراجعين وليست بيانًا رسميًا للامتثال.', // Changed by Prachi, 2026-11-03
  zatca: 'ZATCA', wps: 'WPS', gosi: 'GOSI', qiwa: 'Qiwa',
  s_ok: 'يعمل مباشرة', s_partial: 'احتاج مساعدة', s_no: 'غير مدعوم', s_none: 'لا بيانات بعد', s_mixed: 'المراجعون غير متفقين', answersWord: 'إجابة من المراجعين', // Added by Prachi, 2026-11-03
  glance: 'نظرة سريعة', sizes: 'أحجام الشركات المستخدمة', golive: 'مدة التشغيل المعتادة', cost: 'شريحة التكلفة السنوية', features: 'الوظائف الأكثر استخدامًا',
  ofReviews: 'من', expertReviews: 'تقييمات خبراء', allReviews: 'تقييمًا', notEnough: 'لا بيانات كافية بعد',
  reviews: 'التقييمات', filterType: 'نوع التقييم', filterSize: 'حجم الشركة', filterRole: 'الدور', filterDuration: 'مدة الاستخدام', filterStill: 'ما زال يستخدمه',
  all: 'الكل', expertBadge: 'خبير موثّق', userBadge: 'مستخدم', still: 'ما زال يستخدمه', notStill: 'توقف عن استخدامه', worksWell: 'ما الذي يعمل جيدًا', doesnt: 'وما الذي لا يعمل',
  nothing: 'لا شيء مذكور', noReviews: 'لا توجد تقييمات منشورة بعد.', apply: 'تطبيق', whoNot: 'من لا ينبغي أن يشتري هذا المنتج',
  movedOff: 'انتقلوا عن هذا المنتج', mostOftenTo: 'غالبًا إلى', of: 'من', reviewers: 'مراجعين', moved: 'إلى ماذا انتقل المراجعون',
  login: 'تسجيل الدخول', reviewIt: 'قيّم برنامجًا', yes: 'نعم', no: 'لا', features_lbl: 'وظائف', home: 'بوابة التقييم',
  calcVersion: 'إصدار الحساب', calcAt: 'حُفظت', calcMatch: 'مطابقة للتقييمات الحالية', calcOlder: 'تغيّرت التقييمات منذ ذلك', // Added by Prachi, 2026-11-10 (gap 6.5)
  calcHow: 'كيف تُحسب هذه الأرقام', calcRuleWho: 'تُحتسب التقييمات المعتمدة فقط. ويجب أن يكون تقييم المستخدم موثّقًا، وتقييم الخبير مكتملًا.', calcRuleScore: 'لا يظهر التقييم أو نسبة التوصية إلا إذا استند إلى {n} تقييمات على الأقل من النوع نفسه. وإلا تظهر عبارة أن التقييمات قليلة.', calcRuleChip: 'لا تظهر إجابة الامتثال إلا إذا أجاب {n} مراجعين على الأقل. وإذا لم تصل أي إجابة إلى {p}% منهم تظهر عبارة «المراجعون غير متفقين».', calcRuleLeave: 'لا تظهر وجهة المراجعين الذين انتقلوا إلا بعد أن يترك المنتج {n} منهم على الأقل.', calcRuleStore: 'يُحفظ كل حساب مع إصداره ووقته وحدوده وبصمة للتقييمات المستخدمة فيه، فتعطي التقييمات نفسها الأرقام نفسها دائمًا.', // Added by Prachi, 2026-11-10 (gap 6.5)
  f_gl: 'الأستاذ العام', f_ar: 'الحسابات المدينة', f_ap: 'الحسابات الدائنة', f_einv: 'الفوترة الإلكترونية', f_inventory: 'المخزون', f_costing: 'التكاليف',
  f_fixed_assets: 'الأصول الثابتة', f_purchasing: 'المشتريات', f_payroll: 'الرواتب', f_multi_entity: 'تعدد الكيانات', f_multi_currency: 'تعدد العملات',
  f_reporting: 'التقارير ولوحات المتابعة', f_budgeting: 'الموازنات', f_project: 'محاسبة المشاريع', f_other: 'أخرى',
};
export const pt = (lang: PLang) => (lang === 'ar' ? ar : en);
export type PT = ReturnType<typeof pt>;
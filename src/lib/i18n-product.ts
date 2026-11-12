export type PLang = 'en' | 'ar';
const en = {
  product: 'Product', by: 'by', userScore: 'User score', expertScore: 'Verified experts', users: 'Users', reviewsWord: 'reviews', review: 'review',
  tooFew: 'too few reviews to score', wouldRecommend: 'would recommend', outOf5: 'out of 5', basedOn: 'based on', noData: 'No data yet',
  compliance: 'Saudi compliance', complianceSub: 'How this product handled Saudi obligations in practice.',
  zatca: 'ZATCA', wps: 'WPS', gosi: 'GOSI', qiwa: 'Qiwa',
  s_ok: 'Out of the box', s_partial: 'Needed help', s_no: 'Not supported', s_none: 'No data yet',
  glance: 'At a glance', sizes: 'Company sizes using it', golive: 'Typical go-live time', cost: 'Yearly cost band', features: 'Most used features',
  ofReviews: 'of', expertReviews: 'expert reviews', allReviews: 'reviews', notEnough: 'Not enough data yet',
  reviews: 'Reviews', filterType: 'Review type', filterSize: 'Company size', filterRole: 'Role', filterDuration: 'Time used', filterStill: 'Still using',
  all: 'All', expertBadge: 'Verified expert', userBadge: 'User', still: 'Still using', notStill: 'Stopped using', worksWell: 'What works well', doesnt: "What doesn't",
  nothing: 'Nothing reported', noReviews: 'No published reviews yet.', apply: 'Apply', whoNot: 'Who should not buy this',
  movedOff: 'have moved off this product', mostOftenTo: 'most often to', of: 'of', reviewers: 'reviewers', moved: 'What reviewers moved to',
  login: 'Log in', reviewIt: 'Review software', yes: 'Yes', no: 'No', features_lbl: 'features', home: 'Review portal',
  f_gl: 'General ledger', f_ar: 'Accounts receivable', f_ap: 'Accounts payable', f_einv: 'E-invoicing', f_inventory: 'Inventory', f_costing: 'Costing',
  f_fixed_assets: 'Fixed assets', f_purchasing: 'Purchasing', f_payroll: 'Payroll', f_multi_entity: 'Multi-entity', f_multi_currency: 'Multi-currency',
  f_reporting: 'Reporting & dashboards', f_budgeting: 'Budgeting', f_project: 'Project accounting', f_other: 'Other',
};
const ar: typeof en = {
  product: 'المنتج', by: 'من', userScore: 'تقييم المستخدمين', expertScore: 'الخبراء الموثّقون', users: 'المستخدمون', reviewsWord: 'تقييمًا', review: 'تقييم',
  tooFew: 'عدد التقييمات قليل لإظهار درجة', wouldRecommend: 'يوصون به', outOf5: 'من 5', basedOn: 'بناءً على', noData: 'لا بيانات بعد',
  compliance: 'الامتثال السعودي', complianceSub: 'كيف تعامل هذا المنتج مع الالتزامات السعودية عمليًا.',
  zatca: 'ZATCA', wps: 'WPS', gosi: 'GOSI', qiwa: 'Qiwa',
  s_ok: 'يعمل مباشرة', s_partial: 'احتاج مساعدة', s_no: 'غير مدعوم', s_none: 'لا بيانات بعد',
  glance: 'نظرة سريعة', sizes: 'أحجام الشركات المستخدمة', golive: 'مدة التشغيل المعتادة', cost: 'شريحة التكلفة السنوية', features: 'الوظائف الأكثر استخدامًا',
  ofReviews: 'من', expertReviews: 'تقييمات خبراء', allReviews: 'تقييمًا', notEnough: 'لا بيانات كافية بعد',
  reviews: 'التقييمات', filterType: 'نوع التقييم', filterSize: 'حجم الشركة', filterRole: 'الدور', filterDuration: 'مدة الاستخدام', filterStill: 'ما زال يستخدمه',
  all: 'الكل', expertBadge: 'خبير موثّق', userBadge: 'مستخدم', still: 'ما زال يستخدمه', notStill: 'توقف عن استخدامه', worksWell: 'ما الذي يعمل جيدًا', doesnt: 'وما الذي لا يعمل',
  nothing: 'لا شيء مذكور', noReviews: 'لا توجد تقييمات منشورة بعد.', apply: 'تطبيق', whoNot: 'من لا ينبغي أن يشتري هذا المنتج',
  movedOff: 'انتقلوا عن هذا المنتج', mostOftenTo: 'غالبًا إلى', of: 'من', reviewers: 'مراجعين', moved: 'إلى ماذا انتقل المراجعون',
  login: 'تسجيل الدخول', reviewIt: 'قيّم برنامجًا', yes: 'نعم', no: 'لا', features_lbl: 'وظائف', home: 'بوابة التقييم',
  f_gl: 'الأستاذ العام', f_ar: 'الحسابات المدينة', f_ap: 'الحسابات الدائنة', f_einv: 'الفوترة الإلكترونية', f_inventory: 'المخزون', f_costing: 'التكاليف',
  f_fixed_assets: 'الأصول الثابتة', f_purchasing: 'المشتريات', f_payroll: 'الرواتب', f_multi_entity: 'تعدد الكيانات', f_multi_currency: 'تعدد العملات',
  f_reporting: 'التقارير ولوحات المتابعة', f_budgeting: 'الموازنات', f_project: 'محاسبة المشاريع', f_other: 'أخرى',
};
export const pt = (lang: PLang) => (lang === 'ar' ? ar : en);
export type PT = ReturnType<typeof pt>;

import 'server-only';
import { cookies } from 'next/headers';

export type Lang = 'en' | 'ar';
export const LANG_COOKIE = 'rv_lang';

export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return v === 'ar' ? 'ar' : 'en';
}

const en = {
  appName: 'Nexiz AI', logout: 'Log out', adminPanel: 'Admin panel', reviewPage: 'Review software',
  changePassword: 'Change password',
  step1: 'Choose Category', step2: 'Select Software', step3: 'Write Review',
  s1Title: 'What category would you like to review?', s1Sub: 'Select a category to see the available software products',
  searchCategories: 'Search categories...', searchSoftware: 'Search software...',
  changeCategory: 'Change Category', s2Sub: 'Select the software you have used to share your experience',
  yourRating: 'Your Rating', outOf5: 'out of 5',
  howLong: 'How long have you used it?', yourReview: 'Your Review',
  sharePlaceholder: 'Share your experience with', record: 'Record your review', stop: 'Stop recording',
  submit: 'Submit Review', update: 'Update Review', otherProducts: 'Other Products in',
  alreadyReviewed: 'Already Reviewed', notYet: 'Not Yet Reviewed', view: 'View', writeReview: 'Write Review',
  noCategories: 'No categories yet. Ask an admin to add some.', noSoftware: 'No software in this category yet.',
  d_lt_6m: '< 6 months', d_6_12m: '6–12 months', d_1_2y: '1–2 years', d_2_5y: '2–5 years', d_5y_plus: '5+ years',
  saved: 'Your review was saved. Thank you!',
  savedField: 'Review saved. Send the confirmation link below to the respondent — it is published as Verified once they open it.',
  e_forbidden: 'You do not have permission to open that page.', e_invalid: 'Please complete all required fields (marked *).',
  e_notfound: 'Not found.', e_failed: 'Something went wrong. Please try again.',
  e_duplicate: 'This respondent has already reviewed this product.',
  // S1/S2/S4 + categories
  takes60: 'Takes about 60 seconds.', changeSoftware: 'Review a different product',
  cantFind: "Can't find your category? Tell us.", cantFindPh: 'Which category or software are you looking for?', send: 'Send', thanksRequest: 'Thank you — we have noted your request.',
  // P1
  worksWell: 'What works well?', doesntWork: "What doesn't?", min20: 'min 20 characters', charsLeft: 'characters',
  // P2
  recommendQ: 'Would you recommend it?', yes: 'Yes', no: 'No',
  // P3
  whoReviewing: 'Who is reviewing?', yourRole: 'Your role', companySize: 'Company size',
  r_owner: 'Owner', r_manager: 'Manager', r_finance: 'Finance / Accounting', r_hr: 'HR', r_sales: 'Sales', r_ops: 'Operations', r_it: 'IT', r_other: 'Other',
  // P4
  zatcaQ: 'Did it handle your ZATCA e-invoicing?', z_out_of_box: 'Yes, out of the box', z_needed_help: 'Yes, but needed help or a third party', z_no: 'No', z_na: 'Not relevant to me',
  // P5
  stillUsing: 'Are you still using it?', movedTo: 'What did you move to? (optional)', selectOne: 'Select…',
  // P6
  subRatings: 'Rate more (optional)', ease: 'Ease of use', support: 'Support', value: 'Value for money',
  // P7
  collectingFor: 'I am collecting on behalf of someone', respName: 'Respondent name', respContact: 'Work email or mobile', respCompany: 'Company', collectedBy: 'Collected by',
  respHint: 'Name, contact and company are never published. The respondent gets a one-tap confirmation link.',
  confirmLink: 'Confirmation link for the respondent', copy: 'Copy',
  // A3/A5
  anonLabel: 'Publish this review without my name.', verifiedBadge: 'Verified', userBadge: 'User',
  // A6
  seeAll: 'See all', showLess: 'Show less', youReviewed: 'You reviewed this product. You can update your review.',
  // confirm page
  confirmTitle: 'Review confirmed', confirmBody: 'Thank you. Your review is now published as Verified.', confirmBad: 'This confirmation link is invalid or has already been used.',
};

const ar: typeof en = {
  appName: 'نكسز AI', logout: 'تسجيل الخروج', adminPanel: 'لوحة الإدارة', reviewPage: 'تقييم البرامج',
  changePassword: 'تغيير كلمة المرور',
  step1: 'اختيار التصنيف', step2: 'اختيار البرنامج', step3: 'كتابة التقييم',
  s1Title: 'أي تصنيف تود تقييمه؟', s1Sub: 'اختر تصنيفاً لعرض البرامج المتاحة',
  searchCategories: 'ابحث في التصنيفات...', searchSoftware: 'ابحث في البرامج...',
  changeCategory: 'تغيير التصنيف', s2Sub: 'اختر البرنامج الذي استخدمته لتشارك تجربتك',
  yourRating: 'تقييمك', outOf5: 'من 5',
  howLong: 'منذ متى تستخدمه؟', yourReview: 'مراجعتك',
  sharePlaceholder: 'شارك تجربتك مع', record: 'سجّل مراجعتك صوتياً', stop: 'إيقاف التسجيل',
  submit: 'إرسال التقييم', update: 'تحديث التقييم', otherProducts: 'منتجات أخرى في',
  alreadyReviewed: 'تم تقييمها', notYet: 'لم يتم تقييمها', view: 'عرض', writeReview: 'اكتب تقييماً',
  noCategories: 'لا توجد تصنيفات بعد. اطلب من المسؤول إضافتها.', noSoftware: 'لا توجد برامج في هذا التصنيف بعد.',
  d_lt_6m: 'أقل من 6 أشهر', d_6_12m: '6–12 شهراً', d_1_2y: '1–2 سنة', d_2_5y: '2–5 سنوات', d_5y_plus: 'أكثر من 5 سنوات',
  saved: 'تم حفظ تقييمك. شكراً لك!',
  savedField: 'تم حفظ التقييم. أرسل رابط التأكيد أدناه إلى المشارك — يُنشر كـ«موثّق» بعد أن يفتحه.',
  e_forbidden: 'ليس لديك صلاحية لفتح هذه الصفحة.', e_invalid: 'الرجاء تعبئة جميع الحقول المطلوبة (المعلّمة بـ *).',
  e_notfound: 'غير موجود.', e_failed: 'حدث خطأ. حاول مرة أخرى.',
  e_duplicate: 'هذا المشارك قيّم هذا المنتج من قبل.',
  takes60: 'يستغرق نحو 60 ثانية.', changeSoftware: 'تقييم منتج آخر',
  cantFind: 'لم تجد تصنيفك؟ أخبرنا.', cantFindPh: 'ما التصنيف أو البرنامج الذي تبحث عنه؟', send: 'إرسال', thanksRequest: 'شكراً لك — سجّلنا طلبك.',
  worksWell: 'ما الذي يعمل جيداً؟', doesntWork: 'وما الذي لا يعمل؟', min20: '20 حرفاً على الأقل', charsLeft: 'حرف',
  recommendQ: 'هل توصي به؟', yes: 'نعم', no: 'لا',
  whoReviewing: 'من يكتب التقييم؟', yourRole: 'دورك', companySize: 'حجم الشركة',
  r_owner: 'مالك', r_manager: 'مدير', r_finance: 'مالية / محاسبة', r_hr: 'موارد بشرية', r_sales: 'مبيعات', r_ops: 'عمليات', r_it: 'تقنية المعلومات', r_other: 'أخرى',
  zatcaQ: 'هل تعامل مع الفوترة الإلكترونية (زاتكا)؟', z_out_of_box: 'نعم، مباشرة دون إعداد', z_needed_help: 'نعم، لكن احتجت مساعدة أو طرفاً ثالثاً', z_no: 'لا', z_na: 'لا ينطبق عليّ',
  stillUsing: 'هل ما زلت تستخدمه؟', movedTo: 'إلى ماذا انتقلت؟ (اختياري)', selectOne: 'اختر…',
  subRatings: 'قيّم أكثر (اختياري)', ease: 'سهولة الاستخدام', support: 'الدعم', value: 'القيمة مقابل السعر',
  collectingFor: 'أجمع التقييم نيابةً عن شخص آخر', respName: 'اسم المشارك', respContact: 'البريد الإلكتروني للعمل أو الجوال', respCompany: 'الشركة', collectedBy: 'جُمع بواسطة',
  respHint: 'لا يُنشر الاسم ولا وسيلة التواصل ولا الشركة. يصل المشارك رابط تأكيد بنقرة واحدة.',
  confirmLink: 'رابط التأكيد للمشارك', copy: 'نسخ',
  anonLabel: 'انشر هذا التقييم دون ذكر اسمي.', verifiedBadge: 'موثّق', userBadge: 'مستخدم',
  seeAll: 'عرض الكل', showLess: 'عرض أقل', youReviewed: 'لقد قيّمت هذا المنتج. يمكنك تحديث تقييمك.',
  confirmTitle: 'تم تأكيد التقييم', confirmBody: 'شكراً لك. تقييمك منشور الآن كـ«موثّق».', confirmBad: 'رابط التأكيد غير صالح أو سبق استخدامه.',
};

export type Dict = typeof en;
export const getDict = (lang: Lang): Dict => (lang === 'ar' ? ar : en);
export const DURATIONS = ['lt_6m', '6_12m', '1_2y', '2_5y', '5y_plus'] as const;
export type Duration = (typeof DURATIONS)[number];

/** P3 / P4 / P7: option lists shared by the form and the server action. */
export const ROLES = ['owner', 'manager', 'finance', 'hr', 'sales', 'ops', 'it', 'other'] as const;
export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'] as const;
export const ZATCA = ['out_of_box', 'needed_help', 'no', 'na'] as const;

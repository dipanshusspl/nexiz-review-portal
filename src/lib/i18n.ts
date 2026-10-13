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
  changeSoftware: 'Change Software', yourRating: 'Your Rating', outOf5: 'out of 5',
  howLong: 'How long have you used it?', yourReview: 'Your Review',
  sharePlaceholder: 'Share your experience with', record: 'Record your review', stop: 'Stop recording',
  submit: 'Submit Review', update: 'Update Review', otherProducts: 'Other Products in',
  alreadyReviewed: 'Already Reviewed', notYet: 'Not Yet Reviewed', view: 'View', writeReview: 'Write Review',
  noCategories: 'No categories yet. Ask an admin to add some.', noSoftware: 'No software in this category yet.',
  d_lt_6m: '< 6 months', d_6_12m: '6-12 months', d_1_2y: '1-2 years', d_2_5y: '2-5 years', d_5y_plus: '5+ years',
  saved: 'Your review was saved. Thank you!',
  e_forbidden: 'You do not have permission to open that page.', e_invalid: 'Please choose a rating and how long you used it.',
  e_notfound: 'Not found.', e_failed: 'Something went wrong. Please try again.',
};

const ar: typeof en = {
  appName: 'نكسز AI', logout: 'تسجيل الخروج', adminPanel: 'لوحة الإدارة', reviewPage: 'تقييم البرامج',
  changePassword: 'تغيير كلمة المرور',
  step1: 'اختيار التصنيف', step2: 'اختيار البرنامج', step3: 'كتابة التقييم',
  s1Title: 'أي تصنيف تود تقييمه؟', s1Sub: 'اختر تصنيفاً لعرض البرامج المتاحة',
  searchCategories: 'ابحث في التصنيفات...', searchSoftware: 'ابحث في البرامج...',
  changeCategory: 'تغيير التصنيف', s2Sub: 'اختر البرنامج الذي استخدمته لتشارك تجربتك',
  changeSoftware: 'تغيير البرنامج', yourRating: 'تقييمك', outOf5: 'من 5',
  howLong: 'منذ متى تستخدمه؟', yourReview: 'مراجعتك',
  sharePlaceholder: 'شارك تجربتك مع', record: 'سجّل مراجعتك صوتياً', stop: 'إيقاف التسجيل',
  submit: 'إرسال التقييم', update: 'تحديث التقييم', otherProducts: 'منتجات أخرى في',
  alreadyReviewed: 'تم تقييمها', notYet: 'لم يتم تقييمها', view: 'عرض', writeReview: 'اكتب تقييماً',
  noCategories: 'لا توجد تصنيفات بعد. اطلب من المسؤول إضافتها.', noSoftware: 'لا توجد برامج في هذا التصنيف بعد.',
  d_lt_6m: 'أقل من 6 أشهر', d_6_12m: '6-12 شهراً', d_1_2y: '1-2 سنة', d_2_5y: '2-5 سنوات', d_5y_plus: 'أكثر من 5 سنوات',
  saved: 'تم حفظ تقييمك. شكراً لك!',
  e_forbidden: 'ليس لديك صلاحية لفتح هذه الصفحة.', e_invalid: 'الرجاء اختيار التقييم ومدة الاستخدام.',
  e_notfound: 'غير موجود.', e_failed: 'حدث خطأ. حاول مرة أخرى.',
};

export type Dict = typeof en;
export const getDict = (lang: Lang): Dict => (lang === 'ar' ? ar : en);
export const DURATIONS = ['lt_6m', '6_12m', '1_2y', '2_5y', '5y_plus'] as const;
export type Duration = (typeof DURATIONS)[number];

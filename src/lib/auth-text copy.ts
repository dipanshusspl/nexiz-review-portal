import type { Lang } from '@/lib/i18n';

/** Texts for the login + register screens. (Flash messages from server actions arrive in English; `errorsAr` translates them.) */
const text = {
  en: {
    signIn: 'Sign in', email: 'Email', password: 'Password',
    registerBtn: 'Register as an Expert', browse: 'Browse products and reviews (no login)',
    registerTitle: 'Register as an Expert', fullName: 'Full name', confirm: 'Confirm password',
    rules: 'At least 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol.',
    register: 'Register', backToLogin: 'Back to sign in',
    forgot: 'Forgot password?', forgotTitle: 'Forgot password',
    forgotHelp: 'Enter your account email and we will send you a 6-digit code.', sendCode: 'Send code',
    verifyTitle: 'Enter the code', verifyHelp: 'We sent a 6-digit code to', code: 'Verification code',
    verify: 'Verify', resend: 'Resend code', changeEmail: 'Use a different email',
    resetTitle: 'Set a new password', newPassword: 'New password', confirmNew: 'Confirm new password', saveNew: 'Save new password',
  },
  ar: {
    signIn: 'تسجيل الدخول', email: 'البريد الإلكتروني', password: 'كلمة المرور',
    registerBtn: 'التسجيل كخبير', browse: 'تصفّح المنتجات والتقييمات (بدون تسجيل دخول)',
    registerTitle: 'التسجيل كخبير', fullName: 'الاسم الكامل', confirm: 'تأكيد كلمة المرور',
    rules: 'ثمانية أحرف على الأقل، مع حرف كبير وحرف صغير ورقم ورمز.',
    register: 'تسجيل', backToLogin: 'العودة إلى تسجيل الدخول',
    forgot: 'نسيت كلمة المرور؟', forgotTitle: 'نسيت كلمة المرور',
    forgotHelp: 'أدخل بريدك الإلكتروني وسنرسل إليك رمزًا من 6 أرقام.', sendCode: 'إرسال الرمز',
    verifyTitle: 'أدخل الرمز', verifyHelp: 'أرسلنا رمزًا من 6 أرقام إلى', code: 'رمز التحقق',
    verify: 'تحقق', resend: 'إعادة إرسال الرمز', changeEmail: 'استخدام بريد آخر',
    resetTitle: 'تعيين كلمة مرور جديدة', newPassword: 'كلمة المرور الجديدة', confirmNew: 'تأكيد كلمة المرور الجديدة', saveNew: 'حفظ كلمة المرور الجديدة',
  },
} as const;

export const authText = (lang: Lang) => text[lang];

/** English message (as sent by the server actions) -> Arabic. Used through <Flash map=... />. */
export const errorsAr: Record<string, string> = {

  "Sign-in didn't complete. Your answers are still here. Please try again.": 'لم يكتمل تسجيل الدخول. إجاباتك ما زالت هنا، حاول مرة أخرى.',
  'Sign-in with this provider is not available right now.': 'تسجيل الدخول بهذه الوسيلة غير متاح حاليًا.',
  'Invalid email or password.': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'Too many failed attempts. Try again in a few minutes.': 'محاولات فاشلة كثيرة. حاول مرة أخرى بعد بضع دقائق.',
  'Full name is required.': 'الاسم الكامل مطلوب.',
  'Enter a valid email.': 'أدخل بريدًا إلكترونيًا صحيحًا.',
  'Passwords do not match.': 'كلمتا المرور غير متطابقتين.',
  'Password must be at least 8 characters.': 'يجب أن تتكوّن كلمة المرور من 8 أحرف على الأقل.',
  'Password must be at most 72 characters.': 'يجب ألا تزيد كلمة المرور عن 72 حرفًا.',
  'Password must include a lowercase letter.': 'يجب أن تحتوي كلمة المرور على حرف صغير.',
  'Password must include an uppercase letter.': 'يجب أن تحتوي كلمة المرور على حرف كبير.',
  'Password must include a number.': 'يجب أن تحتوي كلمة المرور على رقم.',
  'Password must include a symbol (e.g. ! @ # $ %).': 'يجب أن تحتوي كلمة المرور على رمز (مثل ! @ # $ %).',
  'An account with this email already exists. Please sign in.': 'يوجد حساب بهذا البريد الإلكتروني. يرجى تسجيل الدخول.',
  'Registration is not available right now. Please contact the administrator.': 'التسجيل غير متاح حاليًا. يرجى التواصل مع المسؤول.',
  'If this email is registered, we have sent a 6-digit code to it.': 'إذا كان هذا البريد مسجّلًا لدينا، فقد أرسلنا إليه رمزًا من 6 أرقام.',
  'Enter the 6-digit code.': 'أدخل الرمز المكوّن من 6 أرقام.',
  'Invalid or expired code.': 'الرمز غير صحيح أو منتهي الصلاحية.',
  'Too many wrong attempts. Please request a new code.': 'محاولات خاطئة كثيرة. يرجى طلب رمز جديد.',
  'Your reset session expired. Please start again.': 'انتهت جلسة إعادة التعيين. يرجى البدء من جديد.',
  'Could not update the password. Please try again.': 'تعذّر تحديث كلمة المرور. حاول مرة أخرى.',
  'Password updated. You can now sign in.': 'تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن.',
};

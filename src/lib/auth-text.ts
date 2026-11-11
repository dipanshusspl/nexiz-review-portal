import type { Lang } from '@/lib/i18n';

/** Texts for the login + register screens. (Flash messages from server actions arrive in English; `errorsAr` translates them.) */
const text = {
  en: {
    signIn: 'Sign in', email: 'Email', password: 'Password',
    registerBtn: 'Register as an Expert', browse: 'Browse products and reviews (no login)',
    registerTitle: 'Register as an Expert', fullName: 'Full name', confirm: 'Confirm password',
    rules: 'At least 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol.',
    register: 'Register', backToLogin: 'Back to sign in',
  },
  ar: {
    signIn: 'تسجيل الدخول', email: 'البريد الإلكتروني', password: 'كلمة المرور',
    registerBtn: 'التسجيل كخبير', browse: 'تصفّح المنتجات والتقييمات (بدون تسجيل دخول)',
    registerTitle: 'التسجيل كخبير', fullName: 'الاسم الكامل', confirm: 'تأكيد كلمة المرور',
    rules: 'ثمانية أحرف على الأقل، مع حرف كبير وحرف صغير ورقم ورمز.',
    register: 'تسجيل', backToLogin: 'العودة إلى تسجيل الدخول',
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
};

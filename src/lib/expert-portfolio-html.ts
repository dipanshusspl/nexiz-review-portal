/**
 * The Expert panel screen supplied by the client (Nexiz_Expert_Portfolio_AR_EN.html), embedded as a string.
 * Served by src/app/expert/frame/route.ts only to users with the 'expert.panel' permission.
 * The screen is data-driven: frame/route.ts fills __CATALOG_JSON__ (dropdowns, categories, software) and __INITIAL_STATE_JSON__ (the saved profile); saving goes to /expert/api.
 * To update the design later: paste the new HTML between the backticks (escape every ` as \` , every \ as \\ and every ${ as \${).
 */
export const EXPERT_PORTFOLIO_HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>شبكة الخبراء الماليين | Nexiz</title>
<style>
:root{--bg:#f7f5ef;--card:#fff;--ink:#26241f;--muted:#635f56;--line:#e8e3d8;--green:#1a6b54;--soft:#eef4f1;--error:#a42828}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.8 Tahoma,Arial,sans-serif}button,input,select,textarea{font:inherit}a{color:var(--green)}header{border-bottom:1px solid var(--line);background:white}header>div{max-width:1060px;margin:auto;display:flex;align-items:center;justify-content:space-between;padding:18px 24px}.brand{font-size:23px;font-weight:bold;letter-spacing:-1px}.brand span{color:var(--green)}main{max-width:1060px;margin:auto;padding:36px 24px 70px}.preview{background:#fff5df;border:1px solid #edd5a0;color:#6a4d14;padding:12px 18px;border-radius:12px;font-size:14px}.hero{padding:30px 0}.eyebrow{color:var(--green);font-weight:bold;font-size:14px}h1{font-size:clamp(26px,4vw,40px);line-height:1.4;margin:10px 0 16px}h2{font-size:22px;margin:0 0 6px}h3{margin:0;font-size:18px}p{margin:8px 0}.hero p{max-width:720px;color:var(--muted)}.steps{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}.steps span{background:var(--soft);border:1px solid #d5e5dc;padding:7px 14px;border-radius:30px;font-size:14px}.section{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:26px;margin-bottom:22px}.hint{color:var(--muted);font-size:14px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.field{display:block;min-width:0}.field>span,.field>label{display:block;font-weight:bold;font-size:14px;margin:8px 0 6px}input:not([type=checkbox]),select,textarea{display:block;width:100%;background:#fff;border:1px solid #c7c3b9;border-radius:9px;padding:10px 12px;color:var(--ink)}textarea{min-height:110px;resize:vertical}input:focus,select:focus,textarea:focus,button:focus-visible,summary:focus-visible{outline:3px solid #d1e7dc;outline-offset:2px;border-color:var(--green)}input[type=checkbox]{width:19px;height:19px;accent-color:var(--green);flex-shrink:0;margin-top:5px}.check{display:flex;gap:9px;align-items:flex-start;margin:14px 0;cursor:pointer}.check span{font-size:14px}.wide{grid-column:1/-1}.optional{margin-top:18px;padding-top:15px;border-top:1px solid var(--line)}button{cursor:pointer;border-radius:9px;border:1px solid #c8d9cf;background:var(--soft);color:var(--green);padding:10px 18px;font-weight:bold}button:disabled{cursor:default;opacity:.6}.primary{background:var(--green);color:#fff;border-color:var(--green)}.picker{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:20px 0}.program{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border:1px solid var(--line);border-radius:10px;cursor:pointer}.program:has(input:checked){border-color:var(--green);background:var(--soft)}.program span{min-width:0;font-size:14px}.program small{display:block;font-size:12px;color:var(--muted)}.custom{border-top:1px solid var(--line);padding-top:18px}.custom-grid{display:grid;grid-template-columns:2fr 1.5fr auto;gap:10px;align-items:end}.custom-grid button{margin-bottom:0}.progress{display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:var(--soft);border-radius:10px;padding:12px 15px;margin-top:18px}progress{flex:1;min-width:100px;height:10px;accent-color:var(--green)}.card{border:1px solid var(--line);border-radius:14px;background:white;margin:16px 0}.card>summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px}.card>summary::-webkit-details-marker{display:none}.card>summary::before{content:'+';font-size:25px;color:var(--green)}.card[open]>summary::before{content:'−'}.card-title{flex:1}.card-title small{display:block;color:var(--muted);font-size:12px}.badge{color:var(--muted);font-size:12px;border:1px solid var(--line);border-radius:20px;padding:3px 10px}.badge.complete{background:var(--soft);color:var(--green);border-color:#b8d6c7}.card-body{border-top:1px solid var(--line);padding:20px}.group-title{margin:24px 0 8px;font-size:16px;color:var(--green)}.ratings{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.ratings .field{background:var(--bg);border-radius:10px;padding:10px}.disclosure{margin-top:22px;border-top:1px solid var(--line);padding-top:12px}.actions{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.status{color:var(--muted);font-size:14px}.error{color:var(--error)}[hidden]{display:none!important}.review-panel{background:var(--soft);border:1px solid #c7dfd2;border-radius:14px;padding:22px;margin-top:22px}.review-panel ul{padding-inline-start:22px}.review-panel li{margin:9px 0}.foot{font-size:13px;color:var(--muted);margin-top:22px}.empty{text-align:center;padding:26px;color:var(--muted)}
@media(max-width:740px){main{padding:22px 14px 45px}.section{padding:20px 16px}.picker{grid-template-columns:repeat(2,minmax(0,1fr))}.ratings{grid-template-columns:repeat(2,minmax(0,1fr))}.custom-grid{grid-template-columns:1fr}.hero{padding:24px 0}}
@media(max-width:450px){.grid{grid-template-columns:1fr}.wide{grid-column:auto}.picker{grid-template-columns:1fr}.badge{max-width:90px}.card-body{padding:16px}.actions .primary{width:100%}}

.layout{display:grid;grid-template-columns:minmax(0,1fr) 350px;gap:24px;align-items:start}main{max-width:1400px}.portfolio{position:sticky;top:20px;background:white;border:1px solid var(--line);border-radius:18px;padding:24px;overflow-wrap:anywhere}.portfolio h2{font-size:20px}.portfolio h3{font-size:15px;color:var(--green);margin:22px 0 8px}.portrait{width:84px;height:84px;border-radius:50%;background:var(--soft);object-fit:cover;display:grid;place-items:center;color:var(--green);font-size:32px;font-weight:bold;margin-bottom:12px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.chip{display:flex;gap:8px;align-items:center;background:var(--soft);border:1px solid #c7dfd2;border-radius:22px;padding:4px 12px;font-size:13px}.chip button{border:0;background:none;padding:0 4px;font-size:19px}.entry{border:1px solid var(--line);border-radius:12px;padding:16px;margin:14px 0}.entry>button{margin-top:12px}.portfolio .entry{padding:12px}.portfolio p{font-size:14px}.portfolio ul{padding-inline-start:20px;font-size:14px}.mini-metrics{display:flex;gap:18px;border-block:1px solid var(--line);padding:14px 0;margin:18px 0}.mini-metrics strong{display:block;color:var(--green);font-size:22px}.mini-metrics span{font-size:12px}.voice{margin:8px 0;font-size:13px;padding:5px 10px}.avatar-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.avatar-actions label{flex:1}.portfolio .hint{font-size:12px}.other-input{margin-top:8px}.section h2{font-size:20px}.portfolio-header{display:flex;justify-content:space-between;gap:12px}.portfolio-label{font-size:12px;color:var(--muted)}
@media(max-width:1100px){.layout{grid-template-columns:minmax(0,1fr) 300px}.section{padding:22px}}@media(max-width:850px){.layout{grid-template-columns:1fr}.portfolio{position:static;grid-row:1}.portfolio-body{max-height:360px;overflow:auto}.custom-grid{grid-template-columns:1fr}}
.dropdown-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;background:white;color:var(--ink);border-color:#c7c3b9;text-align:start}.dropdown-menu{margin-top:8px;border:1px solid #c7c3b9;padding:12px;border-radius:12px;background:white;box-shadow:0 6px 18px #26241f12}.dropdown-menu select[size]{margin-top:10px;padding:4px;min-height:215px}.dropdown-menu select[size] option{padding:9px 12px;border-radius:6px}.dropdown-menu input,.dropdown-menu select{font-size:14px}.sr-only{position:absolute!important;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.voice{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;padding:8px;vertical-align:middle;margin-inline-end:8px}.voice svg{width:22px;height:22px}.voice.recording{color:#a42828;background:#ffefef;border-color:#e7b7b7}.card{scroll-margin-top:18px}
/* embedded in the Nexiz app: the app top bar already shows the brand */
header .brand{display:none}header>div{justify-content:flex-end}
</style>
</head>
<body>
<header><div><div class="brand" dir="ltr">Nexiz<span> AI</span></div><div class="actions"><span class="hint">شبكة الخبراء الماليين</span><button id="language-toggle" type="button" aria-label="Switch to English">English</button></div></div></header>
<main>
<div class="preview" role="note">تُحفظ بياناتك تلقائيًا في حسابك على Nexiz كمسودة. لا يُنشر ملفك علنًا قبل مراجعته.</div>
<div class="hero"><span class="eyebrow">حوّل خبرتك إلى ملف مهني يعكس ما أنجزته</span><h1>عرّف بخبرتك وإنجازاتك</h1><p>عرّف بنفسك، وأبرز شهاداتك ومشاريعك وخبرتك مع البرامج. كل تجربة تكتبها تُضاف إلى معاينة ملفك المهني.</p><div class="steps"><span>١. عرّف بنفسك</span><span>٢. أبرز إنجازاتك</span><span>٣. أضف تجاربك</span></div></div>
<div class="layout"><form id="expert-form" novalidate>
<section class="section"><h2>١. صورتك المهنية</h2><p class="hint">ابدأ بالأساسيات، وأكمل باقي ملفك في الوقت المناسب. * حقل مطلوب.</p>
<div class="avatar-actions"><label class="field"><span>الصورة الشخصية — اختياري</span><input id="photo" type="file" accept="image/jpeg,image/png,image/webp"><small class="hint">JPG أو PNG أو WebP، حتى ٥ ميجابايت.</small></label><button id="remove-photo" type="button" hidden>حذف الصورة</button></div><p id="photo-status" class="status" role="status"></p>
<div class="grid">
<label class="field"><span>الاسم الكامل *</span><input name="full_name" autocomplete="name" required maxlength="120"></label>
<label class="field"><span>البريد الإلكتروني *</span><input name="email" type="email" autocomplete="email" dir="ltr" required maxlength="254"><small class="hint">لن يظهر في معاينة الملف.</small></label>
<label class="field"><span>رقم الهاتف</span><input name="phone" type="tel" autocomplete="tel" dir="ltr" maxlength="30"></label>
<div id="role-field"></div>
<label class="field"><span>سنوات الخبرة *</span><select name="experience_years" required><option value="">اختر مدة الخبرة</option></select></label>
<label class="field"><span>رابط LinkedIn</span><input name="linkedin_url" type="url" dir="ltr" maxlength="400" placeholder="https://www.linkedin.com/in/…"></label>
<div class="wide" id="specialties-field"></div>
<label class="field wide"><span>نبذة عنك</span><textarea name="consultant_bio" maxlength="2000" placeholder="ما الذي تبرع فيه؟ وما القيمة التي تقدمها للمنشآت؟"></textarea></label>
</div>
<label class="check"><input name="consent_expert" type="checkbox"><span>أرغب في أن تتواصل معي Nexiz لمناقشة فرص التعاون الاستشاري.</span></label>
<div id="consultant-fields" class="optional" hidden><div id="services-field"></div></div>
<label class="check"><input name="anonymous" type="checkbox"><span>أفضّل نشر مراجعاتي دون اسمي. المراجعات المجهولة لا تُنسب إلى ملفي العام.</span></label>
</section>
<section class="section"><h2>٢. شهاداتك ومشاريعك</h2><p class="hint">اختياري. أبرز ما يدعم خبرتك، ويمكنك إضافة المزيد لاحقًا.</p>
<h3>الشهادات والمؤهلات</h3><div id="certificates"></div><button id="add-certificate" type="button">+ إضافة شهادة</button>
<h3 class="group-title">المشاريع والإنجازات</h3><p class="hint">مثال: تطبيق نظام محاسبي، بناء تقارير، أو تحسين الإقفال. لا تذكر بيانات سرية أو اسم عميل دون إذنه.</p><div id="projects"></div><button id="add-project" type="button">+ إضافة مشروع</button></section>
<section class="section"><h2>٣. البرامج التي عملت عليها</h2><p class="hint">اختر البرنامج الذي استخدمته ليظهر تقييمه مباشرة. يمكنك إضافة أكثر من برنامج.</p>
<div class="program-dropdown" id="program-dropdown"><button id="program-toggle" class="dropdown-trigger" type="button" aria-expanded="false" aria-controls="program-menu"><span>اختر البرنامج الذي استخدمته</span><span aria-hidden="true">⌄</span></button><div id="program-menu" class="dropdown-menu" hidden><div class="grid"><label class="field"><span class="sr-only">البحث داخل قائمة البرامج</span><input id="search" type="search" placeholder="اكتب اسم البرنامج…" autocomplete="off"></label><label class="field"><span class="sr-only">فئة البرامج</span><select id="category-filter" aria-label="فئة البرامج"><option value="">جميع الفئات</option></select></label></div><select id="software-select" size="7" aria-label="البرامج المتاحة"><option value="">اختر برنامجًا</option></select><p id="no-results" class="hint" hidden>لم نجد برنامجًا مطابقًا. اختر «برنامج غير موجود» لإضافته.</p></div></div><div id="picker" class="chips" aria-label="البرامج المختارة"></div>
<div id="custom-program" class="custom" hidden><h3>إضافة برنامج غير موجود</h3><div class="custom-grid"><label class="field"><span>اسم البرنامج</span><input id="custom-name" maxlength="120"></label><div id="custom-category-host"></div><button id="add-custom" type="button">إضافة البرنامج</button></div><p id="custom-status" class="status" role="status"></p></div>
<div class="progress"><strong id="progress-label">لم تختر برامج بعد</strong><progress id="completion" max="1" value="0" aria-label="اكتمال مراجعات البرامج"></progress></div>
</section>
<section class="section"><h2>٤. أبرز خبرتك من خلال تجاربك</h2><p class="hint">ابدأ بمراجعة برنامج واحد، ثم أكمل الباقي لاحقًا. تظهر الإجابات التي تكتبها في المعاينة؛ ولا يعني اكتمالها اعتمادها للنشر.</p><div id="reviews"><p class="empty">اختر البرامج أعلاه لبدء تقييمها.</p></div></section>
<section class="section"><label class="check"><input name="authenticity" type="checkbox"><span>أؤكد أن المراجعات مبنية على استخدامي الفعلي، وأنني أفصحت عن أي علاقة تجارية أو مهنية مع الشركات المطوّرة.</span></label><p class="hint">تُحفظ بياناتك تلقائيًا في حسابك أثناء الكتابة، ويمكنك العودة لاستكمالها في أي وقت.</p><div class="actions"><button type="submit" class="primary">مراجعة ملفي</button><span id="draft-status" class="status" role="status"></span></div><p id="form-status" class="status" role="status"></p><div id="summary-panel" class="review-panel" tabindex="-1" hidden></div><p class="foot">زر «مراجعة ملفي» يحفظ ملفك في حسابك ويعرض ملخصًا. لا يُنشر ملفك علنًا قبل مراجعة Nexiz، ولا يُولَّد تقرير بالذكاء الاصطناعي.</p></section>
</form><aside class="portfolio" aria-label="معاينة ملفك المهني"><div class="portfolio-header"><h2>ملفك المهني</h2><span class="portfolio-label">معاينة فقط</span></div><p class="hint">يتحدّث أثناء الكتابة. لا تُنشر هذه البيانات.</p><div id="portfolio-content" class="portfolio-body"></div></aside></div>
</main>
<script>
(() => {
'use strict';
const catalog = __CATALOG_JSON__;
const form = document.getElementById('expert-form');
const selected = new Set();
const cards = new Map();
const extras = [];
const INITIAL_STATE = __INITIAL_STATE_JSON__;
const draftOpt = {checked:true}; // saving is always on now: the data goes to the database
const summaries = document.getElementById('summary-panel');
let restoring = false;
let avatar = '';
let photoToken = 0;
const specialtyValues = new Set();
const serviceValues = new Set();
let activeSpeech = null;
let language = 'ar';
const sourceText = new WeakMap();
const sourceAttributes = new WeakMap();
const translations = {"شبكة الخبراء الماليين ": " Nexiz|Financial Experts Network | Nexiz", "شبكة الخبراء الماليين": "Financial Experts Network", "معاينة النموذج — لا تُرسل هذه النسخة بيانات إلى Nexiz، ولا تنشئ حسابًا أو ملفًا عامًا.": "Preview — this version does not send data to Nexiz or create an account or public profile.", "حوّل خبرتك إلى ملف مهني يعكس ما أنجزته": "Turn your experience into a portfolio of your achievements", "عرّف بخبرتك وإنجازاتك": "Showcase your expertise and achievements", "عرّف بنفسك، وأبرز شهاداتك ومشاريعك وخبرتك مع البرامج. كل تجربة تكتبها تُضاف إلى معاينة ملفك المهني.": "Introduce yourself and showcase your qualifications, projects and software experience. Each review becomes part of your portfolio preview.", "١. عرّف بنفسك": "1. Introduce yourself", "٢. أبرز إنجازاتك": "2. Showcase achievements", "٣. أضف تجاربك": "3. Share your experience", "١. صورتك المهنية": "1. Your professional identity", "ابدأ بالأساسيات، وأكمل باقي ملفك في الوقت المناسب. * حقل مطلوب.": "Start with the basics and complete your portfolio at your own pace. * Required field.", "الصورة الشخصية — اختياري": "Profile photo — optional", "JPG أو PNG أو WebP، حتى ٥ ميجابايت. تُعرض محليًا في المعاينة.": "JPG, PNG or WebP, up to 5 MB. Displayed locally in this preview.", "حذف الصورة": "Remove photo", "الاسم الكامل": "Full name", "البريد الإلكتروني": "Email address", "لن يظهر في معاينة الملف.": "Not shown in your portfolio preview.", "رقم الهاتف": "Phone number", "سنوات الخبرة": "Years of experience", "اختر مدة الخبرة": "Select experience", "أقل من سنة": "Less than a year", "من سنة إلى ٣ سنوات": "1–3 years", "من ٣ إلى ٥ سنوات": "3–5 years", "من ٥ إلى ١٠ سنوات": "5–10 years", "أكثر من ١٠ سنوات": "More than 10 years", "رابط LinkedIn": "LinkedIn URL", "نبذة عنك": "About you", "ما الذي تبرع فيه؟ وما القيمة التي تقدمها للمنشآت؟": "What are your strengths? What value do you bring to businesses?", "أرغب في أن تتواصل معي Nexiz لمناقشة فرص التعاون الاستشاري.": "I would like Nexiz to contact me about consulting opportunities.", "أفضّل نشر مراجعاتي دون اسمي. المراجعات المجهولة لا تُنسب إلى ملفي العام.": "I prefer anonymous reviews. Anonymous reviews are not attributed to my public profile.", "٢. شهاداتك ومشاريعك": "2. Qualifications and projects", "اختياري. أبرز ما يدعم خبرتك، ويمكنك إضافة المزيد لاحقًا.": "Optional. Showcase evidence of your expertise and add more later.", "الشهادات والمؤهلات": "Qualifications and certifications", "+ إضافة شهادة": "+ Add qualification", "المشاريع والإنجازات": "Projects and achievements", "مثال: تطبيق نظام محاسبي، بناء تقارير، أو تحسين الإقفال. لا تذكر بيانات سرية أو اسم عميل دون إذنه.": "Examples: implementing accounting software, developing reports or improving financial closing. Avoid confidential data and client names without permission.", "+ إضافة مشروع": "+ Add project", "٣. البرامج التي عملت عليها": "3. Software you have used", "اختر البرنامج الذي استخدمته ليظهر تقييمه مباشرة. يمكنك إضافة أكثر من برنامج.": "Select software you have used to open its review immediately. You can add more than one program.", "البحث عن برنامج": "Search software", "اسم البرنامج بالعربية أو الإنجليزية": "Software name in Arabic or English", "فئة البرامج": "Software category", "جميع الفئات": "All categories", "اختر برنامجًا لإضافته": "Select software to add", "اختر برنامجًا": "Select software", "لم نجد برنامجًا مطابقًا. اختر «برنامج غير موجود» لإضافته.": "No matches found. Select “Software not listed” to add it.", "إضافة برنامج غير موجود": "Add unlisted software", "اسم البرنامج": "Software name", "إضافة البرنامج": "Add software", "لم تختر برامج بعد": "No software selected yet", "٤. أبرز خبرتك من خلال تجاربك": "4. Demonstrate expertise through your reviews", "ابدأ بمراجعة برنامج واحد، ثم أكمل الباقي لاحقًا. تظهر الإجابات التي تكتبها في المعاينة؛ ولا يعني اكتمالها اعتمادها للنشر.": "Start with one review and complete the others later. Your answers appear in the preview; completing a review does not approve it for publication.", "اختر البرامج أعلاه لبدء تقييمها.": "Select software above to start reviewing it.", "أؤكد أن المراجعات مبنية على استخدامي الفعلي، وأنني أفصحت عن أي علاقة تجارية أو مهنية مع الشركات المطوّرة.": "I confirm these reviews reflect my actual experience and disclose any business or professional relationship with the vendors.", "احفظ مسودتي على هذا الجهاز لاستكمالها لاحقًا. تشمل المسودة الصورة وبيانات الاتصال، ويمكنني حذفها في أي وقت.": "Save my draft on this device to continue later. It includes my photo and contact details and can be deleted at any time.", "مراجعة ملفي": "Review my portfolio", "حذف المسودة المحفوظة": "Delete saved draft", "هذه معاينة لاختبار النموذج. زر «مراجعة ملفي» يعرض ملخصًا فقط، ولا يرسل بيانات أو يولّد تقريرًا بالذكاء الاصطناعي.": "This is a form preview. “Review my portfolio” displays a summary without sending data or generating an AI report.", "ملفك المهني": "Your professional portfolio", "معاينة فقط": "Preview only", "يتحدّث أثناء الكتابة. لا تُنشر هذه البيانات.": "Updates as you type. These details are not published.", "أخرى — اكتب الإجابة": "Other — enter your answer", "اكتب الإجابة غير الموجودة": "Enter your own answer", "اختر إجابة": "Select an answer", "إملاء صوتي": "Voice dictation", "الإملاء غير متاح في هذا المتصفح": "Dictation unavailable in this browser", "إيقاف الإملاء": "Stop dictation", "جارٍ الاستماع… راجع النص بعد الإملاء.": "Listening… review your text afterwards.", "أُضيف النص. راجعه وعدّله قبل استخدامه.": "Text added. Review and edit it before using it.", "تعذّر الإملاء. تحقّق من إذن الميكروفون أو اكتب إجابتك.": "Dictation failed. Check microphone permission or type your answer.", "انتهى الاستماع. يمكنك الكتابة أو المحاولة مجددًا.": "Listening ended. Type or try again.", "تعذّر تشغيل الإملاء هنا؛ يمكنك الكتابة.": "Dictation could not start here. You can type instead.", "إضافة": "Add", "الشهادة أو المؤهل": "Qualification or certification", "الجهة المانحة": "Issuing organization", "بكالوريوس محاسبة": "Bachelor’s degree in accounting", "ماجستير محاسبة": "Master’s degree in accounting", "شهادة معتمدة في برنامج": "Software certification", "الهيئة السعودية للمراجعين والمحاسبين": "Saudi Organization for Chartered and Professional Accountants", "جامعة": "University", "الشركة المطوّرة للبرنامج": "Software vendor", "سنة الحصول عليها": "Year awarded", "رابط الشهادة — اختياري": "Certificate URL — optional", "عنوان المشروع": "Project title", "نوع المشروع": "Project type", "تطبيق نظام محاسبي": "Accounting software implementation", "تطبيق ERP": "ERP implementation", "نقل البيانات": "Data migration", "تطوير التقارير": "Report development", "تحسين الإقفال المالي": "Financial closing improvement", "الفوترة الإلكترونية": "E-invoicing", "تدريب فريق": "Team training", "دورك في المشروع": "Your role", "قائد المشروع": "Project lead", "مستشار تطبيق": "Implementation consultant", "محاسب": "Accountant", "محلل أعمال": "Business analyst", "مدرب": "Trainer", "عضو فريق": "Team member", "قطاع العميل": "Client industry", "البرنامج المستخدم": "Software used", "سنة التنفيذ": "Project year", "ما الذي أنجزته؟ وما النتيجة؟": "What did you deliver? What was the outcome?", "الشهادة": "Qualification", "المشروع": "Project", "اسمك المهني": "Your professional name", "مسمّاك وتخصصك هنا": "Your role and expertise", "برامج استخدمتها": "Programs used", "مراجعات مكتملة": "Completed reviews", "مجالات الخبرة": "Areas of expertise", "خدمات أرغب في تقديمها": "Services I can offer", "خبرة مع البرامج": "Software experience", "مراجعاتك المجهولة — معاينة خاصة": "Your anonymous reviews — private preview", "تجاربك مع البرامج": "Your software reviews", "تجربة قيد الكتابة": "Review in progress", "مكتملة في المعاينة — لم تُعتمد للنشر": "Complete in preview — not approved for publication", "مسودة غير مكتملة": "Incomplete draft", "البيانات مضافة بواسطتك. توثيق الخبرة والشهادات يحتاج مراجعة؛ لا تُمنح شارة خبير بعدد البرامج.": "Details are self-reported. Experience and qualifications require verification; software count does not confer expert status.", "غير مكتمل": "Incomplete", "مكتمل": "Complete", "صف التجربة التي بنيت عليها تقييمك، حتى يفهم القارئ الجهة وطريقة استخدام البرنامج.": "Describe the experience behind your review so readers understand the business context and how you used the software.", "اسم المنشأة التي استخدمت فيها البرنامج": "Business where you used the software", "قطاع المنشأة": "Business industry", "حجم المنشأة": "Business size", "من شارك في قرار اختيار البرنامج؟": "Who participated in choosing the software?", "دولة الاستخدام": "Country of use", "مدينة الاستخدام": "City of use", "السعودية": "Saudi Arabia", "الإمارات": "United Arab Emirates", "مصر": "Egypt", "الأردن": "Jordan", "الكويت": "Kuwait", "قطر": "Qatar", "البحرين": "Bahrain", "عُمان": "Oman", "الرياض": "Riyadh", "جدة": "Jeddah", "الدمام": "Dammam", "الخبر": "Khobar", "مكة المكرمة": "Makkah", "المدينة المنورة": "Madinah", "القصيم": "Qassim", "أبها": "Abha", "تبوك": "Tabuk", "مدة استخدامك لهذا البرنامج": "How long have you used this software?", "هل ما زلت تستخدم البرنامج؟": "Do you still use it?", "نعم": "Yes", "لا": "No", "التجربة العملية": "Your practical experience", "عنوان مختصر لتجربتك": "Short review title", "اكتب ٣٠ حرفًا على الأقل في كل إجابة تفصيلية. اذكر مثالًا من عملك، وتجنّب بيانات العملاء أو المعلومات السرية.": "Write at least 30 characters per detailed answer. Include a practical example and avoid client or confidential information.", "ما الوظائف التي استخدمتها فعليًا؟": "Which features did you actually use?", "ما المشكلة التي ساعدك البرنامج على حلّها؟": "What problem did this software help you solve?", "ما أكبر صعوبة واجهتها؟": "What was your biggest difficulty?", "ما التحسين الذي تتمنى إضافته؟": "What improvement would you like to see?", "التقييمات": "Ratings", "١ = ضعيف جدًا، ٥ = ممتاز. اختر «لا أستطيع التقييم» إذا لم تختبر الدعم أو لم تعرف التكلفة.": "1 = very poor, 5 = excellent. Choose “Unable to rate” if you have not tried support or do not know the cost.", "التقييم العام": "Overall rating", "سهولة الاستخدام": "Ease of use", "جودة الدعم": "Support quality", "القيمة مقابل السعر": "Value for money", "لا أستطيع التقييم": "Unable to rate", "لو عاد بك الوقت، هل ستختار البرنامج مجددًا؟": "Would you choose this software again?", "غير متأكد": "Not sure", "هل توصي الآخرين بهذا البرنامج؟": "Would you recommend it?", "يعتمد على احتياجات المنشأة": "Depends on business needs", "علاقتك بالشركة المطوّرة": "Your relationship with the vendor", "لا توجد علاقة": "No relationship", "موظف حالي أو سابق": "Current or former employee", "شريك أو موزّع أو مقدّم خدمات": "Partner, reseller or service provider", "حصلت على مقابل أو ميزة للمراجعة": "Received compensation or a benefit for this review", "علاقة أخرى": "Other relationship", "تفاصيل العلاقة": "Relationship details", "حُفظت المسودة على هذا الجهاز.": "Draft saved on this device.", "تعذّر حفظ المسودة؛ أبقِ الصفحة مفتوحة.": "Could not save the draft. Keep this page open.", "المسمى المهني": "Professional role", "محاسب أول": "Senior accountant", "مدير حسابات": "Accounting manager", "مدير مالي": "Finance manager", "مراجع حسابات": "Auditor", "مستشار محاسبي": "Accounting consultant", "مستشار تطبيق برامج": "Software implementation consultant", "محلل مالي": "Financial analyst", "مجالات خبرتك": "Your areas of expertise", "المحاسبة المالية": "Financial accounting", "محاسبة التكاليف": "Cost accounting", "الإقفال المالي": "Financial closing", "التقارير المالية": "Financial reporting", "الزكاة والضريبة": "Zakat and tax", "ترحيل البيانات": "Data migration", "التدريب": "Training", "الخدمات التي تستطيع تقديمها": "Services you can offer", "اختيار البرنامج المناسب": "Software selection", "تطبيق النظام": "System implementation", "إعداد الحسابات": "Chart of accounts setup", "تدريب الفريق": "Team training", "تحسين الإجراءات": "Process improvement", "فئة البرنامج": "Software category", "برنامج غير موجود — أضف اسمه": "Software not listed — enter its name", "أدخل اسم البرنامج واختر فئته أو اكتب فئة أخرى.": "Enter a software name and select or enter its category.", "البرنامج موجود بالفعل؛ تم اختياره.": "This software already exists and has been selected.", "أُضيف البرنامج إلى ملفك.": "Software added to your portfolio.", "الإجابة بالصوت اختيارية وتعتمد على المتصفح والاتصال؛ قد يعالج مزوّد المتصفح الصوت عبر خدمة خارجية. راجع النص قبل استخدامه.": "Dictation is optional and depends on your browser and connection. Your browser provider may process audio through an external service. Review the text before using it.", "اختر صورة JPG أو PNG أو WebP بحجم لا يتجاوز ٥ ميجابايت.": "Choose a JPG, PNG or WebP image up to 5 MB.", "أُضيفت صورتك إلى المعاينة محليًا.": "Photo added locally to the preview.", "تعذّر قراءة الصورة. جرّب ملفًا آخر.": "Could not read this photo. Try another file.", "حُذفت الصورة من المعاينة.": "Photo removed from the preview.", "توقف الحفظ وحُذفت المسودة المخزّنة.": "Draft saving stopped and the stored draft was deleted.", "تعذّر حذف المسودة المخزّنة.": "Could not delete the stored draft.", "حُذفت المسودة المحفوظة. إجابات الصفحة الحالية باقية.": "Saved draft deleted. Current page answers are retained.", "أدخل بريدًا إلكترونيًا صحيحًا.": "Enter a valid email address.", "أكمل بياناتك الأساسية وتحقّق من البريد والروابط.": "Complete the basics and check your email and links.", "أكّد أن مراجعاتك مبنية على استخدامك الفعلي.": "Confirm that your reviews reflect your actual experience.", "ملخص ملفك": "Portfolio summary", "المراجعات المجهولة لن تُنسب إلى ملفك العام.": "Anonymous reviews will not be attributed to your public profile.", "المراجعات المعتمدة يمكن أن تُظهر خبرتك باسمك بعد ربط النشر.": "Approved reviews can showcase your expertise under your name once publishing is connected.", "هذا ملخص محلي؛ لم يُنشأ حساب أو رابط عام ولم تُرسل بيانات إلى Nexiz.": "This is a local summary. No account or public link was created and no data was sent to Nexiz.", "راجعت ملفك. يمكنك متابعة بنائه في أي وقت.": "Portfolio reviewed. You can continue building it at any time.", "استُعيدت مسودتك المحفوظة على هذا الجهاز.": "Your saved draft was restored from this device.", "تعذّر استعادة المسودة؛ يمكنك بدء مشاركة جديدة.": "Could not restore the draft. You can start again.", "صورتك الشخصية": "Your profile photo", "اكتمال مراجعات البرامج": "Review completion", "البرامج المختارة": "Selected software", "معاينة ملفك المهني": "Portfolio preview"};

const normalize = value => value.normalize('NFKC').trim().toLocaleLowerCase().replace(/\\s+/g,' ');
const entries = catalog.CATEGORIES.flatMap(category => (catalog.SOFTWARE[category.id] || []).map(program => ({key:program.id,category_id:category.id,category:category.ar,name:program.ar,en:program.en})));
const unique = [...new Map(entries.map(entry=>[entry.key,entry])).values()];
translations['شبكة الخبراء الماليين | Nexiz']='Financial Experts Network | Nexiz';
Object.assign(translations,{"اختر البرنامج الذي استخدمته": "Select software you have used", "البحث داخل قائمة البرامج": "Search within software list", "اكتب اسم البرنامج…": "Type a software name…", "البرامج المتاحة": "Available software", "تحدث للإجابة": "Answer by voice", "إيقاف الميكروفون": "Stop microphone", "الإجابة بالصوت غير متاحة في هذا المتصفح": "Voice input is unavailable in this browser", "الإجابة بالصوت اختيارية وتعتمد على المتصفح والاتصال؛ قد يعالج مزوّد المتصفح الصوت عبر خدمة خارجية. راجع النص قبل استخدامه.": "Voice input is optional and depends on your browser and connection. Your browser provider may process audio through an external service. Review the text before using it."});
catalog.CATEGORIES.forEach(item=>translations[item.ar]=item.en);
const softwareNames=Object.fromEntries(Object.values(catalog.SOFTWARE).flat().map(item=>[item.ar,item.en]));
Object.entries(softwareNames).forEach(([ar,en])=>{if(!(ar in translations))translations[ar]=en;});
const lblMap={};
Object.entries(catalog.OPTIONS).forEach(([group,list])=>{lblMap[group]={};list.forEach(item=>{lblMap[group][item.code]=item.ar;translations[item.ar]=item.en;});});
Object.values(catalog.CITIES).flat().forEach(item=>{translations[item.ar]=item.en;});
function lbl(group,value){return (lblMap[group]&&lblMap[group][value])||value;}
function progName(value){const found=[...unique,...extras].find(program=>program.key===value);return found?found.name:value;}
function opts(group){return (catalog.OPTIONS[group]||[]).map(item=>({value:item.code,label:item.ar}));}
function fillCities(select,countryValue){[...select.options].forEach(option=>{if(option.value!==''&&option.value!=='__other__')option.remove();});const other=[...select.options].find(option=>option.value==='__other__');(catalog.CITIES[countryValue]||[]).forEach(city=>select.insertBefore(node('option',city.ar,{value:city.code}),other||null));}
Object.assign(translations,{"تُحفظ بياناتك تلقائيًا في حسابك على Nexiz كمسودة. لا يُنشر ملفك علنًا قبل مراجعته.": "Your data is saved automatically to your Nexiz account as a draft. Your profile is not published publicly before it is reviewed.", "تُحفظ بياناتك تلقائيًا في حسابك أثناء الكتابة، ويمكنك العودة لاستكمالها في أي وقت.": "Your data is saved automatically to your account as you type. You can come back and finish at any time.", "زر «مراجعة ملفي» يحفظ ملفك في حسابك ويعرض ملخصًا. لا يُنشر ملفك علنًا قبل مراجعة Nexiz، ولا يُولَّد تقرير بالذكاء الاصطناعي.": "The “Review my portfolio” button saves your profile to your account and shows a summary. Your profile is not published publicly before Nexiz reviews it, and no AI report is generated.", "JPG أو PNG أو WebP، حتى ٥ ميجابايت.": "JPG, PNG or WebP, up to 5 MB.", "حُفظت المسودة في حسابك.": "Draft saved to your account.", "حُفظ ملفك في حسابك.": "Your profile was saved to your account.", "تعذّر الحفظ. حاول مرة أخرى.": "Could not save. Please try again.", "تعذّر الحفظ؛ تحقّق من الاتصال وأبقِ الصفحة مفتوحة.": "Could not save; check your connection and keep this page open.", "جارٍ الحفظ…": "Saving…", "استُعيد ملفك المحفوظ من حسابك.": "Your saved profile was loaded from your account.", "تم حفظ ملفك في حسابك. لم يُنشأ رابط عام بعد.": "Your profile was saved to your account. No public link has been created yet.", "أُضيفت صورتك وستُحفظ في حسابك.": "Your photo was added and will be saved to your account."});
function translate(text){
  if(language==='ar')return text;
  const trim=text.trim(),suffix=trim.endsWith(' *')?' *':'',base=suffix?trim.slice(0,-2):trim;
  if(translations[base])return text.replace(trim,translations[base]+suffix);
  const patterns=[
    [/^اكتملت (\\d+) من (\\d+) مراجعات$/,(_,a,b)=>\`\${a} of \${b} reviews completed\`],
    [/^اخترت (\\d+) برامج، وأكملت (\\d+) مراجعات\\. يمكنك استكمال باقي المراجعات لاحقًا\\.$/,(_,a,b)=>\`You selected \${a} programs and completed \${b} reviews. Continue the remaining reviews later.\`],
    [/^أضفت (\\d+) شهادات و(\\d+) مشاريع\\.$/,(_,a,b)=>\`You added \${a} qualifications and \${b} projects.\`],
    [/^الخبرة: (.+)$/,(_,value)=>'Experience: '+(translations[value]||value)],
    [/^التقييم العام: (\\d) \\/ ٥$/,(_,value)=>'Overall rating: '+value+' / 5'],
    [/^(حذف|إزالة) (.+)$/,(_,action,value)=>(action==='حذف'?'Delete ':'Remove ')+(translations[value]||value)],
    [/^(.+) — إجابة أخرى$/,(_,value)=>(translations[value]||value)+' — other answer']
  ];
  for(const [pattern,replacement] of patterns)if(pattern.test(trim))return trim.replace(pattern,replacement);
  if(trim.includes(' · ')){const software=Object.values(catalog.SOFTWARE).flat().find(item=>trim===item.ar+' · '+item.en);if(software)return software.en;}
  if(trim.includes(' · '))return trim.split(' · ').map(value=>translations[value]||value).filter((value,i,arr)=>i===0||value!==arr[i-1]).join(' · ');
  return text;
}
function applyLanguage(){
  const html=document.documentElement;html.lang=language;html.dir=language==='ar'?'rtl':'ltr';
  function visit(el){
    if(el.nodeType===3){const current=el.nodeValue,previous=sourceText.get(el),source=previous&&current===previous.rendered?previous.source:current;const programName=el.parentElement?.dataset.programName,softwareOption=el.parentElement?.tagName==='OPTION' && el.parentElement.parentElement?.dataset.field==='software';const rendered=el.parentElement?.dataset.userText!==undefined?source:language==='en'&&(programName||softwareOption)?(softwareNames[programName||source]||source):translate(source);sourceText.set(el,{source,rendered});el.nodeValue=rendered;return;}
    if(['SCRIPT','STYLE','TEXTAREA'].includes(el.tagName))return;
    if(el.tagName==='OPTION' && !el.hasAttribute('value'))el.setAttribute('value',el.value);
    for(const attr of ['placeholder','aria-label','alt','title']){
      if(!el.hasAttribute?.(attr))continue;const current=el.getAttribute(attr),record=sourceAttributes.get(el)||{},previous=record[attr],source=previous&&current===previous.rendered?previous.source:current,rendered=translate(source);record[attr]={source,rendered};sourceAttributes.set(el,record);el.setAttribute(attr,rendered);
    }
    [...(el.childNodes||[])].forEach(visit);
  }
  visit(document.documentElement);
  const button=document.getElementById('language-toggle');button.textContent=language==='ar'?'English':'العربية';button.setAttribute('aria-label',language==='ar'?'Switch to English':'التبديل إلى العربية');
}
function setLanguage(value){if(activeSpeech){const previous=activeSpeech;activeSpeech=null;previous.recognition.abort();}language=value==='en'?'en':'ar';applyLanguage();saveDraft();}
document.getElementById('language-toggle').addEventListener('click',()=>setLanguage(language==='ar'?'en':'ar'));
// Defer translation until all handlers for the current interaction finish updating text.
document.getElementById('expert-form').addEventListener('input',()=>queueMicrotask(applyLanguage));
document.getElementById('expert-form').addEventListener('change',()=>queueMicrotask(applyLanguage));
document.getElementById('expert-form').addEventListener('click',()=>queueMicrotask(applyLanguage));
document.getElementById('expert-form').addEventListener('submit',()=>queueMicrotask(applyLanguage));

function node(tag, text, attrs={}) { const el=document.createElement(tag);if(text!==null)el.textContent=text;Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,value));return el; }
function options(select, list) { list.forEach(item=>{const value=typeof item==='string'?item:item.value,label=typeof item==='string'?item:item.label;select.append(node('option',label,{value}));}); }
function textField(parent,key,label,required=false,multiline=false) {
  const wrap=node('label',null,{class:'field'});wrap.append(node('span',label+(required?' *':'')));
  const input=node(multiline?'textarea':'input',null,{'data-field':key,maxlength:multiline?'2000':'120'});
  if(required)input.required=true;if(multiline && required)input.minLength=30;
  wrap.append(input);parent.append(wrap);if(multiline)addVoice(input,wrap);return input;
}
function selectField(parent,key,label,list,required=true) {
  const wrap=node('label',null,{class:'field'});wrap.append(node('span',label+(required?' *':'')));
  const input=node('select',null,{'data-field':key});input.append(node('option','اختر إجابة',{value:''}));options(input,list);input.required=required;wrap.append(input);parent.append(wrap);return input;
}

function choice(parent,key,label,list,required=false,name=false) {
  const select=selectField(parent,key,label,list,required);
  if(name){select.name=key;select.removeAttribute('data-field');}
  select.append(node('option','أخرى — اكتب الإجابة',{value:'__other__'}));
  const custom=node('input',null,{maxlength:'120',class:'other-input',placeholder:'اكتب الإجابة غير الموجودة','aria-label':label+' — إجابة أخرى'});
  custom.hidden=true;custom.disabled=true;select.parentElement.append(custom);select._custom=custom;
  function toggle(){custom.hidden=select.value!=='__other__';custom.disabled=custom.hidden;custom.required=required&&!custom.hidden;}
  select.addEventListener('change',()=>{toggle();if(!custom.hidden)custom.focus();});select._toggle=toggle;return select;
}
function fieldValue(input){return (input._custom && input.value==='__other__'?input._custom.value:input.value).trim();}
function restoreField(input,value){value=String(value??'');if(input._custom && ![...input.options].some(option=>option.value===value)){input.value='__other__';input._custom.value=value;}else input.value=value;input._toggle?.();input._sync?.();}
function paintVoice(button,listening,supported=true){
  const label=listening?'إيقاف الميكروفون':supported?'تحدث للإجابة':'الإجابة بالصوت غير متاحة في هذا المتصفح';
  button.setAttribute('aria-label',label);button.setAttribute('title',label);button.setAttribute('aria-pressed',String(listening));button.classList.toggle('recording',listening);button.replaceChildren();
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');
  const shape=document.createElementNS(ns,'rect');
  if(listening){[['x','6'],['y','6'],['width','12'],['height','12'],['rx','2'],['fill','currentColor']].forEach(([key,value])=>shape.setAttribute(key,value));svg.append(shape);}else{
    [['x','9'],['y','2'],['width','6'],['height','12'],['rx','3']].forEach(([key,value])=>shape.setAttribute(key,value));svg.append(shape);
    const path=document.createElementNS(ns,'path');path.setAttribute('d','M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8');svg.append(path);
  }
  button.append(svg);
}
function addVoice(input,wrap){
  const supported=window.SpeechRecognition||window.webkitSpeechRecognition;
  const button=node('button',null,{type:'button',class:'voice'});button.disabled=!supported;paintVoice(button,false,Boolean(supported));
  const status=node('small','',{class:'status',role:'status'});wrap.append(button,status);
  button.addEventListener('click',()=>{
    if(activeSpeech){const previous=activeSpeech;activeSpeech=null;previous.recognition.abort();if(previous.input===input)return;}
    const recognition=new supported();recognition.lang=language==='ar'?'ar-SA':'en-US';recognition.interimResults=false;recognition.continuous=false;
    const session={recognition,input};activeSpeech=session;paintVoice(button,true);
    status.textContent='جارٍ الاستماع… راجع النص بعد الإملاء.';
    recognition.onresult=event=>{if(activeSpeech!==session)return;let text='';for(let i=event.resultIndex;i<event.results.length;i++)if(event.results[i].isFinal)text+=event.results[i][0].transcript+' ';input.value=(input.value+(input.value?'\\n':'')+text.trim()).slice(0,input.maxLength||2000);input.dispatchEvent(new Event('input',{bubbles:true}));status.textContent='أُضيف النص. راجعه وعدّله قبل استخدامه.';};
    recognition.onerror=()=>{status.textContent='تعذّر الإملاء. تحقّق من إذن الميكروفون أو اكتب إجابتك.';queueMicrotask(applyLanguage);};
    recognition.onend=()=>{if(activeSpeech===session)activeSpeech=null;paintVoice(button,false);if((status.textContent.startsWith('جارٍ')||status.textContent.startsWith('Listening…')))status.textContent='انتهى الاستماع. يمكنك الكتابة أو المحاولة مجددًا.';queueMicrotask(applyLanguage);};
    try{recognition.start();}catch{activeSpeech=null;paintVoice(button,false);status.textContent='تعذّر تشغيل الإملاء هنا؛ يمكنك الكتابة.';}
  });
}
function multiChoice(parent,label,list,values){
  const select=choice(parent,'',label,list);const labelFor=v=>{const found=list.find(item=>item.value===v);return found?found.label:v;};const button=node('button','إضافة',{type:'button'});const chips=node('div',null,{class:'chips'});parent.append(button,chips);
  function render(){chips.replaceChildren();values.forEach(value=>{const chip=node('span',null,{class:'chip'});const remove=node('button','×',{type:'button','aria-label':'حذف '+labelFor(value)});remove.addEventListener('click',()=>{values.delete(value);render();changed();});chip.append(node('span',labelFor(value)),remove);chips.append(chip);});}
  button.addEventListener('click',()=>{const value=fieldValue(select);if(!value)return;values.add(value);select.value='';select._custom.value='';select._toggle();render();changed();});return render;
}
function addEntry(kind,values={}){
  const host=document.getElementById(kind);const row=node('div',null,{class:'entry'});const grid=node('div',null,{class:'grid'});row.append(grid);
  if(kind==='certificates'){
    choice(grid,'title','الشهادة أو المؤهل',opts('cert_title'));
    choice(grid,'issuer','الجهة المانحة',opts('cert_issuer'));
    selectField(grid,'year','سنة الحصول عليها',Array.from({length:47},(_,i)=>String(new Date().getFullYear()-i)),false);
    const link=textField(grid,'link','رابط الشهادة — اختياري');link.type='url';link.dir='ltr';link.maxLength=400;
  }else{
    textField(grid,'title','عنوان المشروع');
    choice(grid,'type','نوع المشروع',opts('project_type'));
    choice(grid,'role','دورك في المشروع',opts('project_role'));
    choice(grid,'industry','قطاع العميل',opts('industry'));
    choice(grid,'software','البرنامج المستخدم',[...unique,...extras].map(program=>({value:program.key,label:program.name})));
    selectField(grid,'year','سنة التنفيذ',Array.from({length:47},(_,i)=>String(new Date().getFullYear()-i)),false);
    textField(grid,'result','ما الذي أنجزته؟ وما النتيجة؟',false,true);
  }
  const remove=node('button','حذف '+(kind==='certificates'?'الشهادة':'المشروع'),{type:'button'});remove.addEventListener('click',()=>{if(activeSpeech && row.contains(activeSpeech.input))activeSpeech.recognition.abort();row.remove();changed();});row.append(remove);host.append(row);
  row.querySelectorAll('[data-field]').forEach(input=>{if(input.dataset.field in values)restoreField(input,values[input.dataset.field]);});changed();return row;
}
function entryValues(kind){return [...document.getElementById(kind).children].map(cardValues);}
function updatePortfolio(){
  const profile=profileValues(),host=document.getElementById('portfolio-content');host.replaceChildren();
  host.append(avatar?node('img',null,{src:avatar,alt:'صورتك الشخصية',class:'portrait'}):node('div',(profile.full_name||'أ').trim().slice(0,1),{class:'portrait','aria-hidden':'true'}));
  host.append(node('h2',profile.full_name||'اسمك المهني',profile.full_name?{'data-user-text':''}:{}),node('p',lbl('professional_role',profile.professional_role)||'مسمّاك وتخصصك هنا'));
  if(profile.experience_years)host.append(node('p','الخبرة: '+lbl('experience',profile.experience_years)));
  if(profile.consultant_bio)host.append(node('p',profile.consultant_bio,{'data-user-text':''}));
  const chosen=[...unique,...extras].filter(program=>selected.has(program.key)),completed=chosen.filter(program=>completeReview(cardValues(cards.get(program.key))));
  const metrics=node('div',null,{class:'mini-metrics'});[[chosen.length,'برامج استخدمتها'],[completed.length,'مراجعات مكتملة']].forEach(([number,label])=>{const part=node('div',null);part.append(node('strong',String(number)),node('span',label));metrics.append(part);});host.append(metrics);
  function chips(title,items,software=false){if(!items.length)return;host.append(node('h3',title));const group=node('div',null,{class:'chips'});items.forEach(value=>group.append(node('span',value,software?{class:'chip','data-program-name':value}:{class:'chip'})));host.append(group);}
  chips('مجالات الخبرة',[...specialtyValues].map(value=>lbl('expertise',value)));if(profile.consent_expert)chips('خدمات أرغب في تقديمها',[...serviceValues].map(value=>lbl('service',value)));chips('خبرة مع البرامج',chosen.map(program=>program.name),true);
  [['certificates','الشهادات والمؤهلات'],['projects','المشاريع والإنجازات']].forEach(([kind,title])=>{const items=entryValues(kind).filter(item=>item.title);if(!items.length)return;host.append(node('h3',title));items.forEach(item=>{const entry=node('div',null,{class:'entry'});entry.append(node('strong',kind==='certificates'?lbl('cert_title',item.title):item.title,kind==='certificates'?{}:{'data-user-text':''}));const details=kind==='certificates'?[lbl('cert_issuer',item.issuer),item.year]:[lbl('project_type',item.type),lbl('project_role',item.role),lbl('industry',item.industry),item.year];entry.append(node('p',details.filter(Boolean).join(' · ')));if(kind==='projects'&&item.software)entry.append(node('p',progName(item.software),{'data-program-name':progName(item.software)}));if(item.result)entry.append(node('p',item.result,{'data-user-text':''}));host.append(entry);});});
  const written=chosen.filter(program=>Object.values(cardValues(cards.get(program.key))).some(Boolean));
  if(written.length){host.append(node('h3',profile.anonymous?'مراجعاتك المجهولة — معاينة خاصة':'تجاربك مع البرامج'));written.forEach(program=>{const values=cardValues(cards.get(program.key)),entry=node('div',null,{class:'entry'});entry.append(node('strong',program.name,{'data-program-name':program.name}),node('p',values.review_title||'تجربة قيد الكتابة',values.review_title?{'data-user-text':''}:{}));if(validRating(values.overall_rating))entry.append(node('p','التقييم العام: '+values.overall_rating+' / ٥'));if(values.main_problem)entry.append(node('p',values.main_problem,{'data-user-text':''}));entry.append(node('small',completeReview(values)?'مكتملة في المعاينة — لم تُعتمد للنشر':'مسودة غير مكتملة',{class:'hint'}));host.append(entry);});}
  host.append(node('p','البيانات مضافة بواسطتك. توثيق الخبرة والشهادات يحتاج مراجعة؛ لا تُمنح شارة خبير بعدد البرامج.',{class:'hint'}));
}
function validPhoto(file){return ['image/jpeg','image/png','image/webp'].includes(file.type)&&file.size>0&&file.size<=5*1024*1024;}
function mergeDraft(profile,programKeys,extraPrograms,values,certificates,projects,photo,specialties,services){return {profile,selected:programKeys,extras:extraPrograms,values,certificates,projects,avatar:photo,specialties,services};}

function cardValues(card) { return Object.fromEntries([...card.querySelectorAll('[data-field]')].map(input=>[input.dataset.field,fieldValue(input)])); }
function validRating(value, optional=false) { return (optional && value==='unrated') || /^[1-5]$/.test(value); }
function completeReview(values) {
  return ['lead_company','industry','company_size','decision_maker','country','city','usage_duration','still_using','review_title','intent_to_switch','recommended_to_others','relationship'].every(key=>values[key]) && ['daily_feature','main_problem','biggest_difficulty'].every(key=>values[key] && values[key].length>=30) && validRating(values.overall_rating) && validRating(values.ease_rating) && validRating(values.support_rating,true) && validRating(values.value_rating,true) && (values.relationship==='rel_none' || Boolean(values.relationship_detail && values.relationship_detail.length>=10));
}
function buildReviews(profile, programs, reviewValues) {
  return programs.map(program=>{const data=reviewValues[program.key];return {software:program.name,category:program.category,category_id:program.category_id,language:profile.language||'ar',lead_name:profile.full_name,lead_email:profile.email,lead_phone:profile.phone,anonymous:profile.anonymous,consent_expert:profile.consent_expert,...data,overall_rating:Number(data.overall_rating),ease_rating:Number(data.ease_rating),support_rating:data.support_rating==='unrated'?null:Number(data.support_rating),value_rating:data.value_rating==='unrated'?null:Number(data.value_rating)};});
}
function makeCard(program) {
  const card=node('details',null,{class:'card'});card.dataset.key=program.key;card.open=false;
  const summary=node('summary',null);const title=node('span',null,{class:'card-title'});title.append(node('strong',program.name,{'data-program-name':program.name}),node('small',program.category));summary.append(title,node('span','غير مكتمل',{class:'badge'}));card.append(summary);
  const body=node('div',null,{class:'card-body'});card.append(body);
  body.append(node('p','صف التجربة التي بنيت عليها تقييمك، حتى يفهم القارئ الجهة وطريقة استخدام البرنامج.',{class:'hint'}));
  const context=node('div',null,{class:'grid'});body.append(context);
  textField(context,'lead_company','اسم المنشأة التي استخدمت فيها البرنامج',true);
  choice(context,'industry','قطاع المنشأة',opts('industry'),true);
  selectField(context,'company_size','حجم المنشأة',opts('company_size'));
  selectField(context,'decision_maker','من شارك في قرار اختيار البرنامج؟',opts('decision_maker'));
  const countrySel=choice(context,'country','دولة الاستخدام',opts('country'),true),citySel=choice(context,'city','مدينة الاستخدام',[],true);countrySel._sync=()=>{fillCities(citySel,countrySel.value);citySel._toggle();};countrySel.addEventListener('change',countrySel._sync);
  selectField(context,'usage_duration','مدة استخدامك لهذا البرنامج',opts('usage_duration'));
  selectField(context,'still_using','هل ما زلت تستخدم البرنامج؟',opts('still_using'));
  body.append(node('h3','التجربة العملية',{class:'group-title'}));
  const content=node('div',null,{class:'grid'});body.append(content);
  textField(content,'review_title','عنوان مختصر لتجربتك',true);
  content.append(node('p','اكتب ٣٠ حرفًا على الأقل في كل إجابة تفصيلية. اذكر مثالًا من عملك، وتجنّب بيانات العملاء أو المعلومات السرية.',{class:'hint'}));
  textField(content,'daily_feature','ما الوظائف التي استخدمتها فعليًا؟',true,true);
  textField(content,'main_problem','ما المشكلة التي ساعدك البرنامج على حلّها؟',true,true);
  textField(content,'biggest_difficulty','ما أكبر صعوبة واجهتها؟',true,true);
  textField(content,'wishlist','ما التحسين الذي تتمنى إضافته؟',false,true);
  body.append(node('h3','التقييمات',{class:'group-title'}),node('p','١ = ضعيف جدًا، ٥ = ممتاز. اختر «لا أستطيع التقييم» إذا لم تختبر الدعم أو لم تعرف التكلفة.',{class:'hint'}));
  const ratings=node('div',null,{class:'ratings'});body.append(ratings);
  [['overall_rating','التقييم العام'],['ease_rating','سهولة الاستخدام'],['support_rating','جودة الدعم'],['value_rating','القيمة مقابل السعر']].forEach(([key,label])=>{const select=selectField(ratings,key,label,['1','2','3','4','5']);if(key==='support_rating'||key==='value_rating')select.append(node('option','لا أستطيع التقييم',{value:'unrated'}));});
  const decision=node('div',null,{class:'grid'});body.append(decision);
  selectField(decision,'intent_to_switch','لو عاد بك الوقت، هل ستختار البرنامج مجددًا؟',opts('would_choose_again'));
  selectField(decision,'recommended_to_others','هل توصي الآخرين بهذا البرنامج؟',opts('recommend'));
  const disclosure=node('div',null,{class:'disclosure'});body.append(disclosure);
  const relationship=selectField(disclosure,'relationship','علاقتك بالشركة المطوّرة',opts('relationship'));
  const detail=textField(disclosure,'relationship_detail','تفاصيل العلاقة');detail.parentElement.hidden=true;
  function toggleDisclosure(){const visible=Boolean(relationship.value && relationship.value!=='rel_none');detail.required=visible;detail.minLength=10;detail.parentElement.hidden=!visible;}
  relationship.addEventListener('change',toggleDisclosure);
  card.addEventListener('input',()=>{toggleDisclosure();changed();});card.addEventListener('change',()=>{toggleDisclosure();changed();});
  return card;
}
function updateReviews() {
  const host=document.getElementById('reviews');host.querySelector('.empty')?.remove();
  [...unique,...extras].forEach(program=>{if(selected.has(program.key) && !cards.has(program.key)){const card=makeCard(program);cards.set(program.key,card);host.append(card);}const card=cards.get(program.key);if(card){card.hidden=!selected.has(program.key);card.querySelectorAll('input,select,textarea').forEach(input=>input.disabled=card.hidden || (input.classList.contains('other-input') && input.hidden));}});
  if(!selected.size && !host.querySelector('.empty'))host.append(node('p','اختر البرامج أعلاه لبدء تقييمها.',{class:'empty'}));
  updateProgress();
}
function updateProgress() {
  let complete=0;cards.forEach((card,key)=>{const done=completeReview(cardValues(card));const badge=card.querySelector('.badge');badge.textContent=done?'مكتمل':'غير مكتمل';badge.classList.toggle('complete',done);if(done && selected.has(key))complete++;});
  document.getElementById('progress-label').textContent=selected.size?\`اكتملت \${complete} من \${selected.size} مراجعات\`:'لم تختر برامج بعد';const bar=document.getElementById('completion');bar.max=selected.size||1;bar.value=complete;
}
function renderPicker() {
  const query=normalize(document.getElementById('search').value),category=document.getElementById('category-filter').value,picker=document.getElementById('picker'),select=document.getElementById('software-select');picker.replaceChildren();select.replaceChildren(node('option','اختر برنامجًا',{value:''}));
  const visible=[...unique,...extras].filter(program=>(!category||program.category_id===category)&&normalize(program.name+' '+program.en).includes(query));
  visible.forEach(program=>{const option=node('option',program.name+' · '+program.en,{value:program.key});option.disabled=selected.has(program.key);select.append(option);});select.append(node('option','برنامج غير موجود — أضف اسمه',{value:'__other__'}));
  [...unique,...extras].filter(program=>selected.has(program.key)).forEach(program=>{const chip=node('span',null,{class:'chip'}),remove=node('button','×',{type:'button','aria-label':'إزالة '+program.name});remove.addEventListener('click',()=>{if(activeSpeech&&cards.get(program.key)?.contains(activeSpeech.input))activeSpeech.recognition.abort();selected.delete(program.key);updateReviews();renderPicker();changed();});chip.append(node('span',program.name,{'data-program-name':program.name}),remove);picker.append(chip);});document.getElementById('no-results').hidden=visible.length>0;
}
function profileValues() {return {language,...Object.fromEntries([...form.querySelectorAll('[name]')].map(input=>[input.name,input.type==='checkbox'?input.checked:fieldValue(input)]))};}
let saveTimer=null,pendingSave=false,chain=Promise.resolve();
function enqueue(job){chain=chain.then(job,job);return chain;}
function currentState(){return mergeDraft(profileValues(),[...selected],extras,Object.fromEntries([...cards].map(([key,card])=>[key,cardValues(card)])),entryValues('certificates'),entryValues('projects'),avatar,[...specialtyValues],[...serviceValues]);}
async function sendState(submit){
  const status=document.getElementById('draft-status'),sentAvatar=avatar;
  try{
    const response=await fetch('/expert/api',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({submit:Boolean(submit),state:currentState()})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.ok){status.textContent=data.error||'تعذّر الحفظ. حاول مرة أخرى.';queueMicrotask(applyLanguage);return false;}
    if(avatar===sentAvatar&&typeof data.photo_url==='string')avatar=data.photo_url;
    status.textContent=submit?'حُفظ ملفك في حسابك.':'حُفظت المسودة في حسابك.';queueMicrotask(applyLanguage);return true;
  }catch{status.textContent='تعذّر الحفظ؛ تحقّق من الاتصال وأبقِ الصفحة مفتوحة.';queueMicrotask(applyLanguage);return false;}
}
function saveDraft() {
  if(restoring)return;
  clearTimeout(saveTimer);pendingSave=true;saveTimer=setTimeout(()=>{pendingSave=false;enqueue(()=>sendState(false));},1500);
}
window.addEventListener('pagehide',()=>{if(!pendingSave)return;pendingSave=false;try{navigator.sendBeacon('/expert/api',new Blob([JSON.stringify({submit:false,state:currentState()})],{type:'application/json'}));}catch{}});
function changed(){summaries.hidden=true;updateProgress();updatePortfolio();saveDraft();queueMicrotask(applyLanguage);}
function consultantVisibility(){document.getElementById('consultant-fields').hidden=!form.elements.consent_expert.checked;}

options(form.elements.experience_years,opts('experience'));
choice(document.getElementById('role-field'),'professional_role','المسمى المهني',opts('professional_role'),true,true);
const renderSpecialties=multiChoice(document.getElementById('specialties-field'),'مجالات خبرتك',opts('expertise'),specialtyValues);
const renderServices=multiChoice(document.getElementById('services-field'),'الخدمات التي تستطيع تقديمها',opts('service'),serviceValues);
const categorySelect=choice(document.getElementById('custom-category-host'),'category','فئة البرنامج',catalog.CATEGORIES.map(category=>({value:category.id,label:category.ar})));categorySelect.id='custom-category';
catalog.CATEGORIES.forEach(category=>document.getElementById('category-filter').append(node('option',category.ar,{value:category.id})));
function toggleProgramMenu(open,returnFocus=false){
  document.getElementById('program-menu').hidden=!open;document.getElementById('program-toggle').setAttribute('aria-expanded',String(open));
  if(open)document.getElementById('search').focus();else if(returnFocus)document.getElementById('program-toggle').focus();
}
function openProgramReview(key){const card=cards.get(key);if(!card)return;card.open=true;const summary=card.querySelector('summary');summary.setAttribute('tabindex','-1');summary.focus();card.scrollIntoView({behavior:'auto',block:'start'});}
document.getElementById('program-toggle').addEventListener('click',()=>toggleProgramMenu(document.getElementById('program-menu').hidden));
document.getElementById('program-dropdown').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();toggleProgramMenu(false,true);}});
document.addEventListener('click',event=>{if(!document.getElementById('program-dropdown').contains(event.target))toggleProgramMenu(false);});
document.getElementById('search').addEventListener('input',renderPicker);document.getElementById('category-filter').addEventListener('change',renderPicker);
document.getElementById('software-select').addEventListener('change',event=>{const key=event.target.value,other=key==='__other__';document.getElementById('custom-program').hidden=!other;if(other){toggleProgramMenu(false);document.getElementById('custom-name').value=document.getElementById('search').value;document.getElementById('custom-name').focus();return;}if(key){selected.add(key);document.getElementById('search').value='';updateReviews();renderPicker();changed();toggleProgramMenu(false);openProgramReview(key);}});
document.getElementById('add-custom').addEventListener('click',()=>{
  const input=document.getElementById('custom-name'),name=input.value.trim(),category=fieldValue(categorySelect),status=document.getElementById('custom-status');
  if(!name||!category){status.textContent='أدخل اسم البرنامج واختر فئته أو اكتب فئة أخرى.';return;}
  let addedKey;const existing=[...unique,...extras].find(program=>normalize(program.name)===normalize(name)||normalize(program.en)===normalize(name));
  if(existing){addedKey=existing.key;selected.add(existing.key);status.textContent='البرنامج موجود بالفعل؛ تم اختياره.';}else{const foundCategory=catalog.CATEGORIES.find(item=>item.id===category),category_id=foundCategory?foundCategory.id:'other';const program={key:'custom:'+normalize(name),name,en:name,category_id,category:foundCategory?foundCategory.ar:category};extras.push(program);addedKey=program.key;selected.add(program.key);status.textContent='أُضيف البرنامج إلى ملفك.';}
  input.value='';document.getElementById('custom-program').hidden=true;document.getElementById('search').value='';document.getElementById('category-filter').value='';renderPicker();updateReviews();changed();toggleProgramMenu(false);openProgramReview(addedKey);
});
document.getElementById('add-certificate').addEventListener('click',()=>addEntry('certificates'));
document.getElementById('add-project').addEventListener('click',()=>addEntry('projects'));
addVoice(form.elements.consultant_bio,form.elements.consultant_bio.parentElement);
const voiceNote=node('p','الإجابة بالصوت اختيارية وتعتمد على المتصفح والاتصال؛ قد يعالج مزوّد المتصفح الصوت عبر خدمة خارجية. راجع النص قبل استخدامه.',{class:'hint'});form.elements.consultant_bio.parentElement.append(voiceNote);
document.getElementById('photo').addEventListener('change',async event=>{
  const token=++photoToken,file=event.target.files[0],status=document.getElementById('photo-status');if(!file)return;
  if(!validPhoto(file)){status.textContent='اختر صورة JPG أو PNG أو WebP بحجم لا يتجاوز ٥ ميجابايت.';event.target.value='';return;}
  const url=URL.createObjectURL(file),image=new Image();
  try{image.src=url;await image.decode();if(token!==photoToken)return;const scale=Math.min(1,480/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);avatar=canvas.toDataURL('image/jpeg',0.85);document.getElementById('remove-photo').hidden=false;status.textContent='أُضيفت صورتك وستُحفظ في حسابك.';changed();}catch{if(token===photoToken)status.textContent='تعذّر قراءة الصورة. جرّب ملفًا آخر.';}finally{URL.revokeObjectURL(url);event.target.value='';queueMicrotask(applyLanguage);}
});
document.getElementById('remove-photo').addEventListener('click',()=>{photoToken++;avatar='';document.getElementById('photo').value='';document.getElementById('remove-photo').hidden=true;document.getElementById('photo-status').textContent='حُذفت الصورة من المعاينة.';changed();});
form.elements.consent_expert.addEventListener('change',consultantVisibility);
form.addEventListener('input',changed);form.addEventListener('change',changed);
// (saving is always on: there is no longer an on/off checkbox for drafts)
// (the old "delete the draft stored on this device" button was removed together with the local draft)
form.addEventListener('submit',async event=>{
  event.preventDefault();summaries.hidden=true;const status=document.getElementById('form-status'),email=form.elements.email;email.value=email.value.trim();form.elements.full_name.value=form.elements.full_name.value.trim();const role=form.elements.professional_role;if(role._custom)role._custom.value=role._custom.value.trim();email.setCustomValidity(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.value)?'':translate('أدخل بريدًا إلكترونيًا صحيحًا.'));
  const invalid=[...form.querySelectorAll('[name],#role-field .other-input')].find(input=>!input.disabled&&!input.checkValidity());
  if(invalid){status.textContent='أكمل بياناتك الأساسية وتحقّق من البريد والروابط.';status.classList.add('error');invalid.reportValidity();invalid.focus();return;}
  const programs=[...unique,...extras].filter(program=>selected.has(program.key)),ready=programs.filter(program=>completeReview(cardValues(cards.get(program.key)))),profile=profileValues();
  if(ready.length&&!profile.authenticity){status.textContent='أكّد أن مراجعاتك مبنية على استخدامك الفعلي.';status.classList.add('error');form.elements.authenticity.focus();return;}
  status.textContent='جارٍ الحفظ…';status.classList.remove('error');clearTimeout(saveTimer);pendingSave=false;const saved=await enqueue(()=>sendState(true));if(!saved){status.textContent=document.getElementById('draft-status').textContent;status.classList.add('error');return;}summaries.replaceChildren(node('h3','ملخص ملفك'),node('p',\`اخترت \${programs.length} برامج، وأكملت \${ready.length} مراجعات. يمكنك استكمال باقي المراجعات لاحقًا.\`),node('p',\`أضفت \${entryValues('certificates').filter(item=>item.title).length} شهادات و\${entryValues('projects').filter(item=>item.title).length} مشاريع.\`),node('p',profile.anonymous?'المراجعات المجهولة لن تُنسب إلى ملفك العام.':'المراجعات المعتمدة يمكن أن تُظهر خبرتك باسمك بعد ربط النشر.'),node('p','تم حفظ ملفك في حسابك. لم يُنشأ رابط عام بعد.'));summaries.hidden=false;summaries.focus();status.textContent='راجعت ملفك. يمكنك متابعة بنائه في أي وقت.';status.classList.remove('error');changed();summaries.hidden=false;
});

try{
 const state=INITIAL_STATE;
 if(state && typeof state==='object' && Array.isArray(state.selected) && Array.isArray(state.extras) && state.profile && state.values){
  restoring=true;draftOpt.checked=true;language=state.profile.language==='en'?'en':'ar';
  Object.entries(state.profile).forEach(([key,value])=>{const field=form.elements.namedItem(key);if(field && field.tagName){if(field.type==='checkbox')field.checked=Boolean(value);else restoreField(field,value);}});
  state.extras.forEach(program=>{if(program && typeof program.key==='string' && typeof program.name==='string' && typeof program.en==='string' && typeof program.category==='string' && typeof program.category_id==='string' && ![...unique,...extras].some(item=>item.key===program.key))extras.push(program);});
  state.selected.forEach(key=>{if([...unique,...extras].some(program=>program.key===key))selected.add(key);});
  const host=document.getElementById('reviews');
  [...unique,...extras].forEach(program=>{if(program.key in state.values && !cards.has(program.key)){const card=makeCard(program);cards.set(program.key,card);host.append(card);}});
  updateReviews();Object.entries(state.values).forEach(([key,values])=>{const card=cards.get(key);if(card && values && typeof values==='object')card.querySelectorAll('[data-field]').forEach(input=>{if(input.dataset.field in values)restoreField(input,values[input.dataset.field]);});});
  cards.forEach(card=>{const relationship=card.querySelector('[data-field=relationship]');relationship.dispatchEvent(new Event('change'));});

  if(Array.isArray(state.specialties))state.specialties.filter(value=>typeof value==='string').forEach(value=>specialtyValues.add(value));
  if(typeof state.profile.specialties==='string' && state.profile.specialties)specialtyValues.add(state.profile.specialties);
  if(Array.isArray(state.services))state.services.filter(value=>typeof value==='string').forEach(value=>serviceValues.add(value));
  ['certificates','projects'].forEach(kind=>{if(Array.isArray(state[kind]))state[kind].slice(0,100).forEach(values=>{if(values&&typeof values==='object')addEntry(kind,values);});});
  if(typeof state.avatar==='string' && state.avatar.startsWith('https://') && state.avatar.length<1000){avatar=state.avatar;document.getElementById('remove-photo').hidden=false;}
  renderSpecialties();renderServices();
  document.getElementById('draft-status').textContent=state.saved?'استُعيد ملفك المحفوظ من حسابك.':'';restoring=false;
 }
}catch{document.getElementById('draft-status').textContent='تعذّر استعادة المسودة؛ يمكنك بدء مشاركة جديدة.';restoring=false;}
renderPicker();updateReviews();consultantVisibility();updatePortfolio();applyLanguage();
})();
</script>
</body>
</html>
`;

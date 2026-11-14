/**
 * The Expert screen (review journey + professional profile), one self-contained HTML document.
 * Served by src/app/expert/frame/route.ts, which fills __CATALOG_JSON__ and __STATE_JSON__ in ONE pass.
 * It contains no backtick and no dollar-brace sequence, so it can live inside String.raw safely.
 */
export const EXPERT_WIZARD_HTML = String.raw`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>Nexiz</title>
<style>
:root{--bg:#f7f5ef;--card:#fff;--ink:#26241f;--muted:#635f56;--line:#e8e3d8;--green:#1a6b54;--soft:#eef4f1;--error:#a42828;--warn:#8a5304;--blue:#1d4f91}
*{box-sizing:border-box}
html{font-size:16px}
body{margin:0;background:var(--bg);color:var(--ink);font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:23px}
html[lang=ar] body{font-size:16px;line-height:28px}
button,input,select,textarea{font:inherit;color:inherit}
.ltr{direction:ltr;unicode-bidi:isolate;display:inline-block}
main{max-width:1280px;margin:0 auto;padding:18px 18px 60px}
.top{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:10px}
.top h1{font-size:1.35rem;margin:0}
.top .links{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.btn{border:1px solid var(--green);background:var(--green);color:#fff;border-radius:8px;padding:9px 16px;cursor:pointer;font-weight:600;text-decoration:none;display:inline-block}
.btn:hover{filter:brightness(1.07)}
.btn.ghost{background:#fff;color:var(--green)}
.btn.small{padding:5px 11px;font-weight:500}
.btn[disabled]{opacity:.55;cursor:not-allowed}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px;margin-bottom:16px}
.muted{color:var(--muted)}
.small{font-size:.86rem;line-height:1.6}
.progress-block{display:grid;gap:12px;margin-bottom:14px}
.slots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.slots.many{grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.slot{border:1.5px dashed #c7c3b9;background:#fff;border-radius:10px;padding:10px 12px;text-align:start;cursor:pointer;min-height:64px;display:flex;flex-direction:column;gap:4px}
.slot.filled{border-style:solid;border-color:var(--line)}
.slot.active{border-color:var(--green);box-shadow:0 0 0 2px #cfe3da}
.slot b{font-size:.95rem}
.chip-status{display:inline-block;font-size:.78rem;line-height:1.5;border-radius:999px;padding:1px 10px;border:1px solid var(--line);background:#f3f1ea;width:max-content}
.chip-status.draft{background:#f3f1ea}
.chip-status.pending{background:#fff4dc;border-color:#ecd49a;color:var(--warn)}
.chip-status.approved{background:#e4f3ea;border-color:#b9dec9;color:var(--green)}
.chip-status.rejected{background:#fbe7e7;border-color:#e8b9b9;color:var(--error)}
.bar{height:8px;background:#ebe7dc;border-radius:99px;overflow:hidden}
.bar>i{display:block;height:100%;background:var(--green);width:0}
.two{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:20px;align-items:start}
.aside{position:sticky;top:76px;display:grid;gap:14px}
.steps{position:sticky;top:0;z-index:5;background:var(--bg);padding:8px 0;display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--line);margin-bottom:14px}
.stepchip{display:flex;gap:8px;align-items:center;border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 14px;cursor:pointer}
.stepchip .dot{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:.8rem;border:1.5px solid #c7c3b9;background:#fff}
.stepchip.done .dot{background:var(--green);border-color:var(--green);color:#fff}
.stepchip.progress .dot{border-color:var(--green);color:var(--green)}
.stepchip.current{border-color:var(--green);box-shadow:0 0 0 2px #cfe3da}
.stepchip .st{font-size:.78rem;color:var(--muted)}
h2{font-size:1.15rem;margin:0 0 6px}
h3{font-size:1rem;margin:18px 0 8px}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.wide{grid-column:1/-1}
.field{display:grid;gap:5px;align-content:start}
.field>label,.field>.lbl{font-weight:600}
.req{color:var(--error)}
input[type=text],input[type=url],input[type=email],input[type=tel],select,textarea{width:100%;border:1px solid #c7c3b9;border-radius:8px;padding:9px 11px;background:#fff}
textarea{min-height:96px;resize:vertical}
input:focus,select:focus,textarea:focus,button:focus-visible{outline:2px solid var(--green);outline-offset:1px}
.field.bad input,.field.bad select,.field.bad textarea{border-color:var(--error)}
.field.bad .box,.field.bad .btns,.field.bad .picker{border-color:var(--error)}
.err{color:var(--error);font-size:.86rem;line-height:1.5;min-height:0}
.err:empty{display:none}
.note{color:var(--muted);font-size:.82rem;line-height:1.5}
.btns{display:flex;flex-wrap:wrap;gap:6px}
.opt{border:1px solid #c7c3b9;background:#fff;border-radius:8px;padding:6px 12px;cursor:pointer}
.opt.on{background:var(--green);color:#fff;border-color:var(--green)}
.checks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 14px}
.check{display:flex;gap:8px;align-items:flex-start;cursor:pointer}
.check input{margin-top:6px;flex:none}
.box{border:1px solid var(--line);border-radius:10px;padding:12px;background:#fcfbf8}
.picker{border:1px solid #c7c3b9;border-radius:10px;overflow:hidden;background:#fff}
.picker .list{max-height:250px;overflow:auto}
.picker .row{display:flex;gap:10px;align-items:center;padding:8px 12px;border-top:1px solid #f0ede4;cursor:pointer}
.picker .row:hover{background:var(--soft)}
.picker .row.on{background:var(--soft);font-weight:600}
.filters{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.chipf{border:1px solid #c7c3b9;border-radius:999px;background:#fff;padding:3px 12px;cursor:pointer}
.chipf.on{background:var(--green);color:#fff;border-color:var(--green)}
.entry{border:1px solid var(--line);border-radius:10px;padding:12px;margin:10px 0;background:#fcfbf8;display:grid;gap:10px}
.matrix{display:grid;gap:8px}
.mrow{display:grid;grid-template-columns:minmax(150px,220px) 1fr;gap:10px;align-items:center;border-bottom:1px solid #f0ede4;padding-bottom:8px}
.rate{display:grid;grid-template-columns:minmax(120px,200px) 1fr;gap:10px;align-items:center;margin-bottom:8px}
.nav{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-top:18px;padding-top:14px;border-top:1px solid var(--line)}
.nav .grp{display:flex;gap:10px;flex-wrap:wrap}
.save{font-size:.88rem;min-height:24px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.save.saved{color:var(--green)} .save.failed{color:var(--error)} .save.device{color:var(--warn)}
.link{background:none;border:0;color:var(--blue);text-decoration:underline;cursor:pointer;padding:0}
.banner{border:1px solid #e8b9b9;background:#fbe7e7;color:var(--error);border-radius:10px;padding:10px 14px;margin-bottom:12px}
.banner.info{border-color:#ecd49a;background:#fff4dc;color:var(--warn)}
.banner.ok{border-color:#b9dec9;background:#e4f3ea;color:var(--green)}
details.why{background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px 16px;margin-bottom:14px}
details.why summary{cursor:pointer;font-weight:700}
details.why p{margin:8px 0}
.pv{display:grid;gap:8px}
.pv .stars{color:#c88a00;letter-spacing:2px}
.pv .tag{display:inline-block;background:var(--soft);border:1px solid #cfe3da;border-radius:999px;padding:0 10px;font-size:.82rem;margin:2px}
.pv .who{display:flex;gap:10px;align-items:center}
.avatar{width:72px;height:72px;border-radius:50%;object-fit:cover;background:#e7e3d8;display:grid;place-items:center;font-size:1.6rem;color:var(--muted)}
.upload{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.upload input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.up-drop{border:2px dashed #c7c3b9;border-radius:10px;padding:10px 16px;cursor:pointer;background:#fff;display:inline-flex;gap:8px;align-items:center}
.up-drop:focus-within,.up-drop:hover{border-color:var(--green)}
.slot-line{display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap}
.modal{position:fixed;inset:0;background:#0008;display:grid;place-items:center;z-index:20;padding:16px}
.modal .card{max-width:460px;width:100%;margin:0}
.big-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.chip{background:var(--soft);border:1px solid #cfe3da;border-radius:999px;padding:1px 4px 1px 12px;display:inline-flex;gap:6px;align-items:center}
html[dir=rtl] .chip{padding:1px 12px 1px 4px}
.chip button{border:0;background:none;cursor:pointer;color:var(--muted);font-size:1.1rem;line-height:1}
.toast{position:fixed;bottom:16px;inset-inline:16px;max-width:520px;margin:auto;background:#26241f;color:#fff;border-radius:10px;padding:10px 14px;z-index:30}
@media(max-width:900px){.two{grid-template-columns:1fr}.aside{position:static}.slots{grid-template-columns:1fr}.grid,.checks{grid-template-columns:1fr}.mrow,.rate{grid-template-columns:1fr}}
</style>
</head>
<body>
<main id="app"></main>
<script>
'use strict';
var CAT = __CATALOG_JSON__;
var ST = __STATE_JSON__;

/* ---------- storage that never throws ---------- */
function lsGet(k){ try{ return window.localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ window.localStorage.setItem(k,v); return true; }catch(e){ return false; } }
function lsDel(k){ try{ window.localStorage.removeItem(k); }catch(e){} }

var lang = lsGet('nexiz_lang') || (ST.profile && ST.profile.language) || 'ar';
lang = lang === 'en' ? 'en' : 'ar';

/* ---------- text (Arabic first, English second). Numerals are always 0-9. ---------- */
var D = {
  title_review:['مراجعاتك','Your reviews'], title_profile:['ملفك المهني','Your professional profile'],
  step1:['النظام','The system'], step2:['تجربتك','Your experience'], step3:['التقييم والإرسال','Ratings and submit'],
  st_done:['مكتملة','Done'], st_progress:['قيد الإكمال','In progress'], st_todo:['لم تبدأ','Not started'],
  s_draft:['مسودة','Draft'], s_pending:['بانتظار الاعتماد','Submitted for moderation'], s_approved:['منشورة','Published'], s_rejected:['مرفوضة','Rejected'],
  s_pending_note:['أُرسلت المراجعة وتنتظر الاعتماد. لم تُنشر بعد.','Sent. It is waiting for moderation and is not published yet.'],
  s_approved_note:['اعتُمدت المراجعة وهي منشورة.','Approved and public.'],
  s_rejected_note:['السبب: {0}. يمكنك تعديلها وإعادة إرسالها.','Reason: {0}. You can edit it and submit it again.'],
  rev_progress:['تقدّم المراجعات','Review progress'], prof_progress:['اكتمال الملف المهني','Professional profile completion'],
  p0:['0 من 3 · مراجعة واحدة تكفي للبداية','0 of 3 · one is enough to start'],
  p1:['1 من 3 · بياناتك محفوظة، والمراجعة التالية أسرع','1 of 3 · your details are saved, the next one is quicker'],
  p2:['2 من 3 · مراجعة أخرى وتكتمل مقارنتك','2 of 3 · one more for your comparison'],
  p3:['3 من 3 · تظهر مقارنتك بعد نشر هذه المراجعات','3 of 3 · your comparison appears once these are published'],
  slot_new:['+ أضف مراجعة','+ Add a review'], slot_unsaved:['مراجعة جديدة','New review'],
  why_t:['ابدأ بمراجعة واحدة، واستهدف ثلاثًا.','Start with one. Aim for three.'],
  why_1:['مراجعة واحدة تُظهر رأيك في نظام، وثلاث مراجعات تُظهر أي نظام يناسب أي منشأة، وهذا ما يحتاجه المشتري.','One review says what you think of a system. Three show which system fits which business, and that is what buyers need.'],
  why_2:['ثلاث مراجعات تُظهر حيادك. من يراجع منتجًا واحدًا فقط قد يبدو وكأنه يروّج له، والثلاث تجعل استقلاليتك واضحة.','Three show you are neutral. An expert who reviews a single product can read like its advocate. Three make your independence clear.'],
  why_3:['ثلاث مراجعات تبني مقارنة. عند نشر ثلاث من مراجعاتك، يعرض ملفك مقارنة بين الأنظمة التي تعرفها.','Three build a comparison. Once three of your reviews are published, your profile shows a comparison of the systems you know.'],
  why_4:['صفة «خبير موثّق» مستقلة. يمنحها فريقنا بعد التحقق من خبرتك، لا بعدد المراجعات.','Verified expert status is separate. Our team grants it after checking your experience, not by counting reviews.'],
  why_5:['المراجعة الأولى تستغرق بضع دقائق، وتُحفظ إجاباتك أولًا بأول. يمكنك التوقف والعودة في أي وقت.','The first review takes a few minutes and your answers are saved as you go. You can stop and come back at any time.'],
  never_req:['ثلاث مراجعات مشجَّعة لكنها ليست إلزامية.','Three reviews are encouraged but never required.'],
  verified_note:['يمنح فريقنا صفة «خبير موثّق» بعد التحقق من خبرتك، ولا ترتبط بعدد المراجعات.','Verified expert status is granted by our team after checking your experience. It does not depend on the number of reviews.'],
  step1_note:['يمكنك الإجابة عن هذه الأسئلة الآن، وسيُطلب منك تسجيل الدخول لحفظ مراجعتك وإرسالها.','You can answer these questions now. You\u2019ll sign in to save and submit your review.'],
  q_software:['أي نظام تراجعه؟','Which software are you reviewing?'],
  search_ph:['ابحث باسم النظام بالعربية أو الإنجليزية','Search by name, in Arabic or English'],
  f_all:['كل الفئات','All categories'], f_pos:['نقاط البيع (POS)','POS'], f_erp:['تخطيط الموارد (ERP)','ERP'], f_accounting:['الأنظمة المحاسبية','Accounting systems'],
  not_listed:['النظام غير موجود في القائمة (اكتب اسمه)','My software isn\u2019t listed (enter its name)'],
  custom_name:['اسم النظام','Software name'], custom_type:['نوع النظام','Type of system'],
  custom_note:['سيراجع فريقنا هذا الاسم. يمكنك إرسال المراجعة الآن، وتُربط بصفحة المنتج بعد أن يطابقه المسؤول أو ينشئه.','Our team will check this name. You can submit the review now; it links to a product page after an admin matches or creates the product.'],
  no_results:['لا توجد نتائج.','No results.'],
  q_role:['دورك عند استخدامه','Your role when you used it'], role_ph:['ابحث أو اكتب دورك','Search or type your role'],
  q_duration:['كم مدة استخدامك له؟','How long have you used it?'], choose:['اختر','Choose'],
  q_functions:['ما الوظائف التي استخدمتها بنفسك في هذا النظام؟','Which functions have you personally used?'],
  fn_first:['اختر النظام أولًا لتظهر وظائفه.','Choose the software first to see its functions.'],
  select_all:['تحديد الكل','Select all'], other_specify:['أخرى (يرجى التحديد)','Other (please specify)'], fn_other_ph:['اسم الوظيفة','Name of the function'],
  q_btype:['نوع المنشأة','Business type'], q_bname:['اسم المنشأة','Business name'], bname_note:['يُستخدم للتحقق فقط ولا يُعرض للعامة.','Used for verification only, not shown publicly.'],
  q_size:['حجم المنشأة','Company size'], q_deciders:['من شارك في قرار اختيار النظام؟','Who took part in choosing the software?'],
  q_golive:['كم استغرق تشغيل النظام فعليًا؟','How long did go-live take?'], q_longer:['هل استغرق أطول مما قيل لك؟','Was it longer than you were told?'], q_impl:['من نفّذ التطبيق؟','Who did the implementation?'],
  q_integ:['ما الأنظمة أو التطبيقات التي ربطتها بنفسك بهذا النظام؟','Which systems or applications have you personally connected to this software?'],
  int_name:['النظام أو التطبيق','System or application'], int_name_ph:['اختر من القائمة أو اكتب اسمًا','Pick from the list or type a name'],
  int_purpose:['الغرض من الربط: ما البيانات أو العمليات التي يتناولها؟','Integration purpose: what data or process does it handle?'],
  int_how:['كيف كان أداء الربط؟','How did it work?'], int_exp:['تجربتك العملية: كيف استخدمته، وما الذي نجح، وما المشكلات التي واجهتك؟','Practical experience: how did you use it, what worked, what problems did you face?'],
  int_add:['+ أضف ربطًا','+ Add an integration'], int_remove:['حذف هذا الربط','Remove this integration'],
  int_none:['لم أستخدم أي ربط مع أنظمة أخرى','I have not used any integrations'],
  q_comp:['كيف تعامل النظام مع الامتثال السعودي؟','How did the software handle Saudi compliance?'],
  q_diff:['ما أكبر صعوبة واجهتها؟','What was the biggest difficulty?'],
  q_wish:['ما التحسين الذي تتمنى رؤيته؟','What improvement would you like to see?'], q_whonot:['من لا ينبغي أن يشتري هذا النظام؟','Who should NOT buy this software?'],
  whonot_ph:['نوع المنشأة وحجمها التي لا يناسبها النظام، ولماذا.','The kind and size of business it does not suit, and why.'],
  min30_hint:['30 حرفًا على الأقل.','At least 30 characters.'],
  lands:['تظهر هذه الإجابة في صفحة {0} بعد نشرها.','This appears on the {0} page once published.'],
  q_cost:['كم كلّف تقريبًا سنويًا؟','Cost per year'], q_prev:['ماذا كنت تستخدم قبل ذلك؟','What were you using before?'], prev_ph:['ابحث في الأنظمة أو اكتب اسمًا','Search the systems or type a name'],
  prev_none:['لا شيء / جداول بيانات','Nothing / spreadsheets'], q_still:['هل ما زلت تستخدمه؟','Do you still use it?'],
  q_moved:['إلى ماذا انتقلت؟','What did you move to?'], q_moved_why:['وما السبب؟','And why?'],
  q_ratings:['التقييم','Rating'], r_overall:['التقييم العام','Overall'], r_ease:['سهولة الاستخدام','Ease of use'], r_support:['جودة الدعم','Support'], r_value:['القيمة مقابل السعر','Value for money'],
  rate_hint:['1 = ضعيف جدًا، 5 = ممتاز.','1 = very poor, 5 = excellent.'], unable:['لا أستطيع التقييم','Unable to rate'],
  q_again:['لو عاد بك الوقت، هل ستختاره مجددًا؟','Would you choose it again?'], q_recommend:['هل توصي الآخرين به؟','Would you recommend it?'],
  q_rel:['علاقتك بالشركة المطورة','Relationship with the vendor'], q_rel_detail:['تفاصيل العلاقة','Details of the relationship'],
  declaration:['أؤكد أن مراجعتي مبنية على استخدام فعلي، وأنني أفصحت عن أي علاقة تجارية أو مهنية مع الشركات المطورة.','I confirm that my review is based on actual use, and that I have disclosed any commercial or professional relationship with the software vendors.'],
  anonymous:['انشر هذه المراجعة دون اسمي','Publish this review without my name'], anon_note:['لا تُنسب المراجعة المجهولة إلى اسمك في الصفحة العامة.','An anonymous review is not shown under your name on the public page.'],
  next:['التالي','Next'], back:['السابق','Back'], save_later:['احفظ وأكمل لاحقًا','Save and continue later'], submit:['إرسال المراجعة للاعتماد','Submit review for moderation'],
  sv_device:['محفوظة على هذا الجهاز فقط · سجّل الدخول لحفظها','Kept on this device only \u00b7 sign in to save'],
  sv_saving:['جارٍ الحفظ...','Saving...'], sv_saved:['تم الحفظ \u00b7 {0}','Saved \u00b7 {0}'], sv_failed:['تعذّر الحفظ \u00b7 إعادة المحاولة','Could not save \u00b7 Retry'],
  clear_device:['احذف إجاباتي من هذا الجهاز','Clear my answers from this device'], clear_confirm:['حذف الإجابات المحفوظة على هذا الجهاز؟','Delete the answers kept on this device?'],
  si_title:['احفظ مراجعتك وتابع','Save your review and continue'], si_text:['سجّل الدخول لحفظ إجاباتك في حسابك. لن تفقد أي شيء أدخلته.','Sign in to save your answers to your account. Nothing you\u2019ve entered will be lost.'],
  si_google:['المتابعة باستخدام Google','Continue with Google'], si_linkedin:['المتابعة باستخدام LinkedIn','Continue with LinkedIn'], si_email:['تسجيل الدخول بالبريد وكلمة المرور','Sign in with email and password'],
  si_register:['إنشاء حساب جديد','Create an account'], si_cancel:['العودة إلى الأسئلة','Back to the questions'],
  si_failed:['لم يكتمل تسجيل الدخول. إجاباتك ما زالت هنا، حاول مرة أخرى.','Sign-in didn\u2019t complete. Your answers are still here. Please try again.'],
  done_t:['تم إرسال مراجعتك. يتحقق فريقنا من كل مراجعة قبل نشرها.','Your review has been submitted. Our team checks every review before it is published.'],
  prof_now:['أكمل ملفك المهني','Complete your profile'], prof_later:['أكمله لاحقًا','Complete your profile later'], add_another:['أضف مراجعة أخرى','Add another review'],
  continue_:['أكمل','Continue'], edit_resubmit:['عدّل وأعد الإرسال','Edit and resubmit'], view_:['عرض','View'], to_reviews:['العودة إلى مراجعاتك','Back to your reviews'], to_profile:['الملف المهني','Professional profile'],
  preview_t:['معاينة: هكذا ستظهر مراجعتك','Preview: how this review will appear'], preview_note:['تتحدث المعاينة أثناء الكتابة. لا تُنشر هذه البيانات إلا بعد الاعتماد.','The preview updates as you type. Nothing is published before moderation.'],
  pv_empty:['ابدأ بالإجابة لتظهر المعاينة.','Start answering to see the preview.'], pv_anon:['خبير (دون اسم)','Expert (name hidden)'], pv_fns:['الوظائف التي استخدمها','Functions used'], pv_integ:['الربط','Integrations'],
  already:['سبق أن أرسلت مراجعة لهذا النظام.','You already submitted a review for this software.'],
  saved_later:['تم حفظ المسودة. يمكنك العودة وإكمالها في أي وقت.','Draft saved. You can come back and finish it at any time.'],
  need_signin:['سجّل الدخول لحفظ المراجعة.','Sign in to save your review.'],
  /* profile */
  p_photo:['صورتك المهنية','Your professional photo'], p_choose:['اختر صورة','Choose a photo'], p_change:['تغيير الصورة','Change photo'], p_remove:['إزالة الصورة','Remove photo'],
  p_photo_note:['JPG أو PNG أو WebP، حتى 5 ميجابايت.','JPG, PNG or WebP, up to 5 MB.'], p_photo_prefill:['صورة من حسابك على Google أو LinkedIn. يمكنك تغييرها.','Picture from your Google or LinkedIn account. You can change it.'],
  p_name:['الاسم الكامل','Full name'], p_email:['البريد الإلكتروني','Email'], p_phone:['رقم الهاتف','Phone'], p_role:['المسمى المهني','Professional role'],
  p_exp:['سنوات الخبرة','Years of experience'], p_expertise:['مجالات خبرتك','Areas of expertise'], p_expertise_ph:['ابحث أو اكتب مجالًا ثم اضغط إضافة','Search or type an area, then press Add'],
  p_bio:['نبذة عنك','Bio'], p_linkedin:['رابط ملفك على LinkedIn','LinkedIn profile URL'], p_linkedin_note:['ألصق رابط ملفك بنفسك. لا يوفّره LinkedIn عند تسجيل الدخول.','Paste your profile link yourself. LinkedIn does not provide it at sign-in.'],
  p_consent:['أوافق على أن تتواصل Nexiz معي بخصوص فرص العمل الاستشاري.','I agree that Nexiz may contact me about consulting opportunities.'], p_services:['الخدمات التي تستطيع تقديمها','Services you can offer'],
  p_certs:['الشهادات والمؤهلات','Certifications and qualifications'], p_certs_skip:['ليست لديك شهادات؟ يمكنك تخطي هذا القسم.','No certifications? You can skip this section.'],
  p_cert_name:['اسم الشهادة','Certification name'], p_cert_issuer:['الجهة المانحة','Issuing organization'], p_cert_year:['سنة الحصول عليها','Year obtained'], p_cert_url:['رابط الشهادة','Certificate URL'],
  p_add_cert:['+ إضافة شهادة','+ Add a certification'], p_projects:['المشاريع والإنجازات','Projects and achievements'], p_add_project:['+ إضافة مشروع','+ Add a project'],
  p_proj_title:['عنوان المشروع','Project title'], p_proj_type:['نوع المشروع','Project type'], p_proj_role:['دورك في المشروع','Your role in the project'], p_proj_ind:['قطاع العميل','Client industry'],
  p_proj_sw:['النظام المستخدم','Software used'], p_proj_year:['سنة التنفيذ','Year'], p_proj_result:['ما الذي أنجزته؟ وما النتيجة؟','What did you do, and what was the result?'],
  p_remove_item:['حذف','Remove'], p_add:['إضافة','Add'], p_save:['حفظ الملف المهني','Save profile'], p_saved_msg:['تم حفظ ملفك المهني.','Your profile was saved.'],
  p_hint:['الحقول المطلوبة مشار إليها بعلامة *. الملف غير المكتمل لا يمنع إرسال أي مراجعة.','Required fields are marked *. An incomplete profile never blocks a review.'],
  p_pv_t:['معاينة ملفك المهني','Your profile preview'], p_pv_note:['هذه البيانات أدخلتها بنفسك. تُراجع الخبرة والشهادات قبل اعتمادها، وصفة «خبير موثّق» لا ترتبط بعدد المراجعات.','You added this information yourself. Experience and certifications are checked before they are accepted, and verified expert status does not depend on the number of reviews.'],
  p_pv_name:['اسمك','Your name'], p_reviews_count:['مراجعات أرسلتها','Reviews submitted'], p_published_count:['مراجعات منشورة','Published reviews'],
  p_other_hint:['أخرى — اكتب الإجابة','Other \u2014 type your answer'],
  lang_btn:['English','\u0627\u0644\u0639\u0631\u0628\u064a\u0629'],
  /* messages under fields (Appendix B + generic) */
  e_software:['اختر النظام الذي تراجعه.','Choose the software you\u2019re reviewing.'], e_role:['اختر دورك عند استخدامه.','Choose your role when you used it.'],
  e_duration:['اختر مدة استخدامك له.','Choose how long you used it.'], e_functions:['اختر وظيفة واحدة على الأقل استخدمتها بنفسك.','Choose at least one function you used yourself.'],
  e_other_fn:['اكتب اسم الوظيفة.','Write the name of the function.'],
  e_int_purpose:['اكتب الغرض من هذا الربط، أو اختر «لم أستخدم أي ربط مع أنظمة أخرى».','Add what this integration handles, or choose \u201cI have not used any integrations\u201d.'],
  e_int_status:['اختر كيف كان أداء هذا الربط.','Choose how this integration worked.'],
  e_compliance:['أجب عن كل صف، أو اختر «لم أستخدمه».','Answer each row, or choose \u201cDid not use it\u201d.'],
  e_min30:['أضف 30 حرفًا على الأقل حتى تفيد إجابتك المشترين.','Add at least 30 characters so the answer is useful to buyers.'],
  e_min10:['أضف 10 أحرف على الأقل.','Add at least 10 characters.'],
  e_short:['تبدو هذه الإجابة غير مكتملة، يرجى مراجعتها.','This doesn\u2019t look like a complete answer. Please check it.'],
  e_ratings:['اختر تقييمًا، أو «لا أستطيع التقييم».','Choose a rating, or \u201cUnable to rate\u201d.'],
  e_declaration:['يرجى تأكيد الإقرار لإرسال المراجعة.','Please confirm the declaration to submit.'],
  e_required:['هذا الحقل مطلوب.','This field is required.'], e_email:['أدخل بريدًا إلكترونيًا صحيحًا.','Enter a valid email address.'],
  e_linkedin:['أدخل رابط ملفك على LinkedIn (linkedin.com).','Enter your LinkedIn profile URL (linkedin.com).'], e_failed:['تعذّر الحفظ. حاول مرة أخرى.','Could not save. Please try again.']
};
function t(k){ var e = D[k]; if(!e){ return k; } var s = e[lang === 'ar' ? 0 : 1]; for(var i = 1; i < arguments.length; i++){ s = s.split('{' + (i - 1) + '}').join(arguments[i]); } return s; }

/* ---------- tiny DOM helpers ---------- */
var LATIN = /([A-Za-z][A-Za-z0-9&+.\/'-]*(?: [A-Za-z0-9&+.\/'-]+)*|\d{1,2}:\d{2})/g;
/** Text node; in Arabic every Latin word (Nexiz, LinkedIn, POS, ERP, times...) is isolated left-to-right. */
function frag(s){
  s = String(s == null ? '' : s);
  if(lang !== 'ar' || !/[A-Za-z]|\d{1,2}:\d{2}/.test(s)){ return document.createTextNode(s); }
  var f = document.createDocumentFragment(), last = 0, m;
  LATIN.lastIndex = 0;
  while((m = LATIN.exec(s))){
    if(m.index > last){ f.appendChild(document.createTextNode(s.slice(last, m.index))); }
    var sp = document.createElement('span'); sp.className = 'ltr'; sp.textContent = m[0]; f.appendChild(sp);
    last = m.index + m[0].length;
  }
  if(last < s.length){ f.appendChild(document.createTextNode(s.slice(last))); }
  return f;
}
function h(tag, attrs){
  var el = document.createElement(tag);
  if(attrs){ Object.keys(attrs).forEach(function(k){
    var v = attrs[k];
    if(v == null || v === false){ return; }
    if(k === 'class'){ el.className = v; }
    else if(k.slice(0, 2) === 'on'){ el.addEventListener(k.slice(2), v); }
    else if(k === 'value' || k === 'checked' || k === 'disabled' || k === 'selected'){ el[k] = v; }
    else if(k === 'text'){ el.appendChild(frag(v)); }
    else { el.setAttribute(k, v === true ? '' : v); }
  }); }
  for(var i = 2; i < arguments.length; i++){ add(el, arguments[i]); }
  return el;
}
function add(el, c){
  if(c == null || c === false){ return; }
  if(Array.isArray(c)){ c.forEach(function(x){ add(el, x); }); }
  else if(typeof c === 'string' || typeof c === 'number'){ el.appendChild(frag(c)); }
  else { el.appendChild(c); }
}
function clear(el){ while(el.firstChild){ el.removeChild(el.firstChild); } return el; }
function $(s, r){ return (r || document).querySelector(s); }
function lab(o){ return o ? (lang === 'ar' ? (o.ar || o.en) : (o.en || o.ar)) : ''; }
function optOf(group, code){ var l = (CAT.OPTIONS[group] || []); for(var i = 0; i < l.length; i++){ if(l[i].code === code){ return l[i]; } } return null; }
function pad2(n){ return (n < 10 ? '0' : '') + n; }
function clock(d){ return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
function norm(s){
  return String(s || '').normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[\u0623\u0625\u0622]/g, '\u0627').replace(/\u0649/g, '\u064A').replace(/\u0629/g, '\u0647').toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}
function badShort(s){
  s = String(s || '').trim();
  if(s.length < 2){ return true; }
  var letters = Array.from(s).filter(function(c){ return /\p{L}/u.test(c); });
  if(letters.length < 2){ return true; }
  var set = {}, n = 0; Array.from(s.toLowerCase()).forEach(function(c){ if(/[\p{L}\p{N}]/u.test(c) && !set[c]){ set[c] = 1; n++; } });
  if(n < Math.min(3, letters.length)){ return true; }
  return /(.)\1{2,}/u.test(s);
}
function softwareById(id){ for(var i = 0; i < CAT.SOFTWARE.length; i++){ if(CAT.SOFTWARE[i].id === id){ return CAT.SOFTWARE[i]; } } return null; }

/* =====================================================================================
 * Review journey
 * ===================================================================================== */
var view = ST.view === 'profile' && ST.signedIn ? 'profile' : 'review';
var signedIn = !!ST.signedIn;
var reviews = (ST.reviews || []).slice();
var cur = null, screen = 'wizard';
var DEVICE_KEY = 'nexiz_expert_device_v1', DEVICE_DAYS = 7;
var activeMs = 0, lastEvt = Date.now();
var saveState = { kind: 'idle', at: null }, saveChain = Promise.resolve(), saveTimer = null, deviceTimer = null;
var flashMsg = ST.signinFailed ? { kind: 'err', text: 'si_failed' } : null;

function blank(){
  return { software:'', custom_name:'', custom_group:'accounting', role:'', duration:'', functions:[], functions_other:'',
    business_type:'', business_name:'', company_size:'', deciders:[], golive_time:'', longer_than_told:'', implementer:'',
    integrations:[], no_integrations:false, compliance:{}, difficulty:'', wishlist:'', who_not_buy:'', annual_cost:'', previous_software:'',
    still_using:'', moved_to:'', moved_reason:'', overall:'', ease:'', support:'', value:'', choose_again:'', recommend:'', relationship:'', relationship_detail:'',
    declaration:false, anonymous:false };
}
function mergeA(src){
  var a = blank(); src = src || {};
  Object.keys(a).forEach(function(k){
    if(src[k] === undefined || src[k] === null){ return; }
    if(Array.isArray(a[k])){ a[k] = Array.isArray(src[k]) ? JSON.parse(JSON.stringify(src[k])) : []; }
    else if(typeof a[k] === 'object'){ a[k] = Object.assign({}, src[k]); }
    else { a[k] = src[k]; }
  });
  return a;
}
function newReview(){ return { id:null, status:'draft', step:1, a:blank(), errs:{} }; }
function fromDto(r){ activeMs = Number(lsGet('nexiz_t_' + r.id)) || 0; return { id:r.id, status:r.status, step:Math.min(3, Math.max(1, r.step || 1)), a:mergeA(r.answers), errs:{}, reason:r.reject_reason, name:r.software_name }; }
function curGroup(){
  var sw = softwareById(cur.a.software);
  if(sw){ return sw.group; }
  return cur.a.software === 'custom' ? cur.a.custom_group : null;
}
function curName(){
  var sw = softwareById(cur.a.software);
  return sw ? lab(sw) : (cur.a.software === 'custom' ? cur.a.custom_name : '');
}
function readOnly(){ return cur.status === 'pending' || cur.status === 'approved'; }
function isNo(code){ var o = optOf('still_using', code); return !!o && (o.ar === '\u0644\u0627' || /^no$/i.test(o.en || '')); }

/* ---------- validation: the same rules as the server (the server is the one that decides) ---------- */
var STEP1 = ['software','custom_name','role','duration','functions','functions_other'];
var STEP3 = ['ratings','choose_again','recommend','relationship','relationship_detail','declaration'];
function stepOf(f){ return STEP1.indexOf(f) >= 0 ? 1 : STEP3.indexOf(f) >= 0 ? 3 : 2; }
function validateAll(a){
  var e = {};
  function short(f, v, empty){ if(!v){ e[f] = empty || 'required'; } else if(badShort(v)){ e[f] = 'short'; } }
  if(!softwareById(a.software) && a.software !== 'custom'){ e.software = 'software'; }
  if(a.software === 'custom'){ short('custom_name', a.custom_name, 'required'); }
  short('role', a.role, 'role');
  if(!a.duration){ e.duration = 'duration'; }
  if(!a.functions.length){ e.functions = 'functions'; }
  else if(a.functions.indexOf('other') >= 0){ if(!a.functions_other){ e.functions_other = 'other_fn'; } else if(badShort(a.functions_other)){ e.functions_other = 'short'; } }
  if(!a.business_type){ e.business_type = 'required'; }
  short('business_name', a.business_name);
  if(!a.company_size){ e.company_size = 'required'; }
  if(!a.deciders.length){ e.deciders = 'required'; }
  if(!a.golive_time){ e.golive_time = 'required'; }
  if(!a.longer_than_told){ e.longer_than_told = 'required'; }
  if(!a.no_integrations){
    if(!a.integrations.length){ e.integrations = 'int_purpose'; }
    a.integrations.forEach(function(x, i){
      if(!x.name){ e['integrations.' + i + '.name'] = 'required'; } else if(badShort(x.name)){ e['integrations.' + i + '.name'] = 'short'; }
      if(!x.purpose){ e['integrations.' + i + '.purpose'] = 'int_purpose'; } else if(badShort(x.purpose)){ e['integrations.' + i + '.purpose'] = 'short'; }
      if(!x.outcome){ e['integrations.' + i + '.outcome'] = 'int_status'; }
    });
  }
  if(CAT.COMPLIANCE_ROWS.some(function(r){ return !a.compliance[r.code]; })){ e.compliance = 'compliance'; }
  if((a.wishlist || '').length < 30){ e.wishlist = 'min30'; }
  if((a.who_not_buy || '').length < 30){ e.who_not_buy = 'min30'; }
  if(!a.annual_cost){ e.annual_cost = 'required'; }
  short('previous_software', a.previous_software);
  if(!a.still_using){ e.still_using = 'required'; }
  if(a.moved_to && badShort(a.moved_to)){ e.moved_to = 'short'; }
  if(!a.overall || !a.ease || !a.support || !a.value){ e.ratings = 'ratings'; }
  if(!a.choose_again){ e.choose_again = 'required'; }
  if(!a.recommend){ e.recommend = 'required'; }
  if(!a.relationship){ e.relationship = 'required'; }
  else if(a.relationship !== 'rel_none' && (a.relationship_detail || '').length < 10){ e.relationship_detail = 'min10'; }
  if(!a.declaration){ e.declaration = 'declaration'; }
  return e;
}
function errText(code){ return t('e_' + code); }
function wrapOf(f){ return $('[data-f="' + f + '"]'); }
function setErr(f, code){
  var w = wrapOf(f); if(!w){ return; }
  w.classList.add('bad');
  var s = $('.err', w); if(s){ clear(s).appendChild(frag(errText(code))); }
  var c = w.querySelector('input,select,textarea,button'); if(c){ c.setAttribute('aria-invalid', 'true'); }
}
function clearErr(f){
  var w = wrapOf(f); if(!w){ return; }
  w.classList.remove('bad');
  var s = $('.err', w); if(s){ clear(s); }
  var c = w.querySelector('[aria-invalid]'); if(c){ c.removeAttribute('aria-invalid'); }
}
/** Shows the stored errors that belong to the visible step; optionally moves focus to the first one. */
function applyErrs(focus){
  var first = null;
  var ws = document.querySelectorAll('#form [data-f]');
  Array.prototype.forEach.call(ws, function(w){
    var f = w.getAttribute('data-f'), code = cur.errs[f];
    if(code){ setErr(f, code); if(!first){ first = w; } }
  });
  if(focus && first){
    var c = first.querySelector('input,select,textarea,button');
    if(c){ c.focus(); if(c.scrollIntoView){ try{ c.scrollIntoView({ block:'center' }); }catch(x){} } }
  }
}
function recheck(f){
  if(!cur.errs || !Object.keys(cur.errs).length){ return; }
  var now = validateAll(cur.a);
  Object.keys(cur.errs).forEach(function(k){
    if(k === f || k.indexOf(f + '.') === 0 || f.indexOf(k + '.') === 0 || k === 'integrations'){ if(!now[k]){ delete cur.errs[k]; clearErr(k); } }
  });
}

/* ---------- activity / timing ---------- */
function activity(){ var n = Date.now(), d = n - lastEvt; if(d < 60000){ activeMs += d; } lastEvt = n; }

/* ---------- save indicator ---------- */
function setSave(kind, at){ saveState = { kind:kind, at:at || null }; renderSaveBar(); }
function renderSaveBar(){
  var bars = document.querySelectorAll('.save'); 
  Array.prototype.forEach.call(bars, function(b){
    clear(b); b.className = 'save ' + saveState.kind;
    if(saveState.kind === 'device'){
      b.appendChild(frag(t('sv_device')));
      b.appendChild(h('button', { type:'button', class:'link', onclick:clearDevice, text:t('clear_device') }));
    } else if(saveState.kind === 'saving'){ b.appendChild(frag(t('sv_saving'))); }
    else if(saveState.kind === 'saved'){ b.appendChild(frag(t('sv_saved', clock(saveState.at || new Date())))); }
    else if(saveState.kind === 'failed'){ b.appendChild(h('button', { type:'button', class:'link', onclick:function(){ doSave(false); }, text:t('sv_failed') })); }
  });
}

/* ---------- device copy (signed-out visitors): step 1 only, 7 days ---------- */
function deviceRead(){
  var raw = lsGet(DEVICE_KEY); if(!raw){ return null; }
  try{ var d = JSON.parse(raw); if(!d || !d.at || Date.now() - d.at > DEVICE_DAYS * 86400000){ lsDel(DEVICE_KEY); return null; } return d; }catch(e){ lsDel(DEVICE_KEY); return null; }
}
function deviceWrite(){
  var a = cur.a;
  lsSet(DEVICE_KEY, JSON.stringify({ at:Date.now(), a:{ software:a.software, custom_name:a.custom_name, custom_group:a.custom_group, role:a.role, duration:a.duration, functions:a.functions, functions_other:a.functions_other }, ms:Math.round(activeMs) }));
  setSave('device');
}
function deviceQueue(){ clearTimeout(deviceTimer); deviceTimer = setTimeout(deviceWrite, 300); }
function clearDevice(){
  if(!window.confirm(t('clear_confirm'))){ return; }
  lsDel(DEVICE_KEY); cur = newReview(); activeMs = 0; setSave('idle'); renderApp();
}

/* ---------- saving to the account ---------- */
function applySaved(r){
  cur.id = r.id; cur.status = r.status; cur.name = r.software_name; cur.reason = r.reject_reason;
  var i = reviews.findIndex(function(x){ return x.id === r.id; });
  if(i >= 0){ reviews[i] = r; } else { reviews.push(r); }
  lsSet('nexiz_t_' + r.id, String(Math.round(activeMs)));
  renderProgress();
}
function queueSave(){
  if(!signedIn || readOnly()){ return; }
  var a = cur.a; if(!a.software || (a.software === 'custom' && !a.custom_name)){ return; }
  clearTimeout(saveTimer); saveTimer = setTimeout(function(){ doSave(false); }, 1500);
}
function doSave(submit){
  clearTimeout(saveTimer);
  var job = function(){
    if(!signedIn){ return Promise.resolve({ ok:false, signin:true }); }
    if(!cur.a.software){ return Promise.resolve({ ok:false, nosoftware:true }); }
    if(window.navigator.onLine === false){ setSave('failed'); return Promise.resolve({ ok:false }); }
    setSave('saving');
    var body = { id:cur.id, step:cur.step, submit:!!submit, language:lang, answers:cur.a, timing:{ total_ms:Math.round(activeMs) } };
    return fetch('/expert/api/review', { method:'POST', credentials:'same-origin', headers:{ 'content-type':'application/json' }, body:JSON.stringify(body) })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(d){ return { status:r.status, d:d }; }); })
      .then(function(x){
        var d = x.d;
        if(x.status === 401){ signedIn = false; setSave('device'); return { ok:false, signin:true }; }
        if(d.ok){ applySaved(d.review); setSave('saved', new Date(d.savedAt || Date.now())); return { ok:true, review:d.review }; }
        if(d.errors){ setSave('idle'); return { ok:false, errors:d.errors }; }
        setSave('failed'); if(d.error){ flash('err', d.error); } return { ok:false, error:d.error };
      })
      .catch(function(){ setSave('failed'); return { ok:false }; });
  };
  saveChain = saveChain.then(job, job);
  return saveChain;
}
/** The visitor just signed in: move the device answers to the account as a Draft, delete the device copy only after the server confirmed. */
function migrateDevice(d){
  cur = newReview(); cur.a = mergeA(d.a); activeMs = d.ms || 0; cur.step = 1; screen = 'wizard';
  renderApp();
  return doSave(false).then(function(r){
    if(r && r.ok){ lsDel(DEVICE_KEY); cur = fromDto(r.review); cur.step = 2; renderApp(); }
    else { setSave('failed'); }
  });
}

/* ---------- a change in any answer ---------- */
function touch(f){
  activity();
  if(view === 'profile'){ pTouch(f); return; }
  cur.dirty = true;
  if(f){ recheck(f); }
  renderPreview(); renderChips();
  if(signedIn){ queueSave(); } else { deviceQueue(); }
}
function flash(kind, key){ flashMsg = { kind:kind, text:key }; paintFlash(); }
function paintFlash(){
  var f = $('#flash'); if(!f){ return; } clear(f);
  if(flashMsg){ f.appendChild(h('div', { class:'banner ' + (flashMsg.kind === 'err' ? '' : flashMsg.kind), role:'alert' }, (D[flashMsg.text] ? t(flashMsg.text) : flashMsg.text), ' ', h('button', { type:'button', class:'link', onclick:function(){ flashMsg = null; paintFlash(); }, text:'\u00d7' }))); }
}

/* ---------- widgets ---------- */
function fieldWrap(key, label, control, o){
  o = o || {};
  var w = h('div', { class:'field' + (o.wide ? ' wide' : ''), 'data-f':key });
  if(label){ w.appendChild(h('div', { class:'lbl', id:'l_' + key.replace(/\./g, '_') }, label, o.req ? h('span', { class:'req' }, ' *') : null)); }
  w.appendChild(control);
  if(o.note){ w.appendChild(h('small', { class:'note' }, o.note)); }
  w.appendChild(h('small', { class:'err', role:'alert' }));
  return w;
}
function tInput(key, o){
  o = o || {};
  var i = h('input', { type:'text', value:cur.a[key] || '', maxlength:o.max || 120, placeholder:o.ph || '', 'aria-labelledby':'l_' + key, list:o.list });
  i.addEventListener('input', function(){ cur.a[key] = i.value; touch(key); });
  return i;
}
function tArea(key, o){
  o = o || {};
  var i = h('textarea', { maxlength:2000, placeholder:o.ph || '', 'aria-labelledby':'l_' + key }); i.value = cur.a[key] || '';
  i.addEventListener('input', function(){ cur.a[key] = i.value; touch(key); });
  return i;
}
function selectOf(list, value, onchange, id){
  var s = h('select', { 'aria-labelledby':id });
  s.appendChild(h('option', { value:'' }, t('choose')));
  list.forEach(function(x){ s.appendChild(h('option', { value:x.code, selected:value === x.code }, lab(x))); });
  s.addEventListener('change', function(){ onchange(s.value); });
  return s;
}
function sel(key, list, o){ return selectOf(list, cur.a[key], function(v){ cur.a[key] = v; touch(key); if(o && o.after){ o.after(); } }, 'l_' + key); }
function codeOrText(list, text){
  var n = norm(text);
  for(var i = 0; i < list.length; i++){ if(norm(list[i].ar) === n || norm(list[i].en) === n){ return list[i].code; } }
  return text;
}
/** Searchable field that also accepts the person's own value (native list + free typing). */
function combo(key, list, o){
  o = o || {};
  var id = 'dl_' + key.replace(/\./g, '_'), dl = h('datalist', { id:id });
  list.forEach(function(x){ dl.appendChild(h('option', { value:lab(x) })); });
  var cv = o.get ? o.get() : cur.a[key], shown = cv, f = null;
  for(var i = 0; i < list.length; i++){ if(list[i].code === cv){ f = list[i]; } }
  if(f){ shown = lab(f); }
  var inp = h('input', { type:'text', list:id, value:shown || '', maxlength:120, placeholder:o.ph || '', 'aria-labelledby':'l_' + key.replace(/\./g, '_'), autocomplete:'off' });
  inp.addEventListener('input', function(){ var v = codeOrText(list, inp.value.trim()); if(o.set){ o.set(v); } else { cur.a[key] = v; } touch(key); });
  return h('div', null, inp, dl);
}
function radios(key, list, o){
  o = o || {};
  var box = h('div', { class:'btns', role:'radiogroup', 'aria-labelledby':'l_' + key });
  function paint(){ Array.prototype.forEach.call(box.children, function(b){ var on = b.getAttribute('data-v') === String(cur.a[key] || ''); b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); }); }
  list.forEach(function(x){
    box.appendChild(h('button', { type:'button', class:'opt', role:'radio', 'data-v':x.code, onclick:function(){ cur.a[key] = x.code; paint(); touch(key); if(o.after){ o.after(); } } }, lab(x)));
  });
  paint(); return box;
}
function checks(key, list){
  var box = h('div', { class:'checks' });
  list.forEach(function(x){
    var cb = h('input', { type:'checkbox', checked:cur.a[key].indexOf(x.code) >= 0 });
    cb.addEventListener('change', function(){ var s = cur.a[key].filter(function(c){ return c !== x.code; }); if(cb.checked){ s.push(x.code); } cur.a[key] = s; touch(key); });
    box.appendChild(h('label', { class:'check' }, cb, h('span', null, lab(x))));
  });
  return box;
}

/* ---------- step 1: software picker ---------- */
var pickFilter = 'all', pickQuery = '';
function softwarePicker(){
  var host = h('div');
  var search = h('input', { type:'text', placeholder:t('search_ph'), 'aria-label':t('search_ph'), autocomplete:'off' });
  var filters = h('div', { class:'filters', role:'group' });
  var list = h('div', { class:'list', role:'radiogroup', 'aria-labelledby':'l_software' });
  var custom = h('div', { class:'box', style:'margin-top:10px' });
  function drawFilters(){
    clear(filters);
    [['all','f_all'],['pos','f_pos'],['erp','f_erp'],['accounting','f_accounting']].forEach(function(p){
      filters.appendChild(h('button', { type:'button', class:'chipf' + (pickFilter === p[0] ? ' on' : ''), 'aria-pressed':pickFilter === p[0] ? 'true' : 'false', onclick:function(){ pickFilter = p[0]; drawFilters(); drawList(); } }, t(p[1])));
    });
  }
  function drawList(){
    clear(list);
    var q = norm(pickQuery), n = 0;
    CAT.SOFTWARE.forEach(function(s){
      if(pickFilter !== 'all' && s.group !== pickFilter){ return; }
      if(q && norm(s.ar).indexOf(q) < 0 && norm(s.en).indexOf(q) < 0){ return; }
      n++;
      var on = cur.a.software === s.id;
      list.appendChild(h('div', { class:'row' + (on ? ' on' : ''), role:'radio', 'aria-checked':on ? 'true' : 'false', tabindex:'0', onclick:function(){ choose(s.id); }, onkeydown:function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); choose(s.id); } } },
        h('input', { type:'radio', tabindex:'-1', checked:on, 'aria-hidden':'true' }), h('span', null, lab(s))));
    });
    if(!n){ list.appendChild(h('div', { class:'row muted' }, t('no_results'))); }
    var on2 = cur.a.software === 'custom';
    list.appendChild(h('div', { class:'row' + (on2 ? ' on' : ''), role:'radio', 'aria-checked':on2 ? 'true' : 'false', tabindex:'0', onclick:function(){ choose('custom'); }, onkeydown:function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); choose('custom'); } } },
      h('input', { type:'radio', tabindex:'-1', checked:on2, 'aria-hidden':'true' }), h('span', null, t('not_listed'))));
  }
  function drawCustom(){
    clear(custom); custom.hidden = cur.a.software !== 'custom'; if(custom.hidden){ return; }
    var nm = tInput('custom_name', { max:120, ph:t('custom_name') }); 
    var types = [{ code:'pos', ar:t('f_pos'), en:t('f_pos') }, { code:'erp', ar:t('f_erp'), en:t('f_erp') }, { code:'accounting', ar:t('f_accounting'), en:t('f_accounting') }];
    var ty = selectOf(types, cur.a.custom_group, function(v){ cur.a.custom_group = v || 'accounting'; cur.a.functions = []; touch('functions'); drawFunctions(); }, 'l_custom_type');
    ty.removeChild(ty.firstChild);
    custom.appendChild(h('div', { class:'grid' }, fieldWrap('custom_name', t('custom_name'), nm, { req:true }), fieldWrap('custom_type', t('custom_type'), ty)));
    custom.appendChild(h('small', { class:'note' }, t('custom_note')));
  }
  function choose(id){
    if(readOnly()){ return; }
    var before = curGroup(); cur.a.software = id;
    if(id !== 'custom'){ cur.a.custom_name = ''; }
    var after = curGroup();
    if(before !== after){ cur.a.functions = []; cur.a.functions_other = ''; }
    drawList(); drawCustom(); drawFunctions(); touch('software'); touch('custom_name');
    var nm = $('#form [data-f="custom_name"] input'); if(id === 'custom' && nm){ nm.focus(); }
  }
  search.addEventListener('input', function(){ pickQuery = search.value; drawList(); });
  search.value = pickQuery;
  host.appendChild(search); host.appendChild(filters);
  host.appendChild(h('div', { class:'picker' }, list)); host.appendChild(custom);
  drawFilters(); drawList(); drawCustom();
  return host;
}

/* ---------- step 1: functions (nothing selected by default) ---------- */
var fnHost = null;
function drawFunctions(){
  if(!fnHost){ return; }
  clear(fnHost);
  var g = curGroup();
  if(!g){ fnHost.appendChild(h('div', { class:'muted' }, t('fn_first'))); return; }
  var list = CAT.FUNCTIONS[g] || [], a = cur.a;
  var all = h('input', { type:'checkbox' });
  var boxes = [];
  function sync(){ var every = list.length > 0 && list.every(function(x){ return a.functions.indexOf(x.code) >= 0; }); all.checked = every; }
  all.addEventListener('change', function(){
    var keepOther = a.functions.indexOf('other') >= 0;
    a.functions = all.checked ? list.map(function(x){ return x.code; }) : [];
    if(keepOther){ a.functions.push('other'); }
    boxes.forEach(function(b){ b.cb.checked = a.functions.indexOf(b.code) >= 0; });
    touch('functions');
  });
  fnHost.appendChild(h('label', { class:'check', style:'margin-bottom:8px;font-weight:600' }, all, h('span', null, t('select_all'))));
  var grid = h('div', { class:'checks' });
  list.forEach(function(x){
    var cb = h('input', { type:'checkbox', checked:a.functions.indexOf(x.code) >= 0 });
    cb.addEventListener('change', function(){ a.functions = a.functions.filter(function(c){ return c !== x.code; }); if(cb.checked){ a.functions.push(x.code); } sync(); touch('functions'); });
    boxes.push({ code:x.code, cb:cb }); grid.appendChild(h('label', { class:'check' }, cb, h('span', null, lab(x))));
  });
  fnHost.appendChild(grid);
  var other = h('input', { type:'checkbox', checked:a.functions.indexOf('other') >= 0 });
  var otherText = h('input', { type:'text', maxlength:120, placeholder:t('fn_other_ph'), value:a.functions_other || '', 'aria-label':t('fn_other_ph') });
  otherText.hidden = !other.checked;
  other.addEventListener('change', function(){
    a.functions = a.functions.filter(function(c){ return c !== 'other'; }); if(other.checked){ a.functions.push('other'); } else { a.functions_other = ''; otherText.value = ''; }
    otherText.hidden = !other.checked; if(other.checked){ otherText.focus(); } touch('functions'); touch('functions_other');
  });
  otherText.addEventListener('input', function(){ a.functions_other = otherText.value; touch('functions_other'); });
  fnHost.appendChild(h('div', { style:'margin-top:8px' }, h('label', { class:'check' }, other, h('span', null, t('other_specify'))), otherText));
  fnHost.appendChild(h('div', { 'data-f':'functions_other' }, h('small', { class:'err', role:'alert' })));
  sync();
}
function step1(form){
  var a = cur.a;
  form.appendChild(h('h2', null, t('step1')));
  if(!signedIn){ form.appendChild(h('div', { class:'banner info' }, t('step1_note'))); }
  form.appendChild(h('div', { class:'grid' },
    fieldWrap('software', t('q_software'), softwarePicker(), { req:true, wide:true }),
    fieldWrap('role', t('q_role'), combo('role', CAT.OPTIONS.professional_role, { ph:t('role_ph') }), { req:true }),
    fieldWrap('duration', t('q_duration'), sel('duration', CAT.DURATIONS), { req:true })));
  fnHost = h('div');
  form.appendChild(h('div', { style:'margin-top:14px' }, fieldWrap('functions', t('q_functions'), fnHost, { req:true, wide:true })));
  drawFunctions();
}

/* ---------- step 2 ---------- */
var intHost = null;
function landsNote(){ return t('lands', curName() || (lang === 'ar' ? 'المنتج' : 'product')); }
function drawIntegrations(){
  if(!intHost){ return; }
  clear(intHost); var a = cur.a;
  var none = h('input', { type:'checkbox', checked:a.no_integrations });
  none.addEventListener('change', function(){ a.no_integrations = none.checked; if(none.checked){ a.integrations = []; Object.keys(cur.errs).forEach(function(k){ if(k.indexOf('integrations') === 0){ delete cur.errs[k]; } }); } drawIntegrations(); touch('integrations'); });
  intHost.appendChild(h('label', { class:'check', style:'font-weight:600' }, none, h('span', null, t('int_none'))));
  var names = h('datalist', { id:'dl_int' });
  CAT.INTEGRATION_SYSTEMS.forEach(function(s){ names.appendChild(h('option', { value:lab(s) })); });
  intHost.appendChild(names);
  a.integrations.forEach(function(x, i){
    var k = 'integrations.' + i + '.';
    var nm = h('input', { type:'text', list:'dl_int', maxlength:80, value:x.name || '', placeholder:t('int_name_ph'), 'aria-labelledby':'l_integrations_' + i + '_name', autocomplete:'off' });
    nm.addEventListener('input', function(){ a.integrations[i].name = nm.value; touch(k + 'name'); });
    var pu = h('input', { type:'text', maxlength:200, value:x.purpose || '', 'aria-labelledby':'l_integrations_' + i + '_purpose' });
    pu.addEventListener('input', function(){ a.integrations[i].purpose = pu.value; touch(k + 'purpose'); });
    var ob = h('div', { class:'btns', role:'radiogroup', 'aria-labelledby':'l_integrations_' + i + '_outcome' });
    function paint(){ Array.prototype.forEach.call(ob.children, function(b){ var on = b.getAttribute('data-v') === a.integrations[i].outcome; b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); }); }
    CAT.INTEGRATION_OUTCOMES.forEach(function(o){ ob.appendChild(h('button', { type:'button', class:'opt', role:'radio', 'data-v':o.code, onclick:function(){ a.integrations[i].outcome = o.code; paint(); touch(k + 'outcome'); } }, lab(o))); });
    paint();
    var ex = h('textarea', { maxlength:2000, 'aria-labelledby':'l_integrations_' + i + '_experience' }); ex.value = x.experience || '';
    ex.addEventListener('input', function(){ a.integrations[i].experience = ex.value; touch(k + 'experience'); });
    intHost.appendChild(h('div', { class:'entry' },
      fieldWrap(k + 'name', t('int_name'), nm, { req:true }), fieldWrap(k + 'purpose', t('int_purpose'), pu, { req:true }),
      fieldWrap(k + 'outcome', t('int_how'), ob, { req:true }), fieldWrap(k + 'experience', t('int_exp'), ex, { note:landsNote() }),
      h('div', null, h('button', { type:'button', class:'link', onclick:function(){ a.integrations.splice(i, 1); Object.keys(cur.errs).forEach(function(q){ if(q.indexOf('integrations.') === 0){ delete cur.errs[q]; } }); drawIntegrations(); touch('integrations'); }, text:t('int_remove') }))));
  });
  if(!a.no_integrations){
    intHost.appendChild(h('button', { type:'button', class:'btn ghost small', onclick:function(){ a.no_integrations = false; a.integrations.push({ name:'', purpose:'', outcome:'', experience:'' }); drawIntegrations(); touch('integrations'); var ins = intHost.querySelectorAll('.entry'); var last = ins[ins.length - 1]; if(last){ var c = last.querySelector('input'); if(c){ c.focus(); } } }, text:t('int_add') }));
  }
  if(cur.errs){ Object.keys(cur.errs).forEach(function(k){ if(k.indexOf('integrations') === 0){ setErr(k, cur.errs[k]); } }); }
}
function compliance(){
  var box = h('div', { class:'matrix' });
  CAT.COMPLIANCE_ROWS.forEach(function(r){
    var row = h('div', { class:'mrow' }, h('div', { style:'font-weight:600' }, lab(r)));
    var g = h('div', { class:'btns', role:'radiogroup', 'aria-label':lab(r) });
    function paint(){ Array.prototype.forEach.call(g.children, function(b){ var on = b.getAttribute('data-v') === cur.a.compliance[r.code]; b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); }); }
    CAT.COMPLIANCE_STATUS.forEach(function(s){ g.appendChild(h('button', { type:'button', class:'opt', role:'radio', 'data-v':s.code, onclick:function(){ cur.a.compliance[r.code] = s.code; paint(); touch('compliance'); } }, lab(s))); });
    paint(); row.appendChild(g); box.appendChild(row);
  });
  return box;
}
var movedHost = null;
function drawMoved(){
  if(!movedHost){ return; } clear(movedHost);
  if(!isNo(cur.a.still_using)){ return; }
  movedHost.appendChild(h('div', { class:'grid wide' },
    fieldWrap('moved_to', t('q_moved'), combo('moved_to', softwareOptions(), { ph:t('prev_ph') })),
    fieldWrap('moved_reason', t('q_moved_why'), tArea('moved_reason'))));
}
function softwareOptions(){ return CAT.SOFTWARE.map(function(s){ return { code:s.id, ar:s.ar, en:s.en }; }); }
function step2(form){
  var a = cur.a;
  form.appendChild(h('h2', null, t('step2')));
  var g = h('div', { class:'grid' });
  g.appendChild(fieldWrap('business_type', t('q_btype'), sel('business_type', CAT.OPTIONS.business_type), { req:true }));
  g.appendChild(fieldWrap('business_name', t('q_bname'), tInput('business_name'), { req:true, note:t('bname_note') }));
  g.appendChild(fieldWrap('company_size', t('q_size'), sel('company_size', CAT.SIZES), { req:true }));
  g.appendChild(fieldWrap('deciders', t('q_deciders'), checks('deciders', CAT.OPTIONS.decision_maker), { req:true, wide:true }));
  g.appendChild(fieldWrap('golive_time', t('q_golive'), sel('golive_time', CAT.OPTIONS.golive_time), { req:true }));
  g.appendChild(fieldWrap('longer_than_told', t('q_longer'), sel('longer_than_told', CAT.OPTIONS.longer_than_told), { req:true }));
  g.appendChild(fieldWrap('implementer', t('q_impl'), sel('implementer', CAT.OPTIONS.implementer)));
  form.appendChild(g);
  intHost = h('div');
  form.appendChild(h('div', { style:'margin-top:14px' }, fieldWrap('integrations', t('q_integ'), intHost, { req:true, wide:true })));
  drawIntegrations();
  form.appendChild(h('div', { style:'margin-top:14px' }, fieldWrap('compliance', t('q_comp'), compliance(), { req:true, wide:true })));
  var g2 = h('div', { class:'grid', style:'margin-top:14px' });
  g2.appendChild(fieldWrap('difficulty', t('q_diff'), tArea('difficulty'), { wide:true, note:landsNote() }));
  g2.appendChild(fieldWrap('wishlist', t('q_wish'), tArea('wishlist'), { req:true, wide:true, note:t('min30_hint') + ' ' + landsNote() }));
  g2.appendChild(fieldWrap('who_not_buy', t('q_whonot'), tArea('who_not_buy', { ph:t('whonot_ph') }), { req:true, wide:true, note:t('min30_hint') + ' ' + landsNote() }));
  g2.appendChild(fieldWrap('annual_cost', t('q_cost'), sel('annual_cost', CAT.OPTIONS.annual_cost), { req:true }));
  var prev = softwareOptions().concat([{ code:'none', ar:t('prev_none'), en:t('prev_none') }]);
  g2.appendChild(fieldWrap('previous_software', t('q_prev'), combo('previous_software', prev, { ph:t('prev_ph') }), { req:true }));
  g2.appendChild(fieldWrap('still_using', t('q_still'), sel('still_using', CAT.OPTIONS.still_using, { after:drawMoved }), { req:true }));
  form.appendChild(g2);
  movedHost = h('div', { style:'margin-top:14px' }); form.appendChild(movedHost); drawMoved();
}

/* ---------- step 3 ---------- */
var relHost = null;
function ratingRow(key, labelKey, unrated){
  var row = h('div', { class:'rate' }, h('div', { style:'font-weight:600' }, t(labelKey)));
  var g = h('div', { class:'btns', role:'radiogroup', 'aria-label':t(labelKey) });
  function paint(){ Array.prototype.forEach.call(g.children, function(b){ var on = b.getAttribute('data-v') === String(cur.a[key] || ''); b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); }); }
  [1, 2, 3, 4, 5].forEach(function(n){ g.appendChild(h('button', { type:'button', class:'opt', role:'radio', 'data-v':String(n), onclick:function(){ cur.a[key] = String(n); paint(); touch('ratings'); } }, String(n))); });
  if(unrated){ g.appendChild(h('button', { type:'button', class:'opt', role:'radio', 'data-v':'unrated', onclick:function(){ cur.a[key] = 'unrated'; paint(); touch('ratings'); } }, t('unable'))); }
  paint(); row.appendChild(g); return row;
}
function drawRel(){
  if(!relHost){ return; } clear(relHost);
  if(cur.a.relationship && cur.a.relationship !== 'rel_none'){ relHost.appendChild(fieldWrap('relationship_detail', t('q_rel_detail'), tInput('relationship_detail', { max:600 }), { req:true })); }
}
function step3(form){
  var a = cur.a;
  form.appendChild(h('h2', null, t('step3')));
  var box = h('div'); box.appendChild(h('small', { class:'note' }, t('rate_hint')));
  box.appendChild(ratingRow('overall', 'r_overall', false)); box.appendChild(ratingRow('ease', 'r_ease', false));
  box.appendChild(ratingRow('support', 'r_support', true)); box.appendChild(ratingRow('value', 'r_value', true));
  form.appendChild(fieldWrap('ratings', t('q_ratings'), box, { req:true, wide:true }));
  var g = h('div', { class:'grid', style:'margin-top:14px' });
  g.appendChild(fieldWrap('choose_again', t('q_again'), radios('choose_again', CAT.OPTIONS.would_choose_again), { req:true }));
  g.appendChild(fieldWrap('recommend', t('q_recommend'), radios('recommend', CAT.OPTIONS.recommend), { req:true }));
  g.appendChild(fieldWrap('relationship', t('q_rel'), sel('relationship', CAT.OPTIONS.relationship, { after:function(){ drawRel(); } }), { req:true, wide:true }));
  form.appendChild(g);
  relHost = h('div', { style:'margin-top:10px' }); form.appendChild(relHost); drawRel();
  var decl = h('input', { type:'checkbox', checked:a.declaration });
  decl.addEventListener('change', function(){ a.declaration = decl.checked; touch('declaration'); });
  form.appendChild(h('div', { style:'margin-top:14px' }, fieldWrap('declaration', null, h('label', { class:'check' }, decl, h('span', null, t('declaration'), h('span', { class:'req' }, ' *'))), { wide:true })));
  var anon = h('input', { type:'checkbox', checked:a.anonymous });
  anon.addEventListener('change', function(){ a.anonymous = anon.checked; touch('anonymous'); });
  form.appendChild(h('div', { style:'margin-top:8px' }, h('label', { class:'check' }, anon, h('span', null, t('anonymous'))), h('small', { class:'note' }, t('anon_note'))));
}

/* =====================================================================================
 * Page chrome: top bar, the two progress indicators, step chips, navigation, preview
 * ===================================================================================== */
function submittedCount(){ return reviews.filter(function(r){ return r.status === 'pending' || r.status === 'approved'; }).length; }
function profilePct(){
  var p = ST.profile || {}, ok = [ST.avatar, p.full_name, p.email, p.phone, p.professional_role, p.experience_years, (ST.specialties || []).length, p.consultant_bio, p.linkedin_url].filter(function(x){ return !!x; }).length;
  return Math.round(ok / 9 * 100);
}
function topBar(){
  var links = h('div', { class:'links' });
  links.appendChild(h('button', { type:'button', class:'btn ghost small', onclick:function(){ lang = lang === 'ar' ? 'en' : 'ar'; lsSet('nexiz_lang', lang); renderApp(); }, text:t('lang_btn') }));
  if(view === 'profile'){ links.appendChild(h('a', { class:'btn ghost small', href:'/expert/frame', text:t('to_reviews') })); }
  else if(signedIn){ links.appendChild(h('a', { class:'btn ghost small', href:'/expert/frame?view=profile', text:t('to_profile') })); }
  else { links.appendChild(h('a', { class:'btn ghost small', href:'/login?next=%2Fexpert', target:'_top', text:t('si_email') })); }
  return h('div', { class:'top' }, h('h1', null, view === 'profile' ? t('title_profile') : t('title_review')), links);
}
function statusChip(st){ return h('span', { class:'chip-status ' + st }, t('s_' + st)); }
function renderProgress(){
  var host = $('#progress'); if(!host){ return; }
  clear(host);
  var n = submittedCount(), key = 'p' + Math.min(3, n);
  var slots = h('div', { class:'slots' + (reviews.length > 3 ? ' many' : '') });
  var count = Math.max(3, reviews.length + (cur && !cur.id && screen === 'wizard' && reviews.length >= 3 ? 1 : 0));
  for(var i = 0; i < count; i++){
    (function(r, idx){
      if(r){
        var active = cur && cur.id === r.id && screen !== 'overview';
        slots.appendChild(h('button', { type:'button', class:'slot filled' + (active ? ' active' : ''), onclick:function(){ openReview(r); } }, h('b', null, r.software_name || t('slot_unsaved')), statusChip(r.status)));
      } else {
        var isNew = !!cur && !cur.id && screen !== 'overview' && idx === reviews.length && (cur.a.software || signedIn === false);
        slots.appendChild(h('button', { type:'button', class:'slot' + (isNew ? ' active' : ''), onclick:startNew }, isNew && curName() ? h('b', null, curName()) : h('span', { class:'muted' }, t('slot_new')), isNew ? statusChip('draft') : null));
      }
    })(reviews[i], i);
  }
  host.appendChild(h('div', { class:'card' }, h('div', { class:'slot-line' }, h('b', null, t('rev_progress')), h('span', { class:'muted small' }, t(key))), h('div', { style:'height:10px' }), slots, h('div', { class:'note', style:'margin-top:8px' }, t('never_req'))));
  if(signedIn){
    var pct = profilePct();
    host.appendChild(h('div', { class:'card', style:'padding:12px 20px' }, h('div', { class:'slot-line' }, h('b', null, t('prof_progress')), h('span', { class:'small' }, pct + '%')), h('div', { class:'bar', style:'margin:6px 0' }, h('i', { style:'width:' + pct + '%' })), h('a', { class:'small', href:'/expert/frame?view=profile' }, t('prof_now'))));
  }
}
function whyPanel(){
  var d = h('details', { class:'why' }, h('summary', null, t('why_t')), h('p', null, t('why_1')), h('p', null, t('why_2')), h('p', null, t('why_3')), h('p', null, t('why_4')), h('p', { class:'muted' }, t('why_5')));
  if(!signedIn && reviews.length === 0){ d.open = true; }
  return d;
}
var STEP_KEYS = {
  1:['software','role','duration','functions'],
  2:['business_type','business_name','company_size','deciders','golive_time','longer_than_told','integrations','compliance','difficulty','wishlist','who_not_buy','annual_cost','previous_software','still_using'],
  3:['overall','ease','support','value','choose_again','recommend','relationship','declaration']
};
function anyFilled(n){
  var a = cur.a;
  return STEP_KEYS[n].some(function(k){ var v = a[k]; if(k === 'integrations'){ return a.no_integrations || a.integrations.length > 0; } if(k === 'compliance'){ return Object.keys(v).length > 0; } return Array.isArray(v) ? v.length > 0 : v === true || (typeof v === 'string' && v !== ''); });
}
function stepState(n){
  var errs = validateAll(cur.a), bad = Object.keys(errs).some(function(k){ return stepOf(k) === n; });
  if(!bad){ return 'done'; }
  return (cur.step === n || anyFilled(n)) ? 'progress' : 'todo';
}
function renderChips(){
  var host = $('#chips'); if(!host){ return; } clear(host);
  [1, 2, 3].forEach(function(n){
    var st = stepState(n);
    host.appendChild(h('button', { type:'button', class:'stepchip ' + st + (cur.step === n ? ' current' : ''), 'aria-current':cur.step === n ? 'step' : null, onclick:function(){ gotoStep(n); } },
      h('span', { class:'dot' }, st === 'done' ? '\u2713' : String(n)), h('span', null, t('step' + n)), h('span', { class:'st' }, t('st_' + st))));
  });
}
function renderNav(form){
  var step = cur.step, grp = h('div', { class:'grp' });
  if(step > 1){ grp.appendChild(h('button', { type:'button', class:'btn ghost', onclick:function(){ gotoStep(step - 1); }, text:t('back') })); }
  if(step < 3){ grp.appendChild(h('button', { type:'button', class:'btn', onclick:nextClicked, text:t('next') })); }
  else { grp.appendChild(h('button', { type:'button', class:'btn', onclick:submitClicked, text:t('submit') })); }
  grp.appendChild(h('button', { type:'button', class:'btn ghost', onclick:saveLater, text:t('save_later') }));
  form.appendChild(h('div', { class:'nav' }, grp, h('div', { class:'save' })));
  renderSaveBar();
}
function renderStepForm(){
  var form = $('#form'); clear(form);
  [null, step1, step2, step3][cur.step](form);
  renderNav(form);
  applyErrs(false);
}
function renderWizard(body){
  var main = h('div', null, h('div', { id:'chips', class:'steps' }), h('div', { class:'card', id:'form' }));
  var aside = h('div', { class:'aside' }, h('div', { class:'card', id:'preview' }), h('div', { class:'card small muted' }, t('verified_note')));
  body.appendChild(h('div', { class:'two' }, main, aside));
  renderChips(); renderStepForm(); renderPreview();
}
function renderPreview(){
  var host = $('#preview'); if(!host){ return; }
  clear(host); previewInto(host, cur.a, cur.status);
}
function previewInto(host, a, status){
  host.appendChild(h('h3', { style:'margin-top:0' }, t('preview_t')));
  var sw = softwareById(a.software), name = sw ? lab(sw) : (a.software === 'custom' ? a.custom_name : '');
  if(!name && !a.role && !a.overall){ host.appendChild(h('p', { class:'muted' }, t('pv_empty'))); host.appendChild(h('small', { class:'note' }, t('preview_note'))); return; }
  var pv = h('div', { class:'pv' });
  pv.appendChild(h('div', { class:'who' }, h('b', null, name || '\u2014'), statusChip(status || 'draft')));
  var role = codeOrLabel(CAT.OPTIONS.professional_role, a.role), dur = a.duration ? lab(CAT.DURATIONS.filter(function(d){ return d.code === a.duration; })[0]) : '';
  pv.appendChild(h('div', { class:'muted small' }, [role, dur].filter(Boolean).join(' \u00b7 ')));
  pv.appendChild(h('div', { class:'muted small' }, a.anonymous ? t('pv_anon') : ((ST.user && ST.user.name) || '')));
  var n = Number(a.overall); if(n >= 1 && n <= 5){ pv.appendChild(h('div', { class:'stars', 'aria-label':n + '/5' }, '\u2605\u2605\u2605\u2605\u2605'.slice(0, n) + '\u2606\u2606\u2606\u2606\u2606'.slice(0, 5 - n))); }
  var g = curGroup(), fl = [];
  if(g){ (CAT.FUNCTIONS[g] || []).forEach(function(x){ if(a.functions.indexOf(x.code) >= 0){ fl.push(lab(x)); } }); }
  if(a.functions.indexOf('other') >= 0 && a.functions_other){ fl.push(a.functions_other); }
  if(fl.length){ pv.appendChild(h('div', null, h('div', { class:'small muted' }, t('pv_fns')), h('div', null, fl.map(function(x){ return h('span', { class:'tag' }, x); })))); }
  if(a.integrations.length){ pv.appendChild(h('div', null, h('div', { class:'small muted' }, t('pv_integ')), a.integrations.filter(function(x){ return x.name; }).map(function(x){ var o = CAT.INTEGRATION_OUTCOMES.filter(function(q){ return q.code === x.outcome; })[0]; return h('div', { class:'small' }, x.name + (o ? ' \u2014 ' + lab(o) : '')); }))); }
  [['q_diff', a.difficulty], ['q_wish', a.wishlist], ['q_whonot', a.who_not_buy]].forEach(function(p){ if(p[1]){ pv.appendChild(h('div', null, h('div', { class:'small muted' }, t(p[0])), h('div', { style:'white-space:pre-wrap' }, p[1].slice(0, 400)))); } });
  host.appendChild(pv); host.appendChild(h('small', { class:'note', style:'display:block;margin-top:8px' }, t('preview_note')));
}
function codeOrLabel(list, v){ for(var i = 0; i < list.length; i++){ if(list[i].code === v){ return lab(list[i]); } } return v || ''; }

/* ---------- navigation ---------- */
function gotoStep(n){
  if(readOnly()){ return; }
  if(!signedIn && n > 1){ nextClicked(); return; }
  if(n > 1 && !cur.a.software){ cur.errs = Object.assign(cur.errs, { software:'software' }); if(cur.step !== 1){ cur.step = 1; renderStepForm(); renderChips(); } applyErrs(true); return; }
  cur.step = n; renderStepForm(); renderChips();
  if(signedIn){ queueSave(); }
  window.scrollTo(0, 0);
}
function stepErrors(step){
  var all = validateAll(cur.a), out = {};
  Object.keys(all).forEach(function(k){ if(stepOf(k) === step){ out[k] = all[k]; } });
  return out;
}
function nextClicked(){
  var errs = stepErrors(cur.step);
  Object.keys(cur.errs).forEach(function(k){ if(stepOf(k) === cur.step){ delete cur.errs[k]; } });
  if(Object.keys(errs).length){ Object.assign(cur.errs, errs); renderChips(); applyErrs(true); return; }
  if(!signedIn){ deviceWrite(); screen = 'signin'; renderApp(); return; }
  if(cur.step < 3){ cur.step += 1; renderStepForm(); renderChips(); doSave(false); window.scrollTo(0, 0); }
}
function saveLater(){
  if(!signedIn){ deviceWrite(); screen = 'signin'; renderApp(); return; }
  if(!cur.a.software){ cur.errs = Object.assign(cur.errs, { software:'software' }); if(cur.step !== 1){ cur.step = 1; renderStepForm(); renderChips(); } applyErrs(true); return; }
  doSave(false).then(function(r){ if(r.ok){ flashMsg = { kind:'ok', text:'saved_later' }; screen = 'overview'; renderApp(); } });
}
function submitClicked(){
  var errs = validateAll(cur.a), keys = Object.keys(errs);
  if(!signedIn){ nextClicked(); return; }
  if(keys.length){
    cur.errs = errs;
    var lowest = Math.min.apply(null, keys.map(stepOf));
    if(lowest !== cur.step){ cur.step = lowest; renderStepForm(); }
    renderChips(); applyErrs(true); return;
  }
  doSave(true).then(function(r){
    if(r.ok){ lsDel('nexiz_t_' + r.review.id); cur.status = r.review.status; screen = 'done'; renderApp(); }
    else if(r.errors){ cur.errs = r.errors; var ks = Object.keys(r.errors); cur.step = Math.min.apply(null, ks.map(stepOf)); renderStepForm(); renderChips(); applyErrs(true); }
  });
}
function openReview(r){
  var go = function(){ cur = fromDto(r); screen = (r.status === 'pending' || r.status === 'approved') ? 'readonly' : 'wizard'; renderApp(); };
  if(signedIn && cur && cur.dirty && !readOnly() && cur.a.software){ doSave(false).then(go); } else { go(); }
}
function startNew(){
  if(!signedIn){ return; }
  var go = function(){ cur = newReview(); activeMs = 0; screen = 'wizard'; renderApp(); window.scrollTo(0, 0); };
  if(cur && cur.dirty && !readOnly() && cur.a.software){ doSave(false).then(go); } else { go(); }
}

/* ---------- screens ---------- */
function renderOverview(body){
  body.appendChild(h('div', { class:'card' },
    reviews.map(function(r){
      return h('div', { class:'slot-line', style:'padding:10px 0;border-bottom:1px solid var(--line)' },
        h('div', null, h('b', null, r.software_name || t('slot_unsaved')), ' ', statusChip(r.status),
          r.status === 'pending' ? h('div', { class:'note' }, t('s_pending_note')) : r.status === 'approved' ? h('div', { class:'note' }, t('s_approved_note')) : r.status === 'rejected' && r.reject_reason ? h('div', { class:'err', style:'display:block' }, t('s_rejected_note', lab(r.reject_reason))) : null),
        h('button', { type:'button', class:'btn ghost small', onclick:function(){ openReview(r); }, text:(r.status === 'pending' || r.status === 'approved') ? t('view_') : r.status === 'rejected' ? t('edit_resubmit') : t('continue_') }));
    }),
    h('div', { class:'big-actions' }, h('button', { type:'button', class:'btn', onclick:startNew, text:t('add_another') }))));
}
function renderReadonly(body){
  var card = h('div', { class:'card' }, h('h2', null, curName()), statusChip(cur.status), h('p', { class:'muted' }, cur.status === 'approved' ? t('s_approved_note') : t('s_pending_note')));
  card.appendChild(h('div', { class:'big-actions' }, h('button', { type:'button', class:'btn ghost', onclick:function(){ screen = 'overview'; renderApp(); }, text:t('to_reviews') })));
  var pv = h('div', { class:'card' }); previewInto(pv, cur.a, cur.status);
  body.appendChild(h('div', { class:'two' }, card, pv));
}
function renderDone(body){
  body.appendChild(h('div', { class:'card' }, h('div', { class:'banner ok' }, t('done_t')),
    h('div', { class:'big-actions' },
      h('a', { class:'btn', href:'/expert/frame?view=profile', text:t('prof_now') }),
      h('button', { type:'button', class:'btn ghost', onclick:function(){ screen = 'overview'; renderApp(); }, text:t('prof_later') }),
      h('button', { type:'button', class:'btn ghost', onclick:startNew, text:t('add_another') }))));
}
function renderSignin(body){
  var P = ST.providers || {};
  var box = h('div', { class:'card', style:'max-width:520px;margin:20px auto' }, h('h2', null, t('si_title')), h('p', { class:'muted' }, t('si_text')));
  var acts = h('div', { style:'display:grid;gap:10px;margin-top:10px' });
  if(P.google){ acts.appendChild(h('a', { class:'btn ghost', target:'_top', href:'/auth/google?next=%2Fexpert', text:t('si_google') })); }
  if(P.linkedin){ acts.appendChild(h('a', { class:'btn ghost', target:'_top', href:'/auth/linkedin?next=%2Fexpert', text:t('si_linkedin') })); }
  acts.appendChild(h('a', { class:'btn', target:'_top', href:'/login?next=%2Fexpert', text:t('si_email') }));
  acts.appendChild(h('a', { class:'btn ghost', target:'_top', href:'/register', text:t('si_register') }));
  acts.appendChild(h('button', { type:'button', class:'link', onclick:function(){ screen = 'wizard'; renderApp(); }, text:t('si_cancel') }));
  box.appendChild(acts); box.appendChild(h('div', { class:'save device', style:'margin-top:12px' }));
  body.appendChild(box); renderSaveBar();
}
function renderApp(){
  var app = $('#app'); clear(app);
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; document.title = (view === 'profile' ? t('title_profile') : t('title_review')) + ' | Nexiz';
  app.appendChild(topBar()); app.appendChild(h('div', { id:'flash' })); paintFlash();
  if(view === 'profile'){ renderProfile(app); return; }
  app.appendChild(h('div', { id:'progress', class:'progress-block' })); renderProgress();
  if(screen === 'wizard' || screen === 'overview'){ app.appendChild(whyPanel()); }
  var body = h('div', { id:'body' }); app.appendChild(body);
  if(screen === 'overview'){ renderOverview(body); }
  else if(screen === 'readonly'){ renderReadonly(body); }
  else if(screen === 'done'){ renderDone(body); }
  else if(screen === 'signin'){ renderSignin(body); }
  else { renderWizard(body); }
}

/* =====================================================================================
 * Professional profile (separate page). Saving it never touches a review.
 * ===================================================================================== */
var P = ST.profile || {};
function pErr(f, code){ setErr(f, code); }
function pTouch(f){ if(f){ clearErr(f); } var s = $('#psave'); if(s){ clear(s); } renderProfilePreview(); renderProfileBar(); }
function pInput(key, o){
  o = o || {};
  var i = h('input', { type:o.type || 'text', value:P[key] || '', maxlength:o.max || 120, placeholder:o.ph || '', 'aria-labelledby':'l_' + key, dir:o.ltr ? 'ltr' : null, autocomplete:o.ac || 'off' });
  i.addEventListener('input', function(){ P[key] = i.value; touch(key); });
  return i;
}
function yearOptions(){ var y = new Date().getFullYear(), out = []; for(var i = 0; i < 47; i++){ out.push({ code:String(y - i), ar:String(y - i), en:String(y - i) }); } return out; }
function multiChips(list, values, options, ph, key){
  var id = 'dl_' + key, dl = h('datalist', { id:id });
  options.forEach(function(x){ dl.appendChild(h('option', { value:lab(x) })); });
  var chips = h('div', { class:'chips' }), inp = h('input', { type:'text', list:id, maxlength:120, placeholder:ph, 'aria-labelledby':'l_' + key, autocomplete:'off' });
  function draw(){
    clear(chips);
    values.forEach(function(v, i){ chips.appendChild(h('span', { class:'chip' }, codeOrLabel(options, v), h('button', { type:'button', 'aria-label':t('p_remove_item'), onclick:function(){ values.splice(i, 1); draw(); touch(key); } }, '\u00d7'))); });
  }
  function addIt(){ var v = codeOrText(options, inp.value.trim()); if(!v){ return; } if(!(options.some(function(o){ return o.code === v; })) && badShort(v)){ pErr(key, 'short'); return; } if(values.indexOf(v) < 0){ values.push(v); } inp.value = ''; draw(); touch(key); }
  inp.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); addIt(); } });
  draw();
  return h('div', null, h('div', { style:'display:flex;gap:8px' }, inp, h('button', { type:'button', class:'btn ghost small', onclick:addIt, text:t('p_add') })), dl, chips);
}
function photoBlock(){
  var wrap = h('div', { class:'upload' });
  var prev = h('div'); 
  function draw(){
    clear(prev);
    if(ST.avatar){ prev.appendChild(h('img', { class:'avatar', src:ST.avatar, alt:'' })); }
    else { prev.appendChild(h('div', { class:'avatar', 'aria-hidden':'true' }, (P.full_name || '?').trim().slice(0, 1))); }
  }
  var file = h('input', { type:'file', id:'photo', accept:'image/jpeg,image/png,image/webp' });
  var status = h('small', { class:'note' }, ST.avatar && ST.avatar_from_provider ? t('p_photo_prefill') : t('p_photo_note'));
  file.addEventListener('change', function(){
    var f = file.files && file.files[0]; if(!f){ return; }
    if(['image/jpeg', 'image/png', 'image/webp'].indexOf(f.type) < 0 || f.size > 5 * 1024 * 1024){ clear(status).appendChild(frag(t('p_photo_note'))); status.className = 'err'; file.value = ''; return; }
    var url = URL.createObjectURL(f), img = new Image();
    img.onload = function(){
      var sc = Math.min(1, 480 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * sc); c.height = Math.round(img.naturalHeight * sc);
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      ST.avatar = c.toDataURL('image/jpeg', 0.85); ST.avatar_from_provider = false; URL.revokeObjectURL(url); draw(); clear(status).appendChild(frag(t('p_photo_note'))); status.className = 'note'; touch('photo');
    };
    img.src = url;
  });
  var pick = h('label', { class:'up-drop', for:'photo' }, h('span', null, ST.avatar ? t('p_change') : t('p_choose')));
  var rm = h('button', { type:'button', class:'link', onclick:function(){ ST.avatar = ''; ST.avatar_from_provider = false; file.value = ''; draw(); touch('photo'); }, text:t('p_remove') });
  draw();
  wrap.appendChild(prev); wrap.appendChild(h('div', { style:'display:grid;gap:6px' }, h('div', null, pick, file), ST.avatar ? rm : null, status));
  return wrap;
}
function entryList(list, makeFields, blankItem, addKey){
  var host = h('div');
  function draw(){
    clear(host);
    list.forEach(function(item, i){
      host.appendChild(h('div', { class:'entry' }, makeFields(item, i), h('div', null, h('button', { type:'button', class:'link', onclick:function(){ list.splice(i, 1); draw(); touch(addKey); }, text:t('p_remove_item') }))));
    });
    host.appendChild(h('button', { type:'button', class:'btn ghost small', onclick:function(){ list.push(blankItem()); draw(); touch(addKey); }, text:t(addKey === 'certs' ? 'p_add_cert' : 'p_add_project') }));
  }
  draw(); return host;
}
function subInput(item, key, label, o){
  o = o || {};
  var id = 'l_' + Math.random().toString(36).slice(2, 8);
  var i = h('input', { type:o.type || 'text', value:item[key] || '', maxlength:o.max || 120, dir:o.ltr ? 'ltr' : null, 'aria-labelledby':id });
  i.addEventListener('input', function(){ item[key] = i.value; touch('sub'); });
  return h('div', { class:'field' }, h('div', { class:'lbl', id:id }, label), i);
}
function subCombo(item, key, label, list){
  var id = 'l_' + Math.random().toString(36).slice(2, 8), dl = 'dl_' + id, d = h('datalist', { id:dl });
  list.forEach(function(x){ d.appendChild(h('option', { value:lab(x) })); });
  var i = h('input', { type:'text', list:dl, maxlength:120, value:codeOrLabel(list, item[key]), 'aria-labelledby':id, autocomplete:'off' });
  i.addEventListener('input', function(){ item[key] = codeOrText(list, i.value.trim()); touch('sub'); });
  return h('div', { class:'field' }, h('div', { class:'lbl', id:id }, label), i, d);
}
function subSelect(item, key, label, list){
  var id = 'l_' + Math.random().toString(36).slice(2, 8);
  return h('div', { class:'field' }, h('div', { class:'lbl', id:id }, label), selectOf(list, item[key], function(v){ item[key] = v; touch('sub'); }, id));
}
function renderProfileBar(){
  var pct = profilePct(), b = $('#pbar'); if(!b){ return; }
  clear(b); b.appendChild(h('div', { class:'slot-line' }, h('b', null, t('prof_progress')), h('span', { class:'small' }, pct + '%'))); b.appendChild(h('div', { class:'bar', style:'margin-top:6px' }, h('i', { style:'width:' + pct + '%' })));
}
function renderProfilePreview(){
  var host = $('#ppreview'); if(!host){ return; } clear(host);
  host.appendChild(h('h3', { style:'margin-top:0' }, t('p_pv_t')));
  var pv = h('div', { class:'pv' });
  pv.appendChild(h('div', { class:'who' }, ST.avatar ? h('img', { class:'avatar', src:ST.avatar, alt:'' }) : h('div', { class:'avatar' }, (P.full_name || '?').trim().slice(0, 1)),
    h('div', null, h('b', null, P.full_name || t('p_pv_name')), h('div', { class:'muted small' }, codeOrLabel(CAT.OPTIONS.professional_role, P.professional_role)))));
  if(P.experience_years){ pv.appendChild(h('div', { class:'small muted' }, codeOrLabel(CAT.OPTIONS.experience, P.experience_years))); }
  if(P.consultant_bio){ pv.appendChild(h('div', { style:'white-space:pre-wrap' }, P.consultant_bio.slice(0, 400))); }
  if((ST.specialties || []).length){ pv.appendChild(h('div', null, ST.specialties.map(function(v){ return h('span', { class:'tag' }, codeOrLabel(CAT.OPTIONS.expertise, v)); }))); }
  pv.appendChild(h('div', { class:'small muted' }, t('p_reviews_count') + ': ' + submittedCount() + ' \u00b7 ' + t('p_published_count') + ': ' + reviews.filter(function(r){ return r.status === 'approved'; }).length));
  host.appendChild(pv); host.appendChild(h('small', { class:'note', style:'display:block;margin-top:8px' }, t('p_pv_note')));
}
function profileErrors(){
  var e = {};
  if(!P.full_name){ e.full_name = 'required'; } else if(badShort(P.full_name)){ e.full_name = 'short'; }
  if(!P.email){ e.email = 'required'; } else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(P.email)){ e.email = 'email'; }
  if(!P.professional_role){ e.professional_role = 'required'; } else if(!CAT.OPTIONS.professional_role.some(function(o){ return o.code === P.professional_role; }) && badShort(P.professional_role)){ e.professional_role = 'short'; }
  if(!P.experience_years){ e.experience_years = 'required'; }
  if(P.linkedin_url && !/^https?:\/\/([a-z0-9-]+\.)*linkedin\.com(\/|$)/i.test(P.linkedin_url.trim())){ e.linkedin_url = 'linkedin'; }
  return e;
}
function saveProfileClicked(){
  var errs = profileErrors(), keys = Object.keys(errs);
  ['full_name','email','professional_role','experience_years','linkedin_url'].forEach(clearErr);
  if(keys.length){
    keys.forEach(function(k){ pErr(k, errs[k]); });
    var w = wrapOf(keys[0]); var c = w && w.querySelector('input,select,textarea'); if(c){ c.focus(); } return;
  }
  var s = $('#psave'); clear(s); s.className = 'save saving'; s.appendChild(frag(t('sv_saving')));
  var body = { profile:Object.assign({}, P, { language:lang }), avatar:ST.avatar || '', specialties:ST.specialties || [], services:ST.services || [], certificates:ST.certificates || [], projects:ST.projects || [] };
  fetch('/expert/api/profile', { method:'POST', credentials:'same-origin', headers:{ 'content-type':'application/json' }, body:JSON.stringify(body) })
    .then(function(r){ return r.json().catch(function(){ return {}; }); })
    .then(function(d){
      clear(s);
      if(d.ok){ if(d.photo_url){ ST.avatar = d.photo_url; } s.className = 'save saved'; s.appendChild(frag(t('sv_saved', clock(new Date(d.savedAt || Date.now()))))); flash('ok', 'p_saved_msg'); renderProfileBar(); renderProfilePreview(); }
      else { s.className = 'save failed'; s.appendChild(h('button', { type:'button', class:'link', onclick:saveProfileClicked, text:t('sv_failed') })); flash('err', d.error || 'e_failed'); }
    })
    .catch(function(){ clear(s); s.className = 'save failed'; s.appendChild(h('button', { type:'button', class:'link', onclick:saveProfileClicked, text:t('sv_failed') })); });
}
function renderProfile(app){
  ST.specialties = ST.specialties || []; ST.services = ST.services || []; ST.certificates = ST.certificates || []; ST.projects = ST.projects || [];
  app.appendChild(h('div', { class:'card', id:'pbar', style:'padding:12px 20px' })); renderProfileBar();
  var form = h('div', { class:'card', id:'form' });
  form.appendChild(h('div', { class:'note' }, t('p_hint')));
  form.appendChild(h('h3', null, t('p_photo'))); form.appendChild(photoBlock());
  var g = h('div', { class:'grid', style:'margin-top:14px' });
  g.appendChild(fieldWrap('full_name', t('p_name'), pInput('full_name', { ac:'name' }), { req:true }));
  g.appendChild(fieldWrap('email', t('p_email'), pInput('email', { type:'email', max:254, ltr:true, ac:'email' }), { req:true }));
  g.appendChild(fieldWrap('phone', t('p_phone'), pInput('phone', { type:'tel', max:30, ltr:true, ac:'tel' })));
  g.appendChild(fieldWrap('professional_role', t('p_role'), combo('professional_role', CAT.OPTIONS.professional_role, { ph:t('role_ph'), get:function(){ return P.professional_role; }, set:function(v){ P.professional_role = v; } }), { req:true }));
  g.appendChild(fieldWrap('experience_years', t('p_exp'), selectOf(CAT.OPTIONS.experience, P.experience_years, function(v){ P.experience_years = v; touch('experience_years'); }, 'l_experience_years'), { req:true }));
  g.appendChild(fieldWrap('linkedin_url', t('p_linkedin'), pInput('linkedin_url', { type:'url', max:400, ltr:true, ph:'https://www.linkedin.com/in/...' }), { note:t('p_linkedin_note') }));
  var bio = h('textarea', { maxlength:2000, 'aria-labelledby':'l_consultant_bio' }); bio.value = P.consultant_bio || ''; bio.addEventListener('input', function(){ P.consultant_bio = bio.value; touch('consultant_bio'); });
  g.appendChild(fieldWrap('consultant_bio', t('p_bio'), bio, { wide:true }));
  g.appendChild(fieldWrap('expertise', t('p_expertise'), multiChips(null, ST.specialties, CAT.OPTIONS.expertise, t('p_expertise_ph'), 'expertise'), { wide:true }));
  form.appendChild(g);
  var consent = h('input', { type:'checkbox', checked:!!P.consent_expert }), svcHost = h('div', { style:'margin-top:10px' });
  function drawSvc(){ clear(svcHost); if(P.consent_expert){ svcHost.appendChild(fieldWrap('services', t('p_services'), multiChips(null, ST.services, CAT.OPTIONS.service, t('p_expertise_ph'), 'services'), { wide:true })); } }
  consent.addEventListener('change', function(){ P.consent_expert = consent.checked; drawSvc(); touch('consent'); });
  form.appendChild(h('div', { style:'margin-top:14px' }, h('label', { class:'check' }, consent, h('span', null, t('p_consent')))));
  form.appendChild(svcHost); drawSvc();
  form.appendChild(h('h3', null, t('p_certs'))); form.appendChild(h('div', { class:'note' }, t('p_certs_skip')));
  form.appendChild(entryList(ST.certificates, function(c){ return h('div', { class:'grid' }, subCombo(c, 'title', t('p_cert_name'), CAT.OPTIONS.cert_title), subCombo(c, 'issuer', t('p_cert_issuer'), CAT.OPTIONS.cert_issuer), subSelect(c, 'year', t('p_cert_year'), yearOptions()), subInput(c, 'link', t('p_cert_url'), { type:'url', max:400, ltr:true })); }, function(){ return { title:'', issuer:'', year:'', link:'' }; }, 'certs'));
  form.appendChild(h('h3', null, t('p_projects')));
  form.appendChild(entryList(ST.projects, function(p){ return h('div', { class:'grid' }, subInput(p, 'title', t('p_proj_title')), subCombo(p, 'type', t('p_proj_type'), CAT.OPTIONS.project_type), subCombo(p, 'role', t('p_proj_role'), CAT.OPTIONS.project_role), subCombo(p, 'industry', t('p_proj_ind'), CAT.OPTIONS.industry), subInput(p, 'software', t('p_proj_sw')), subSelect(p, 'year', t('p_proj_year'), yearOptions()), subInput(p, 'result', t('p_proj_result'), { max:2000 })); }, function(){ return { title:'', type:'', role:'', industry:'', software:'', year:'', result:'' }; }, 'projects'));
  form.appendChild(h('div', { class:'nav' }, h('div', { class:'grp' }, h('button', { type:'button', class:'btn', onclick:saveProfileClicked, text:t('p_save') }), h('a', { class:'btn ghost', href:'/expert/frame', text:t('to_reviews') })), h('div', { id:'psave', class:'save' })));
  app.appendChild(h('div', { class:'two' }, form, h('div', { class:'aside' }, h('div', { class:'card', id:'ppreview' }))));
  renderProfilePreview();
}

/* =====================================================================================
 * Start
 * ===================================================================================== */
['input', 'click', 'keydown'].forEach(function(ev){ document.addEventListener(ev, activity, true); });
window.addEventListener('pagehide', function(){
  if(view !== 'review' || !cur || readOnly()){ return; }
  if(!signedIn){ if(cur.a.software){ deviceWrite(); } return; }
  if(saveTimer && cur.a.software && window.navigator.sendBeacon){
    try{ window.navigator.sendBeacon('/expert/api/review', new Blob([JSON.stringify({ id:cur.id, step:cur.step, submit:false, language:lang, answers:cur.a })], { type:'application/json' })); }catch(e){}
  }
});
(function start(){
  if(view === 'profile'){ renderApp(); return; }
  var dev = deviceRead();
  cur = newReview();
  if(signedIn){
    screen = reviews.length ? 'overview' : 'wizard';
    if(dev){ migrateDevice(dev); return; }
    renderApp(); return;
  }
  if(dev){ cur.a = mergeA(dev.a); activeMs = dev.ms || 0; }
  renderApp(); if(dev){ setSave('device'); }
})();

</script>
</body>
</html>
`;

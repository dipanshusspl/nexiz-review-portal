import { escapeHtml } from './email';
import type { Message } from './index';

const wrap = (inner: string) =>
  `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#0f201b;line-height:1.6">${inner}<hr style="border:0;border-top:1px solid #dbe3df;margin:20px 0"><p style="font-size:12px;color:#53645d">Nexiz AI - independent of every vendor listed.</p></div>`;
const btn = (url: string, label: string) =>
  `<p><a href="${escapeHtml(url)}" style="background:#0a5c45;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${escapeHtml(label)}</a></p>`;

export function confirmationEmail(to: string, name: string, product: string, url: string): Message {
  const n = escapeHtml(name), p = escapeHtml(product);
  return {
    to, subject: `Please confirm your review of ${product} / يرجى تأكيد تقييمك`,
    html: wrap(
      `<p>Hello ${n},</p><p>A Nexiz team member collected your review of <b>${p}</b>. Please confirm it is yours with one tap. It is published as Verified only after you confirm.</p>${btn(url, 'Confirm my review')}` +
      `<div dir="rtl" style="margin-top:20px"><p>مرحبًا ${n}،</p><p>جمع أحد فريق نكسيز تقييمك لـ <b>${p}</b>. يرجى تأكيده بنقرة واحدة، ولا يُنشر كـ«موثّق» إلا بعد التأكيد.</p>${btn(url, 'تأكيد تقييمي')}</div>` +
      `<p style="font-size:12px;color:#53645d">Your name, contact details and company are never published.</p>`),
    text: `Hello ${name},\nPlease confirm your review of ${product}: ${url}\n\nمرحبًا ${name}، يرجى تأكيد تقييمك لـ ${product}: ${url}`,
  };
}

export function liveEmail(to: string, name: string, product: string, url: string): Message {
  const n = escapeHtml(name), p = escapeHtml(product);
  return {
    to, subject: `Your review of ${product} is live / تقييمك منشور الآن`,
    html: wrap(`<p>Hello ${n},</p><p>Your review of <b>${p}</b> has been read and is now live.</p>${btn(url, 'View the product page')}<div dir="rtl"><p>مرحبًا ${n}، تمت مراجعة تقييمك لـ <b>${p}</b> وهو منشور الآن.</p></div>`),
    text: `Hello ${name},\nYour review of ${product} is live: ${url}\n\nتقييمك لـ ${product} منشور الآن.`,
  };
}

export function rejectionEmail(to: string, name: string, product: string, reasonEn: string, reasonAr: string): Message {
  const n = escapeHtml(name), p = escapeHtml(product);
  return {
    to, subject: `Your review of ${product} was not published / لم يُنشر تقييمك`,
    html: wrap(`<p>Hello ${n},</p><p>We could not publish your review of <b>${p}</b>.</p><p><b>Reason:</b> ${escapeHtml(reasonEn)}</p><p>You can edit your review and submit it again. We never edit the text of a review ourselves.</p><div dir="rtl"><p>مرحبًا ${n}، تعذّر نشر تقييمك لـ <b>${p}</b>.</p><p><b>السبب:</b> ${escapeHtml(reasonAr)}</p><p>يمكنك تعديل تقييمك وإرساله مجددًا. نحن لا نعدّل نص أي تقييم.</p></div>`),
    text: `Hello ${name},\nWe could not publish your review of ${product}.\nReason: ${reasonEn}\n\nالسبب: ${reasonAr}`,
  };
}

export function passwordResetOtpEmail(to: string, name: string, otp: string, minutes: number): Message {
  const n = escapeHtml(name || '');
  const code = `<p style="font-size:30px;letter-spacing:8px;font-weight:700;background:#f2f6f4;border-radius:10px;padding:14px;text-align:center;margin:16px 0">${escapeHtml(otp)}</p>`;
  return {
    to, subject: 'Your Nexiz password reset code / رمز إعادة تعيين كلمة المرور',
    html: wrap(
      `<p>Hello ${n},</p><p>Use this code to reset your Nexiz password. It is valid for ${minutes} minutes.</p>${code}` +
      `<p style="font-size:13px;color:#53645d">If you did not ask for this, ignore this email. Your password will not change. Never share this code with anyone.</p>` +
      `<div dir="rtl" style="margin-top:20px"><p>مرحبًا ${n}،</p><p>استخدم هذا الرمز لإعادة تعيين كلمة مرور حسابك في نكسيز. صالح لمدة ${minutes} دقائق.</p>${code}<p style="font-size:13px;color:#53645d">إذا لم تطلب ذلك فتجاهل هذه الرسالة، ولن تتغيّر كلمة مرورك. لا تشارك هذا الرمز مع أي أحد.</p></div>`),
    text: `Hello ${name},\nYour Nexiz password reset code is ${otp}. It is valid for ${minutes} minutes. If you did not ask for it, ignore this email.\n\nرمز إعادة تعيين كلمة المرور: ${otp} (صالح لمدة ${minutes} دقائق).`,
  };
}

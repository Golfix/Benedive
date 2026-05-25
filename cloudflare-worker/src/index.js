/**
 * BeneDive — Cloudflare Worker
 * Reçoit POST du formulaire de contact, envoie sur WhatsApp Cloud API.
 *
 * Secrets requis (à configurer via `wrangler secret put` ou dashboard CF) :
 *   - WHATSAPP_PHONE_NUMBER_ID : ID du numéro expéditeur (Meta Business Suite)
 *   - WHATSAPP_ACCESS_TOKEN    : Permanent Access Token (Meta Business Suite)
 *   - BENEDICTE_PHONE          : Numéro WhatsApp de Bénédicte au format E.164 sans +
 *                                (ex: "201558664187")
 *   - RESEND_API_KEY           : (optionnel) Token Resend pour email de backup
 *   - BENEDICTE_EMAIL          : (optionnel) Email de Bénédicte pour backup
 *
 * Vars (config publique, dans wrangler.toml) :
 *   - ALLOWED_ORIGIN : "https://www.benedive.com"
 */

const CORS_HEADERS = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
});

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

function corsResponse(origin, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...CORS_HEADERS(origin) },
  });
}

function safeOrigin(request, env) {
  const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
  const origin = request.headers.get('Origin') || '';
  if (allowed.includes(origin)) return origin;
  if (allowed.includes('*')) return '*';
  return allowed[0] || 'https://www.benedive.com';
}

function escapeMarkdown(s) {
  return String(s || '').replace(/[\*_\[\]]/g, ' ').trim();
}

function buildMessage(data) {
  const e = escapeMarkdown;
  const lines = [
    '*📩 Nouveau contact site BeneDive*',
    '',
    `*Prénom :* ${e(data.prenom)}`,
    data.nom ? `*Nom :* ${e(data.nom)}` : null,
    data.email ? `*Email :* ${e(data.email)}` : null,
    data.telephone ? `*Téléphone :* ${e(data.telephone)}` : null,
    data.prestation ? `*Prestation :* ${e(data.prestation)}` : null,
    data.dates ? `*Dates :* ${e(data.dates)}` : null,
    data.niveau ? `*Niveau :* ${e(data.niveau)}` : null,
    data.personnes ? `*Personnes :* ${e(data.personnes)}` : null,
    data.hotel ? `*Hôtel :* ${e(data.hotel)}` : null,
    '',
  ].filter(Boolean);

  if (data.message) {
    lines.push('*Message :*');
    lines.push(e(data.message));
    lines.push('');
  }

  lines.push(`_Envoyé le ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC_`);
  return lines.join('\n');
}

async function sendWhatsApp(env, text) {
  const url = `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: env.BENEDICTE_PHONE,
    type: 'text',
    text: { preview_url: false, body: text },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp API ${res.status}: ${err.slice(0, 300)}`);
  }
  return res.json();
}

async function sendEmailBackup(env, subject, html) {
  if (!env.RESEND_API_KEY || !env.BENEDICTE_EMAIL) return null;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BeneDive Site <noreply@benedive.com>',
      to: env.BENEDICTE_EMAIL,
      subject,
      html,
    }),
  });
  return res.ok;
}

function htmlEscape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildEmailHtml(data) {
  const rows = [
    ['Prénom', data.prenom],
    ['Nom', data.nom],
    ['Email', data.email],
    ['Téléphone', data.telephone],
    ['Prestation', data.prestation],
    ['Dates', data.dates],
    ['Niveau', data.niveau],
    ['Personnes', data.personnes],
    ['Hôtel', data.hotel],
  ].filter(([_, v]) => v).map(([k, v]) =>
    `<tr><td style="padding:6px 12px;color:#666;">${k}</td><td style="padding:6px 12px;"><b>${htmlEscape(v)}</b></td></tr>`
  ).join('');

  return `
  <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;color:#243B47;">
    <h2 style="color:#003B5C;">📩 Nouveau contact site BeneDive</h2>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    ${data.message ? `<h3 style="color:#003B5C;margin-top:24px;">Message :</h3><p>${htmlEscape(data.message).replace(/\n/g, '<br>')}</p>` : ''}
    <p style="margin-top:24px;color:#888;font-size:.85em;">Envoyé via le formulaire de contact de https://www.benedive.com</p>
  </div>
  `;
}

export default {
  async fetch(request, env, ctx) {
    const origin = safeOrigin(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS(origin) });
    }

    if (request.method !== 'POST') {
      return corsResponse(origin, { error: 'Method not allowed' }, 405);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return corsResponse(origin, { error: 'Invalid JSON' }, 400);
    }

    // ----- Honeypot anti-bot (champ caché non rempli en cas d'humain) -----
    if (data._honeypot) {
      // Silent success — on ne dit pas au bot qu'on l'a démasqué
      return corsResponse(origin, { success: true });
    }

    // ----- Validation basique -----
    if (!data.prenom || data.prenom.length < 2 || data.prenom.length > 80) {
      return corsResponse(origin, { error: 'Prénom requis' }, 400);
    }
    if (data.message && data.message.length > 4000) {
      return corsResponse(origin, { error: 'Message trop long' }, 400);
    }
    // Anti-spam léger : URL dans le prénom = bot
    if (/https?:\/\//i.test(data.prenom)) {
      return corsResponse(origin, { success: true }); // silent drop
    }

    // ----- Préparer + envoyer -----
    const text = buildMessage(data);
    let waOk = false, emailOk = false, lastError = null;

    try {
      await sendWhatsApp(env, text);
      waOk = true;
    } catch (e) {
      lastError = e.message;
      console.error('WhatsApp error:', e.message);
    }

    // Email backup (fire and forget si possible)
    try {
      emailOk = await sendEmailBackup(env, '📩 Nouveau contact BeneDive', buildEmailHtml(data));
    } catch (e) {
      console.error('Email error:', e.message);
    }

    if (!waOk && !emailOk) {
      return corsResponse(origin, { error: 'Envoi échoué, contactez via WhatsApp directement', detail: lastError }, 500);
    }

    return corsResponse(origin, { success: true, channels: { whatsapp: waOk, email: emailOk } });
  },
};

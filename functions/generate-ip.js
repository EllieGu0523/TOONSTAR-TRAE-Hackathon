/* ============================================================
 * ToonStar V2.0 — functions/generate-ip.js
 * Netlify Serverless Function
 *   API Key 只存在于服务端环境变量，绝不下发到浏览器。
 *
 * 环境变量（在 Netlify 后台 / .env 中配置）：
 *   IMAGE_PROVIDER   : 'fallback' | 'openai' | 'replicate'（默认 fallback）
 *   IMAGE_API_URL    : 上游生图接口地址
 *   IMAGE_API_KEY    : 上游 API Key（仅服务端可见）
 *   IMAGE_MODEL      : 可选，模型名
 *
 * 未配置时返回 503，前端会自动回退到本地 assets/demo 演示图，
 * 从而保证「AI 失败/超时 → fallback → 流程继续」。
 * ============================================================ */
const DEFAULT_IP = [
  '/assets/demo/ip-a.png',
  '/assets/demo/ip-b.png',
  '/assets/demo/ip-c.png'
];

function buildPrompt(subjectType, style, dna) {
  const name = (dna && dna.ipName) ? dna.ipName : 'a subject';
  const kw = (dna && Array.isArray(dna.keywords) && dna.keywords.length)
    ? dna.keywords.join(', ') : '';
  const color = (dna && dna.mainColor) ? dna.mainColor : '';
  const keep = (dna && dna.keepFeatures) ? dna.keepFeatures : '';
  return [
    `Create a cute, flat, non-anime mascot illustration of ${name}`,
    `subject type: ${subjectType || 'object'}`,
    `visual style: ${style || 'Flat Toon'}`,
    kw ? `keywords: ${kw}` : '',
    color ? `main color: ${color}` : '',
    keep ? `keep features: ${keep}` : '',
    'solid flat colors, simple shapes, round, brand-mascot style, white background, no text'
  ].filter(Boolean).join('; ');
}

/* 兼容 OpenAI Images / Replicate 两种常见返回结构，得到 3 个图片 url */
function extractUrls(data) {
  if (Array.isArray(data)) return data.filter(u => typeof u === 'string');
  const d = data || {};
  if (Array.isArray(d.urls)) return d.urls;
  if (Array.isArray(d.output)) return d.output;
  if (Array.isArray(d.data)) {
    return d.data.map(x => (x && (x.url || x.b64_json || x.image))).filter(Boolean);
  }
  return [];
}

async function callProvider(provider, prompt) {
  const url = process.env.IMAGE_API_URL;
  const key = process.env.IMAGE_API_KEY;

  if (provider === 'replicate') {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        input: {
          prompt,
          num_outputs: 3,
          aspect_ratio: '1:1'
        }
      })
    });
    if (!r.ok) throw new Error('replicate http ' + r.status);
    const json = await r.json();
    return extractUrls(json);
  }

  // openai 兼容（默认）
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.IMAGE_MODEL || undefined,
      prompt,
      n: 3,
      size: '1024x1024'
    })
  });
  if (!r.ok) throw new Error('upstream http ' + r.status);
  const json = await r.json();
  return extractUrls(json);
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload = {};
  try { payload = JSON.parse(event.body || '{}'); } catch (e) { /* ignore */ }
  const { subjectType, style, dna } = payload || {};

  const provider = process.env.IMAGE_PROVIDER || 'fallback';
  const configured = process.env.IMAGE_API_URL && process.env.IMAGE_API_KEY;

  // 未配置真实 AI：直接让前端走 fallback
  if (provider === 'fallback' || !configured) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ status: 'fallback', error: 'AI provider not configured', urls: DEFAULT_IP })
    };
  }

  try {
    const urls = await callProvider(provider, buildPrompt(subjectType, style, dna));
    if (urls.length < 3) throw new Error('upstream returned insufficient images');
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'success', urls: urls.slice(0, 3) }) };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ status: 'error', error: (err && err.message) || 'upstream failed', urls: DEFAULT_IP })
    };
  }
};
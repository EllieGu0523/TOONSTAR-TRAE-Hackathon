/* ============================================================
 * ToonStar V2.0 — ai.js
 * 统一生成入口 generateIP(photo, subjectType, style, dna)
 *   - 优先调用 serverless 函数（API Key 只存在于服务端环境变量）
 *   - 失败或 12 秒超时 → 自动 fallback 到本地 3 张 Demo 结果
 * 返回 Promise<{ status, urls }>，status: 'success' | 'fallback'
 * ============================================================ */

const AI_TIMEOUT_MS = 12000;

/* serverless 函数路径（Netlify：/.netlify/functions/generate-ip） */
const AI_ENDPOINT = '/.netlify/functions/generate-ip';

/* 本地 Demo 结果（非二次元，Flat IP 风格） */
function demoIPs() {
  return [
    'assets/demo/ip-a.png',
    'assets/demo/ip-b.png',
    'assets/demo/ip-c.png'
  ];
}

function withTimeout(ms, promise) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      v => { clearTimeout(t); resolve(v); },
      e => { clearTimeout(t); reject(e); }
    );
  });
}

/* 从 serverless 返回结果中提取 3 个 url；不规范则抛错触发 fallback */
function normalize(res) {
  if (!res || !Array.isArray(res.urls) || res.urls.length < 3) {
    throw new Error('bad response');
  }
  return { status: 'success', urls: res.urls.slice(0, 3) };
}

/**
 * @param {Object} payload
 *  { photo: string(dataURL), subjectType: string, style: string,
 *    dna: { ipName, keywords, mainColor, keepFeatures } }
 * @param {Function} onStatus 可选回调 (loading/success/error/fallback)
 */
async function generateIP(payload, onStatus) {
  const report = s => typeof onStatus === 'function' && onStatus(s);

  report('loading');

  try {
    const res = await withTimeout(AI_TIMEOUT_MS, fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }));

    report('success');
    return normalize(res);
  } catch (err) {
    console.warn('generateIP fallback:', err && err.message);
    report('fallback');
    return { status: 'fallback', urls: demoIPs() };
  }
}
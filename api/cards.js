const { createHash, timingSafeEqual } = require('node:crypto');

const MAX_MESSAGE_LENGTH = 2000;

function sendJson(res, status, data) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(data);
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ''), key };
}

function isOwner(req) {
  const configuredPassword = process.env.INBOX_PASSWORD;
  const authorization = req.headers.authorization || '';
  const suppliedPassword = authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : '';
  if (!configuredPassword || !suppliedPassword) return false;
  const expected = createHash('sha256').update(configuredPassword).digest();
  const actual = createHash('sha256').update(suppliedPassword).digest();
  return timingSafeEqual(expected, actual);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  }

  const config = getSupabaseConfig();
  if (!config) {
    return sendJson(res, 503, { error: 'Penyimpanan ucapan belum dikonfigurasi.' });
  }

  if (req.method === 'POST') {
    const rawLength = Number(req.headers['content-length'] || 0);
    if (rawLength > 8000) return sendJson(res, 413, { error: 'Permintaan terlalu besar.' });

    const body = typeof req.body === 'string'
      ? (() => { try { return JSON.parse(req.body); } catch { return null; } })()
      : req.body;
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message) return sendJson(res, 400, { error: 'Ucapan tidak boleh kosong.' });
    if (message.length > MAX_MESSAGE_LENGTH) {
      return sendJson(res, 400, { error: `Ucapan maksimal ${MAX_MESSAGE_LENGTH} karakter.` });
    }

    try {
      const upstream = await fetch(`${config.url}/rest/v1/greeting_cards`, {
        method: 'POST',
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ message })
      });
      if (!upstream.ok) {
        console.error('Supabase insert failed:', upstream.status, await upstream.text());
        return sendJson(res, 502, { error: 'Ucapan belum dapat disimpan. Silakan coba lagi.' });
      }
      const [card] = await upstream.json();
      return sendJson(res, 201, { id: card.id });
    } catch (error) {
      console.error('Greeting submission failed:', error);
      return sendJson(res, 502, { error: 'Layanan penyimpanan tidak dapat dihubungi.' });
    }
  }

  if (!isOwner(req)) return sendJson(res, 401, { error: 'Password inbox salah.' });

  try {
    const upstream = await fetch(
      `${config.url}/rest/v1/greeting_cards?select=id,message,created_at&order=created_at.desc&limit=5000`,
      {
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`
        }
      }
    );
    if (!upstream.ok) {
      console.error('Supabase inbox query failed:', upstream.status, await upstream.text());
      return sendJson(res, 502, { error: 'Ucapan tidak dapat dimuat.' });
    }
    return sendJson(res, 200, await upstream.json());
  } catch (error) {
    console.error('Greeting inbox failed:', error);
    return sendJson(res, 502, { error: 'Layanan penyimpanan tidak dapat dihubungi.' });
  }
};

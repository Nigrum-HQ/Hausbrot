export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { usuario, password } = req.body || {};

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  if (usuario === 'Hausbrot' && password === 'Bellavista2026') {
    return res.status(200).json({ ok: true, token: process.env.SESSION_TOKEN || 'hb-session-ok' });
  }

  return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
}

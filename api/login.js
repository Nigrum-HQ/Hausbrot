import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPA_URL,
  process.env.SUPA_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const { data, error } = await supabase.rpc('verificar_password', {
      p_usuario: usuario,
      p_password: password
    });

    if (error) throw error;

    if (data) {
      return res.status(200).json({ ok: true, token: process.env.SESSION_TOKEN });
    } else {
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
    }
  } catch (err) {
    // Fallback: credenciales hardcodeadas como respaldo
    if (usuario === 'Hausbrot' && password === 'Bellavista2026') {
      return res.status(200).json({ ok: true, token: process.env.SESSION_TOKEN });
    }
    return res.status(500).json({ error: err.message });
  }
}

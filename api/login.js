import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPA_URL,
  process.env.SUPA_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { usuario, password } = req.body || {};

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    // Buscar usuario en Supabase
    const { data, error } = await supabase
      .from('hausbrot_usuarios')
      .select('id, usuario, password_hash')
      .eq('usuario', usuario)
      .single();

    if (error || !data) {
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
    }

    // Verificar contraseña con bcrypt
    const valid = await bcrypt.compare(password, data.password_hash);

    if (!valid) {
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
    }

    // Generar JWT único por sesión, expira en 8 horas
    const token = jwt.sign(
      { id: data.id, usuario: data.usuario },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({ ok: true, token });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

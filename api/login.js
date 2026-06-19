import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

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
    const { data, error } = await supabase
      .from('hausbrot_usuarios')
      .select('id, usuario, password_hash')
      .eq('usuario', usuario)
      .single();

    if (error || !data) {
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
    }

    const valid = await bcrypt.compare(password, data.password_hash);

    if (!valid) {
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ id: data.id, usuario: data.usuario })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(secret);

    return res.status(200).json({ ok: true, token });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

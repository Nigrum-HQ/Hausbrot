import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPA_URL,
  process.env.SUPA_KEY
);

function autenticado(req) {
  const token = req.headers['x-session-token'];
  return token && token === process.env.SESSION_TOKEN;
}

export default async function handler(req, res) {
  if (!autenticado(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('hausbrot_data')
        .select('data')
        .eq('id', 1)
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { error } = await supabase
        .from('hausbrot_data')
        .update({ data: req.body })
        .eq('id', 1);

      if (error) throw error;
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

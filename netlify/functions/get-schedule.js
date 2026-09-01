// Devolve os dados de sala/turma/professor, mas só pra quem manda o hash certo da senha.
// A senha em si nunca trafega nem fica salva em lugar nenhum — só o hash SHA-256 dela,
// comparado com a variável de ambiente ACCESS_KEY_HASH (configurada no painel da Netlify).
import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response('JSON inválido', { status: 400 });
  }

  const keyHash = body && body.keyHash;
  const expected = process.env.ACCESS_KEY_HASH;

  if (!expected) {
    // Site publicado sem a variável de ambiente configurada — nunca libera nada por engano.
    return new Response('Servidor sem senha de acesso configurada (ACCESS_KEY_HASH ausente)', { status: 500 });
  }
  if (!keyHash || keyHash !== expected) {
    return new Response('Senha incorreta', { status: 401 });
  }

  const store = getStore('schedule');
  const data = await store.get('current', { type: 'json' });

  return new Response(JSON.stringify(data || []), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
};

export const config = {
  path: '/.netlify/functions/get-schedule',
};

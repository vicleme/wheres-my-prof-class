// Recebe uma atualização completa da grade e substitui os dados guardados no Netlify Blobs.
// Exige uma senha de administrador separada da senha de acesso geral (ADMIN_KEY_HASH),
// pra que ter a senha de leitura não seja suficiente pra sobrescrever os dados de todo mundo.
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

  const adminKeyHash = body && body.adminKeyHash;
  const data = body && body.data;
  const expected = process.env.ADMIN_KEY_HASH;

  if (!expected) {
    return new Response('Servidor sem senha de administrador configurada (ADMIN_KEY_HASH ausente)', { status: 500 });
  }
  if (!adminKeyHash || adminKeyHash !== expected) {
    return new Response('Senha de administrador incorreta', { status: 401 });
  }
  if (!Array.isArray(data)) {
    return new Response('Corpo inválido: "data" precisa ser um array', { status: 400 });
  }

  const store = getStore('schedule');
  await store.setJSON('current', data);

  return new Response(JSON.stringify({ ok: true, total: data.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = {
  path: '/.netlify/functions/save-schedule',
};

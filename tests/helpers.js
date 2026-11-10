import { createApp } from '../src/app.js';
import { createDatabase } from '../src/database/connection.js';

/**
 * Sobe a aplicação em uma porta aleatória com banco em memória
 * e devolve um cliente HTTP simples para os testes.
 */
export async function startTestServer({ clock } = {}) {
  const db = createDatabase(':memory:');
  const app = createApp({ db, clock });

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  async function request(method, url, body) {
    const res = await fetch(baseUrl + url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  }

  return {
    db,
    get: (url) => request('GET', url),
    post: (url, body) => request('POST', url, body),
    put: (url, body) => request('PUT', url, body),
    patch: (url, body) => request('PATCH', url, body),
    delete: (url) => request('DELETE', url),
    close: () =>
      new Promise((resolve) => {
        server.close(() => {
          db.close();
          resolve();
        });
      }),
  };
}

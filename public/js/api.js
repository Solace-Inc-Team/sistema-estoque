async function request(method, url, body) {
  const response = await fetch(`/api${url}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error?.message ?? 'Algo deu errado. Tente novamente.');
    error.details = data?.error?.details;
    throw error;
  }
  return data;
}

export const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body ?? {}),
  put: (url, body) => request('PUT', url, body ?? {}),
  patch: (url, body) => request('PATCH', url, body ?? {}),
  delete: (url) => request('DELETE', url),
};

/** Monta a query string ignorando valores vazios. */
export function qs(params) {
  const clean = Object.entries(params).filter(([, v]) => v !== '' && v != null);
  return clean.length ? `?${new URLSearchParams(clean)}` : '';
}

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  return res;
}

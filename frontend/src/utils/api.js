const TOKEN_KEY = "yemek_oneri_token";
const API_URL = import.meta.env.VITE_API_URL;

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...(options.headers || {}),
  };

  const url = path.startsWith("http")
    ? path
    : `${API_URL}${path}`;

  return fetch(url, {
    ...options,
    headers,
  });
}
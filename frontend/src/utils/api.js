const TOKEN_KEY = "yemek_oneri_token";

const DEFAULT_API = "https://yemek-onerme-backend.onrender.com";

function resolveApiUrl() {
  const raw = String(import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  if (!raw) return DEFAULT_API;
  // Vercel adresi yazılırsa /api istekleri yanlışlıkla statik siteye gider (404).
  if (raw.includes("vercel.app")) return DEFAULT_API;
  return raw;
}

const API_URL = resolveApiUrl();

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

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  return fetch(url, {
    ...options,
    headers,
  });
}
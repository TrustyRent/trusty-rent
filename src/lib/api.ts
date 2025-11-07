// src/lib/api.ts
import axios from "axios";

/**
 * Sorgente dell'URL API:
 * 1) usa NEXT_PUBLIC_API_URL se presente (Vercel/Prod)
 * 2) se siamo su vercel.app e l'env manca, fallback al backend Render
 * 3) altrimenti in dev usa 127.0.0.1:8000
 */
function resolveApiBase() {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/$/, "");
  if (env) return env;

  if (typeof window !== "undefined" && /\.vercel\.app$/.test(window.location.host)) {
    return "https://affitti-backend.onrender.com";
  }

  return "http://127.0.0.1:8000";
}

const API_URL = resolveApiBase();

let ACCESS_TOKEN: string | null = null;
export function setAccessToken(token: string | null) {
  ACCESS_TOKEN = token;
}
export function getAccessToken() {
  return ACCESS_TOKEN;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // cookie HttpOnly
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (ACCESS_TOKEN) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${ACCESS_TOKEN}`;
  }
  return config;
});

export default api;
